"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setReaction } from "@/app/actions";
import { REACTIONS, reactionTotal } from "@/lib/reactions";

type ReactionState = { counts: number[]; myKind: number | null };

export function CardReactions({
  postId,
  counts,
  myKind,
}: {
  postId: string;
  counts: number[];
  myKind: number | null;
}) {
  const [open, setOpen] = useState(false);
  // o card vive numa lista mantida em estado no cliente, então as props não
  // mudam depois da action — guardamos o estado confirmado aqui e usamos o
  // otimista por cima dele enquanto a transição roda
  const [committed, setCommitted] = useState<ReactionState>({ counts, myKind });
  const [optimistic, setOptimistic] = useOptimistic<ReactionState>(committed);
  const [, startTransition] = useTransition();

  function react(kind: number) {
    const next = optimistic.myKind === kind ? null : kind;
    const newCounts = [...optimistic.counts];
    while (newCounts.length < REACTIONS.length) newCounts.push(0);
    if (optimistic.myKind !== null) {
      newCounts[optimistic.myKind - 1] = Math.max(
        0,
        newCounts[optimistic.myKind - 1] - 1
      );
    }
    if (next !== null) newCounts[next - 1] += 1;
    const state: ReactionState = { counts: newCounts, myKind: next };

    setOpen(false);
    startTransition(async () => {
      setOptimistic(state);
      try {
        await setReaction(postId, next);
        setCommitted(state);
      } catch {
        // falhou — o estado otimista volta sozinho ao confirmado
      }
    });
  }

  const total = reactionTotal(optimistic.counts);
  const mine = REACTIONS.find((r) => r.kind === optimistic.myKind) ?? null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={false}
        aria-label={
          mine ? `Sua reação: ${mine.label}. Alterar reação` : "Acolher este post"
        }
        className={`flex items-center gap-1.5 transition-colors hover:text-accent ${
          mine ? "text-accent" : ""
        }`}
      >
        <span>{mine ? mine.emoji : "🤝"}</span>
        <span>
          {total === 0
            ? "Acolher"
            : `${total} ${total === 1 ? "acolhimento" : "acolhimentos"}`}
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Reações">
      {REACTIONS.map((r) => {
        const active = optimistic.myKind === r.kind;
        return (
          <button
            key={r.kind}
            type="button"
            onClick={() => react(r.kind)}
            aria-label={r.label}
            title={r.label}
            aria-pressed={active}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-colors ${
              active
                ? "border-accent bg-accent/10 text-accent"
                : "border-hairline bg-card hover:border-accent"
            }`}
          >
            {r.emoji}
          </button>
        );
      })}
    </div>
  );
}
