"use client";

import { useActionState, useEffect, useState } from "react";
import { updatePost, type EditState } from "@/app/actions";

export function PostEditor({
  postId,
  body,
  editable,
}: {
  postId: string;
  body: string;
  editable: boolean;
}) {
  // o texto vive em estado local para refletir a edição na hora;
  // o revalidate do servidor atualiza o resto da página
  const [currentBody, setCurrentBody] = useState(body);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);
  const [state, formAction, pending] = useActionState<EditState, FormData>(
    updatePost,
    {}
  );

  useEffect(() => {
    if (state.ok) {
      setCurrentBody(draft.trim());
      setEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!editing) {
    return (
      <>
        <p className="mt-4 whitespace-pre-wrap font-serif text-lg leading-relaxed">
          {currentBody}
        </p>
        {editable && (
          <button
            type="button"
            onClick={() => {
              setDraft(currentBody);
              setEditing(true);
            }}
            className="-my-2.5 mt-1 py-2.5 text-xs text-muted hover:text-accent"
          >
            Editar
          </button>
        )}
      </>
    );
  }

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-2">
      <input type="hidden" name="post_id" value={postId} />
      <textarea
        name="body"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        maxLength={2000}
        rows={6}
        autoFocus
        className="w-full resize-y rounded-2xl border border-hairline bg-card p-4 font-serif text-lg leading-relaxed placeholder:text-muted focus:border-accent"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{draft.length}/2000</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => setEditing(false)}
            className="rounded-lg px-4 py-2 text-sm text-muted transition-colors hover:text-accent disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-500">
          {state.error}
        </p>
      )}
    </form>
  );
}
