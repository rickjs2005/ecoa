"use client";

import Link from "next/link";
import { useActionState } from "react";
import { recoverAccount, type RecoverState } from "@/app/recovery-actions";

export default function Recuperar() {
  const [state, formAction, pending] = useActionState<RecoverState, FormData>(
    recoverAccount,
    {}
  );

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-12">
      <header className="text-center">
        <h1 className="font-serif text-3xl">Recuperar minha conta</h1>
        <p className="mt-2 text-sm text-muted">
          Digite seu número e a frase de recuperação que você anotou.
        </p>
      </header>

      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-2xl border border-hairline bg-card p-8 shadow-sm"
      >
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Seu número
          <input
            name="numero"
            inputMode="numeric"
            placeholder="#48291"
            required
            autoComplete="off"
            className="rounded-xl border border-hairline bg-background p-3 text-[15px] placeholder:text-muted focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Frase de recuperação
          <textarea
            name="frase"
            rows={2}
            required
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            placeholder="seis palavras separadas por espaço"
            className="resize-y rounded-xl border border-hairline bg-background p-3 text-[15px] leading-relaxed placeholder:text-muted focus:border-accent"
          />
        </label>

        {state.error && (
          <p
            role="alert"
            className="rounded-xl border border-red-400/40 bg-background px-4 py-3 text-sm text-red-500"
          >
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-accent px-6 py-3.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Procurando sua conta…" : "Recuperar"}
        </button>
      </form>

      <Link
        href="/bem-vindo"
        className="text-center text-sm text-muted hover:text-accent"
      >
        ← Voltar
      </Link>
    </main>
  );
}
