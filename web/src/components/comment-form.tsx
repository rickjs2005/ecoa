"use client";

import { useActionState, useEffect, useRef } from "react";
import { createComment, type CommentState } from "@/app/actions";

export function CommentForm({
  postId,
  parentId,
  sensitive,
}: {
  postId: string;
  parentId?: string;
  sensitive?: boolean;
}) {
  const [state, formAction, pending] = useActionState<CommentState, FormData>(
    createComment,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="post_id" value={postId} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}
      <textarea
        name="body"
        maxLength={1000}
        rows={parentId ? 2 : 3}
        placeholder={
          sensitive
            ? "Responda como responderia a um amigo. 💙"
            : "Escreva uma resposta"
        }
        className="w-full resize-y rounded-xl border border-hairline bg-card p-3 text-[15px] leading-relaxed placeholder:text-muted focus:border-accent"
      />

      {state.crisisNotice && (
        <div
          role="status"
          className="rounded-xl border border-accent/40 bg-card p-4 text-sm leading-relaxed"
        >
          <p className="font-medium">
            Se você está passando por um momento difícil: você não está
            sozinho. 💙
          </p>
          <p className="mt-1 text-muted">
            <strong>CVV — ligue 188</strong> (24h, gratuito) ou{" "}
            <span className="text-accent">cvv.org.br</span>.
          </p>
          <input type="hidden" name="ack_crisis" value="1" />
        </div>
      )}

      {state.piiWarning && (
        <div
          role="status"
          className="rounded-xl border border-hairline bg-card p-4 text-sm leading-relaxed"
        >
          <p className="font-medium">
            Sua resposta parece conter um telefone ou e-mail.
          </p>
          <p className="mt-1 text-muted">
            O ECOA é anônimo — dados de contato podem identificar você ou outra
            pessoa. Quer revisar antes de enviar?
          </p>
          <input type="hidden" name="ack_pii" value="1" />
        </div>
      )}

      {state.error && (
        <p role="alert" className="text-sm text-red-500">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending
          ? "Enviando…"
          : !state.error && (state.crisisNotice || state.piiWarning)
            ? "Enviar mesmo assim"
            : "Responder"}
      </button>
    </form>
  );
}
