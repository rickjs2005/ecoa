"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generatePhrase } from "@/lib/wordlist";

// ---------- gerar a frase (página Você) ----------

export async function createRecoveryPhrase(): Promise<{
  phrase?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/bem-vindo");

  const phrase = generatePhrase();
  const { error } = await supabase.rpc("set_recovery_phrase", { phrase });
  if (error) {
    return {
      error: "Não conseguimos gerar sua frase agora. Tente de novo em instantes.",
    };
  }
  // exibida uma única vez; só o hash fica no banco
  return { phrase };
}

// ---------- recuperar a conta (página pública) ----------

export type RecoverState = { error?: string };

// mensagens conhecidas do banco → texto acolhedor; qualquer outra coisa
// cai no genérico (não vazamos detalhes de qual parte falhou)
function traduzErro(message: string): string {
  if (message.includes("já tem conteúdo")) {
    return "Esta conta já tem conteúdo — a recuperação só funciona a partir de uma conta recém-criada.";
  }
  if (message.includes("muitas tentativas")) {
    return "Muitas tentativas. Por segurança, espere um pouco e tente de novo mais tarde.";
  }
  return "Número ou frase incorretos.";
}

export async function recoverAccount(
  _prev: RecoverState,
  formData: FormData
): Promise<RecoverState> {
  // aceita "#48291", "48291", com espaços…
  const numero = String(formData.get("numero") ?? "").replace(/\D/g, "");
  const frase = String(formData.get("frase") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!numero) return { error: "Digite o número da sua conta (ex.: #48291)." };
  if (!frase) return { error: "Digite sua frase de recuperação." };

  const targetNumber = Number(numero);
  if (!Number.isSafeInteger(targetNumber) || targetNumber <= 0 || targetNumber > 2147483647) {
    return { error: "Número ou frase incorretos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // a recuperação parte de uma conta anônima fresca; se ainda não há
  // sessão neste aparelho, criamos uma agora
  let sessionCreatedNow = false;
  if (!user) {
    const { error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError) {
      return {
        error:
          "Não conseguimos iniciar a recuperação agora. Respira — e tenta de novo em instantes.",
      };
    }
    sessionCreatedNow = true;
  }

  const { error } = await supabase.rpc("recover_account", {
    target_number: targetNumber,
    phrase: frase,
  });

  if (error) {
    // não deixamos uma conta descartável para trás se fomos nós que a criamos
    if (sessionCreatedNow) {
      await supabase.rpc("delete_me");
      await supabase.auth.signOut();
    }
    return { error: traduzErro(error.message) };
  }

  revalidatePath("/");
  redirect("/voce");
}
