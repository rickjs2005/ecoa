"use client";

import { useState, useTransition } from "react";
import {
  deletePost,
  deleteComment,
  hideComment,
  toggleReplies,
} from "@/app/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function PostOwnerActions({
  postId,
  repliesEnabled,
}: {
  postId: string;
  repliesEnabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex gap-4 text-xs text-muted">
      <button
        disabled={pending}
        onClick={() =>
          startTransition(() => toggleReplies(postId, !repliesEnabled))
        }
        className="-my-2.5 py-2.5 hover:text-accent disabled:opacity-50"
      >
        {repliesEnabled ? "Desativar respostas" : "Reativar respostas"}
      </button>
      <button
        disabled={pending}
        onClick={() => setConfirmDelete(true)}
        className="-my-2.5 py-2.5 hover:text-red-500 disabled:opacity-50"
      >
        Excluir
      </button>
      <ConfirmDialog
        open={confirmDelete}
        title="Excluir este post?"
        description="Ele desaparece para sempre — inclusive as respostas e os acolhimentos."
        confirmLabel="Excluir para sempre"
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          startTransition(() => deletePost(postId));
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function CommentOwnerActions({
  commentId,
  postId,
  isCommentAuthor,
  isPostAuthor,
}: {
  commentId: string;
  postId: string;
  isCommentAuthor: boolean;
  isPostAuthor: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmHide, setConfirmHide] = useState(false);

  return (
    <span className="flex gap-3">
      {isCommentAuthor && (
        <>
          <button
            disabled={pending}
            onClick={() => setConfirmDelete(true)}
            className="-my-2.5 py-2.5 text-xs text-muted hover:text-red-500 disabled:opacity-50"
          >
            Excluir
          </button>
          <ConfirmDialog
            open={confirmDelete}
            title="Excluir esta resposta?"
            description="Ela desaparece para sempre."
            confirmLabel="Excluir"
            destructive
            onConfirm={() => {
              setConfirmDelete(false);
              startTransition(() => deleteComment(commentId, postId));
            }}
            onCancel={() => setConfirmDelete(false)}
          />
        </>
      )}
      {isPostAuthor && !isCommentAuthor && (
        <>
          <button
            disabled={pending}
            onClick={() => setConfirmHide(true)}
            className="-my-2.5 py-2.5 text-xs text-muted hover:text-accent disabled:opacity-50"
          >
            Ocultar
          </button>
          <ConfirmDialog
            open={confirmHide}
            title="Ocultar esta resposta?"
            description="Ela fica invisível para todo mundo no seu post. A pessoa não é avisada."
            confirmLabel="Ocultar"
            onConfirm={() => {
              setConfirmHide(false);
              startTransition(() => hideComment(commentId, postId));
            }}
            onCancel={() => setConfirmHide(false)}
          />
        </>
      )}
    </span>
  );
}
