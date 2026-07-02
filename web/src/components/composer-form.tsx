"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createPost, type ComposerState } from "@/app/actions";

// rascunho local: perder um desabafo escrito é o pior acidente possível aqui
export const DRAFT_KEY = "ecoa:rascunho";

const PLACEHOLDERS = [
  "O que você está sentindo agora?",
  "Como foi seu dia?",
  "O que você gostaria de contar para alguém?",
];

type Topic = { id: number; slug: string; name: string };

export function ComposerForm({ topics }: { topics: Topic[] }) {
  const [state, formAction, pending] = useActionState<ComposerState, FormData>(
    createPost,
    {}
  );
  const [length, setLength] = useState(state.body?.length ?? 0);
  const [placeholder] = useState(
    () => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el || el.value) return;
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        el.value = draft;
        setLength(draft.length);
      }
    } catch {}
  }, []);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-4">
      <textarea
        ref={textareaRef}
        name="body"
        defaultValue={state.body}
        placeholder={placeholder}
        maxLength={2000}
        rows={9}
        onChange={(e) => {
          setLength(e.target.value.length);
          try {
            localStorage.setItem(DRAFT_KEY, e.target.value);
          } catch {}
        }}
        className="w-full resize-y rounded-2xl border border-hairline bg-card p-4 font-serif text-[17px] leading-relaxed placeholder:text-muted focus:border-accent"
      />

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2 text-muted">
          Tema
          <select
            name="topic_id"
            className="rounded-lg border border-hairline bg-card px-2 py-1.5"
            defaultValue={1}
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-muted">
          <input
            type="checkbox"
            name="replies_enabled"
            defaultChecked
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Permitir respostas
        </label>

        <span className="ml-auto text-xs text-muted">{length}/2000</span>
      </div>

      {state.crisisNotice && (
        <div
          role="status"
          className="rounded-2xl border border-accent/40 bg-card p-5 text-sm leading-relaxed"
        >
          <p className="font-medium">
            Percebemos que você pode estar passando por um momento muito
            difícil. Você não está sozinho. 💙
          </p>
          <p className="mt-2 text-muted">
            <strong>CVV — ligue 188</strong> (24h, gratuito) ou converse em{" "}
            <span className="text-accent">cvv.org.br</span>. Desabafar aqui
            também é válido — seu texto será publicado se você quiser.
          </p>
          <input type="hidden" name="ack_crisis" value="1" />
        </div>
      )}

      {state.piiWarning && (
        <div
          role="status"
          className="rounded-2xl border border-hairline bg-card p-5 text-sm leading-relaxed"
        >
          <p className="font-medium">
            Seu texto parece conter um telefone ou e-mail.
          </p>
          <p className="mt-2 text-muted">
            O ECOA é anônimo — dados pessoais podem identificar você (ou outra
            pessoa). Quer revisar antes de publicar?
          </p>
          <input type="hidden" name="ack_pii" value="1" />
        </div>
      )}

      {state.error && (
        <p role="alert" className="rounded-xl bg-card px-4 py-3 text-sm text-red-500">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-accent px-6 py-3.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending
          ? "Publicando…"
          : !state.error && (state.crisisNotice || state.piiWarning)
            ? "Publicar mesmo assim"
            : "Publicar"}
      </button>
    </form>
  );
}
