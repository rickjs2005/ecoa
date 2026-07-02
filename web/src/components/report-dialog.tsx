"use client";

import { useActionState, useState } from "react";
import { reportContent, type ReportState } from "@/app/actions";

const CATEGORIES = [
  { value: "odio", label: "Discurso de ódio" },
  { value: "assedio", label: "Assédio ou ameaça" },
  { value: "sexual", label: "Conteúdo sexual" },
  { value: "spam", label: "Spam ou golpe" },
  { value: "politica", label: "Propaganda política" },
  { value: "autolesao", label: "Incentivo a autolesão" },
  { value: "doxxing", label: "Expõe dados de alguém" },
  { value: "outro", label: "Outro" },
];

export function ReportDialog({
  targetType,
  targetId,
}: {
  targetType: "post" | "comment";
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ReportState, FormData>(
    reportContent,
    {}
  );

  if (state.ok) {
    return (
      <p className="text-xs text-muted">
        Obrigado. Nossa equipe vai revisar. Este conteúdo vai sumir do seu
        feed. 💙
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="-my-3.5 inline-flex items-center py-3.5 text-xs text-muted hover:text-red-500"
      >
        Denunciar
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-2 flex flex-col gap-2 rounded-xl border border-hairline bg-card p-4"
    >
      <input type="hidden" name="target_type" value={targetType} />
      <input type="hidden" name="target_id" value={targetId} />
      <p className="text-sm font-medium">Por que você está denunciando?</p>
      <div className="flex flex-col gap-1.5">
        {CATEGORIES.map((c) => (
          <label key={c.value} className="flex items-center gap-2 text-sm text-muted">
            <input
              type="radio"
              name="category"
              value={c.value}
              required
              className="accent-[var(--accent)]"
            />
            {c.label}
          </label>
        ))}
      </div>
      <textarea
        name="detail"
        maxLength={500}
        rows={2}
        placeholder="Detalhes (opcional)"
        className="rounded-lg border border-hairline bg-background p-2 text-sm"
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-500">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Enviando…" : "Enviar denúncia"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2 text-sm text-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
