"use client";

import { useState, useTransition } from "react";
import { createRecoveryPhrase } from "@/app/recovery-actions";

export function RecoveryPhrase() {
  const [phrase, setPhrase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function generate() {
    setError(null);
    setCopied(false);
    startTransition(async () => {
      const result = await createRecoveryPhrase();
      if (result.error) {
        setError(result.error);
      } else if (result.phrase) {
        setPhrase(result.phrase);
      }
    });
  }

  async function copy() {
    if (!phrase) return;
    try {
      await navigator.clipboard.writeText(phrase);
      setCopied(true);
    } catch {
      // clipboard indisponível (http, permissão…) — a frase segue visível
    }
  }

  return (
    <section className="mt-10 border-t border-hairline pt-6">
      <h2 className="text-sm font-medium text-muted">Frase de recuperação</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Sua conta vive neste navegador. Com uma frase de recuperação, você
        pode trazê-la de volta em outro aparelho.
      </p>

      {phrase ? (
        <div
          role="status"
          className="mt-4 rounded-2xl border border-accent/40 bg-card p-5"
        >
          <p className="font-serif text-lg leading-relaxed tracking-wide text-accent">
            {phrase}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Anote em um lugar seguro. Ela aparece só esta vez e é o único
            jeito de recuperar sua conta.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={copy}
              className="rounded-lg border border-hairline bg-background px-4 py-2 text-sm transition-colors hover:border-accent"
            >
              {copied ? "Copiado ✓" : "Copiar"}
            </button>
            <button
              onClick={generate}
              disabled={pending}
              className="text-sm text-muted hover:text-accent disabled:opacity-50"
            >
              {pending ? "Gerando…" : "Gerar nova frase"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-start gap-2">
          <button
            onClick={generate}
            disabled={pending}
            className="rounded-xl border border-hairline bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent disabled:opacity-50"
          >
            {pending ? "Gerando…" : "Gerar frase de recuperação"}
          </button>
          <p className="text-xs text-muted">
            Se você já gerou uma frase antes, a anterior deixa de valer.
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-500">
          {error}
        </p>
      )}
    </section>
  );
}
