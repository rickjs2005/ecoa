// Teste de ponta a ponta do banco do ECOA (roda direto contra o Supabase)
import { createClient } from "@supabase/supabase-js";

const URL = "https://duglkbtapxwngrbywbkf.supabase.co";
const KEY = "sb_publishable_w42fAp3Hv6TunYFF1rl1_w_wheq1iPk";

const results = [];
function check(name, ok, extra = "") {
  results.push({ name, ok, extra });
  console.log(`${ok ? "✅" : "❌"} ${name}${extra ? ` — ${extra}` : ""}`);
}

function newClient() {
  return createClient(URL, KEY, { auth: { persistSession: false } });
}

const A = newClient();
const B = newClient();

// 1. duas contas anônimas
const { data: authA, error: eA } = await A.auth.signInAnonymously();
const { data: authB, error: eB } = await B.auth.signInAnonymously();
check("signInAnonymously (2 contas)", !eA && !eB, eA?.message ?? eB?.message ?? "");

// 2. trigger criou perfis com número público
const { data: profA } = await A.from("profiles").select("public_number").single();
const { data: profB } = await B.from("profiles").select("public_number").single();
check(
  "perfis com número aleatório",
  !!profA?.public_number && !!profB?.public_number && profA.public_number !== profB.public_number,
  `A=#${profA?.public_number} B=#${profB?.public_number}`
);

// 3. A publica
const { data: post, error: ePost } = await A.from("posts")
  .insert({ user_id: authA.user.id, topic_id: 2, body: "Teste e2e do ECOA — hoje foi um dia difícil, mas segui em frente." })
  .select("id")
  .single();
check("publicar post", !ePost && !!post?.id, ePost?.message ?? "");
const postId = post?.id;

// 4. feed mostra o post com author_number (sem user_id)
const { data: feedA } = await B.from("feed_posts").select("*").eq("id", postId).single();
check(
  "feed_posts visível p/ outro usuário",
  feedA?.author_number === profA?.public_number && feedA?.comment_count === 0,
  `autor=#${feedA?.author_number}`
);

// 5. privacidade: user_id é ilegível por coluna
const { error: ePriv } = await B.from("posts").select("user_id").eq("id", postId);
check("user_id bloqueado (privilégio de coluna)", !!ePriv, ePriv?.message?.slice(0, 60) ?? "SEM ERRO (falha!)");

// 6. B reage (💙 kind=5) e comenta
const { error: eReact } = await B.from("reactions").upsert({ post_id: postId, user_id: authB.user.id, kind: 5 });
check("reagir", !eReact, eReact?.message ?? "");

const { error: eComment } = await B.from("comments").insert({ post_id: postId, user_id: authB.user.id, body: "Estou com você. 🤝" });
check("comentar", !eComment, eComment?.message ?? "");

// 7. stats agregadas via trigger
const { data: feed2 } = await A.from("feed_posts").select("reaction_counts, comment_count").eq("id", postId).single();
check(
  "triggers de stats (reação + comentário)",
  feed2?.reaction_counts?.[4] === 1 && feed2?.comment_count === 1,
  `counts=${JSON.stringify(feed2?.reaction_counts)} comments=${feed2?.comment_count}`
);

// 8. notificação de resposta chegou para A
const { data: notifs } = await A.from("notifications").select("actor_number, preview");
check(
  "notificação de resposta",
  notifs?.length === 1 && notifs[0].actor_number === profB.public_number,
  `de #${notifs?.[0]?.actor_number}: "${notifs?.[0]?.preview}"`
);

// 8b. cursor composto de paginação (sintaxe .or com timestamp citado)
const { data: pageData, error: ePage } = await A.from("feed_posts")
  .select("id")
  .or(`created_at.lt."${feedA.created_at}",and(created_at.eq."${feedA.created_at}",id.lt."${postId}")`)
  .order("created_at", { ascending: false })
  .limit(5);
check("cursor composto (keyset) aceito pelo PostgREST", !ePage && Array.isArray(pageData), ePage?.message ?? "");

// 8c. ocultar resposta decrementa comment_count (trigger de visibilidade)
const { data: cRow } = await B.from("comments").select("id").eq("post_id", postId).limit(1).single();
await A.rpc("hide_comment", { comment_id: cRow.id });
const { data: feed3 } = await A.from("feed_posts").select("comment_count").eq("id", postId).single();
check("ocultar resposta atualiza contador", feed3?.comment_count === 0, `comment_count=${feed3?.comment_count}`);

// 9. respostas desativadas ("só quero ser ouvido")
await A.from("posts").update({ replies_enabled: false }).eq("id", postId);
const { error: eClosed } = await B.from("comments").insert({ post_id: postId, user_id: authB.user.id, body: "mais um" });
check("bloqueio quando respostas desativadas", !!eClosed && eClosed.message.includes("ouvido"), eClosed?.message?.slice(0, 60) ?? "");

// 10. denúncia esconde do feed do denunciante
await B.from("reports").insert({ reporter_id: authB.user.id, target_type: "post", target_id: postId, category: "outro" });
const { data: feedB } = await B.from("feed_posts").select("id").eq("id", postId);
const { data: feedA2 } = await A.from("feed_posts").select("id").eq("id", postId);
check("denúncia oculta só p/ denunciante", feedB?.length === 0 && feedA2?.length === 1, `B vê ${feedB?.length}, A vê ${feedA2?.length}`);

// 11. frase de recuperação: A gera a frase e a conta renasce em "outro aparelho"
const PHRASE = "ponte tigre areia fogo brisa lume";
const { error: eSet } = await A.rpc("set_recovery_phrase", { phrase: PHRASE });
check("gerar frase de recuperação", !eSet, eSet?.message ?? "");

const R = newClient();
await R.auth.signInAnonymously();
const { error: eWrong } = await R.rpc("recover_account", {
  target_number: profA.public_number,
  phrase: "frase totalmente errada aqui",
});
check(
  "frase errada recusada (mensagem genérica)",
  !!eWrong && eWrong.message.includes("incorretos"),
  eWrong?.message ?? "SEM ERRO (falha!)"
);

const { error: eRec } = await R.rpc("recover_account", {
  target_number: profA.public_number,
  phrase: PHRASE,
});
check("recuperar conta em novo dispositivo", !eRec, eRec?.message ?? "");

const { data: profR } = await R.from("profiles").select("public_number").single();
const { data: feedRec } = await R.from("feed_posts").select("author_number").eq("id", postId).single();
check(
  "número e conteúdo preservados após recuperação",
  profR?.public_number === profA.public_number &&
    feedRec?.author_number === profA.public_number,
  `novo aparelho agora é #${profR?.public_number}`
);

const { data: oldProf } = await A.from("profiles").select("public_number");
check(
  "dispositivo antigo perde o acesso",
  (oldProf ?? []).length === 0,
  `perfis visíveis pela sessão antiga: ${oldProf?.length}`
);

// 12. LGPD: delete_me apaga tudo em cascata (R agora é o dono da conta de A)
await R.rpc("delete_me");
await B.rpc("delete_me");
const C = newClient();
await C.auth.signInAnonymously();
const { data: feedGone } = await C.from("feed_posts").select("id").eq("id", postId);
check("delete_me apaga conteúdo em cascata", feedGone?.length === 0, `restaram ${feedGone?.length} posts`);
await C.rpc("delete_me");

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} testes passaram`);
process.exit(failed > 0 ? 1 : 0);
