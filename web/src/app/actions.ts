"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stage0, stage2 } from "@/lib/moderation";

// ---------- onboarding ----------

export async function beginSession(formData: FormData) {
  if (formData.get("accept") !== "on") {
    redirect("/bem-vindo");
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    // nunca expor a mensagem crua (vem em inglês); a tela traduz o código
    redirect("/bem-vindo?erro=auth");
  }
  redirect("/bem-vindo/numero");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/bem-vindo");
}

// ---------- publicar ----------

export type ComposerState = {
  error?: string;
  piiWarning?: boolean;
  crisisNotice?: boolean;
  body?: string;
};

export async function createPost(
  _prev: ComposerState,
  formData: FormData
): Promise<ComposerState> {
  const body = String(formData.get("body") ?? "").trim();
  const topicId = Number(formData.get("topic_id") ?? 1);
  // checkbox HTML envia "on" quando marcado e nada quando desmarcado
  const repliesEnabled = formData.get("replies_enabled") === "on";
  const ackPii = formData.get("ack_pii") === "1";
  const ackCrisis = formData.get("ack_crisis") === "1";

  if (body.length === 0) return { error: "Escreva alguma coisa primeiro. 💙" };
  if (body.length > 2000) return { error: "O texto passou de 2.000 caracteres." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/bem-vindo");

  const s0 = stage0(body);
  if (s0.verdict === "blocked") {
    // mesmo bloqueado, quem está em crise vê o CVV junto com a recusa
    return { error: s0.reason, crisisNotice: s0.crisis, body };
  }

  // avisos de PII e crise aparecem JUNTOS (senão o usuário fica em ping-pong
  // eterno confirmando um e reabrindo o outro); nenhum dos dois bloqueia
  const needsPii = s0.pii && !ackPii;
  const needsCrisis = s0.crisis && !ackCrisis;
  if (needsPii || needsCrisis) {
    return { piiWarning: needsPii, crisisNotice: needsCrisis, body };
  }

  const s2 = await stage2(body);
  if (s2.violates) {
    return {
      error:
        s2.reason ??
        "Este texto viola as regras da comunidade e não foi publicado.",
      body,
    };
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    topic_id: topicId,
    body,
    replies_enabled: repliesEnabled,
  });

  if (error) {
    return { error: "Não conseguimos publicar agora. Seu texto está salvo aqui — tente de novo.", body };
  }

  revalidatePath("/");
  redirect("/?publicado=1");
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw new Error(`Não foi possível excluir o post: ${error.message}`);
  revalidatePath("/");
  redirect("/");
}

export async function toggleReplies(postId: string, enabled: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({ replies_enabled: enabled })
    .eq("id", postId);
  if (error) throw new Error(`Não foi possível alterar as respostas: ${error.message}`);
  revalidatePath(`/post/${postId}`);
}

export type EditState = { error?: string; ok?: boolean };

export async function updatePost(
  _prev: EditState,
  formData: FormData
): Promise<EditState> {
  const postId = String(formData.get("post_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!postId) return { error: "Post inválido." };
  if (body.length === 0) return { error: "Escreva alguma coisa primeiro. 💙" };
  if (body.length > 2000) return { error: "O texto passou de 2.000 caracteres." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/bem-vindo");

  // sem fluxo de PII/crise na edição — o texto já era público
  const s0 = stage0(body);
  if (s0.verdict === "blocked") {
    return { error: s0.reason };
  }

  const s2 = await stage2(body);
  if (s2.violates) {
    return {
      error:
        s2.reason ?? "Este texto viola as regras da comunidade e não foi salvo.",
    };
  }

  const { error } = await supabase
    .from("posts")
    .update({ body })
    .eq("id", postId);

  if (error) {
    if (error.message.includes("janela de edição")) {
      return {
        error:
          "O tempo de edição (15 minutos) já passou. Você ainda pode excluir o post.",
      };
    }
    return { error: "Não conseguimos salvar a edição agora. Tente de novo." };
  }

  revalidatePath(`/post/${postId}`);
  revalidatePath("/");
  return { ok: true };
}

// ---------- comentários ----------

export type CommentState = {
  error?: string;
  ok?: boolean;
  piiWarning?: boolean;
  crisisNotice?: boolean;
};

export async function createComment(
  _prev: CommentState,
  formData: FormData
): Promise<CommentState> {
  const body = String(formData.get("body") ?? "").trim();
  const postId = String(formData.get("post_id") ?? "");
  const parentId = String(formData.get("parent_id") ?? "") || null;
  const ackPii = formData.get("ack_pii") === "1";
  const ackCrisis = formData.get("ack_crisis") === "1";

  if (!postId) return { error: "Post inválido." };
  if (body.length === 0) return { error: "Escreva alguma coisa primeiro." };
  if (body.length > 1000) return { error: "A resposta passou de 1.000 caracteres." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/bem-vindo");

  const s0 = stage0(body);
  if (s0.verdict === "blocked") {
    return { error: s0.reason, crisisNotice: s0.crisis };
  }

  const needsPii = s0.pii && !ackPii;
  const needsCrisis = s0.crisis && !ackCrisis;
  if (needsPii || needsCrisis) {
    return { piiWarning: needsPii, crisisNotice: needsCrisis };
  }

  const s2 = await stage2(body);
  if (s2.violates) {
    return {
      error:
        s2.reason ?? "Esta resposta viola as regras da comunidade e não foi enviada.",
    };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    parent_id: parentId,
    body,
  });

  if (error) {
    if (error.message.includes("só para ser ouvido")) {
      return { error: "O autor pediu só para ser ouvido — respostas estão desativadas." };
    }
    return { error: "Não conseguimos enviar sua resposta agora. Tente de novo." };
  }

  revalidatePath(`/post/${postId}`);
  return { ok: true };
}

export async function deleteComment(commentId: string, postId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw new Error(`Não foi possível excluir a resposta: ${error.message}`);
  revalidatePath(`/post/${postId}`);
}

export async function hideComment(commentId: string, postId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("hide_comment", { comment_id: commentId });
  if (error) throw new Error(`Não foi possível ocultar a resposta: ${error.message}`);
  revalidatePath(`/post/${postId}`);
}

// ---------- reações ----------

export async function setReaction(postId: string, kind: number | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/bem-vindo");

  if (kind === null) {
    const { error } = await supabase.from("reactions").delete().eq("post_id", postId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("reactions")
      .upsert({ post_id: postId, user_id: user.id, kind });
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/post/${postId}`);
  revalidatePath("/");
}

// ---------- denúncias ----------

export type ReportState = { error?: string; ok?: boolean };

export async function reportContent(
  _prev: ReportState,
  formData: FormData
): Promise<ReportState> {
  const targetType = String(formData.get("target_type") ?? "");
  const targetId = String(formData.get("target_id") ?? "");
  const category = String(formData.get("category") ?? "");
  const detail = String(formData.get("detail") ?? "").trim() || null;

  if (!["post", "comment"].includes(targetType) || !targetId || !category) {
    return { error: "Selecione o motivo da denúncia." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/bem-vindo");

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    category,
    detail,
  });

  if (error && !error.message.includes("duplicate")) {
    return { error: "Não conseguimos registrar a denúncia. Tente de novo." };
  }

  revalidatePath("/");
  return { ok: true };
}

// ---------- notificações ----------

export async function markAllRead() {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  if (error) throw new Error(error.message);
  revalidatePath("/notificacoes");
}

// ---------- LGPD ----------

export async function deleteAccount(formData: FormData) {
  if (formData.get("confirm") !== "EXCLUIR") {
    redirect("/voce?erro=confirmacao");
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_me");
  if (error) {
    redirect("/voce?erro=exclusao");
  }
  await supabase.auth.signOut();
  redirect("/bem-vindo");
}
