"use client";

import { useOptimistic, useTransition } from "react";
import { setReaction } from "@/app/actions";
import { REACTIONS } from "@/lib/reactions";

export function ReactionBar({
  postId,
  counts,
  myKind,
}: {
  postId: string;
  counts: number[];
  myKind: number | null;
}) {
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic<{
    counts: number[];
    myKind: number | null;
  }>({ counts, myKind });

  function react(kind: number) {
    startTransition(async () => {
      const next = optimistic.myKind === kind ? null : kind;
      const newCounts = [...optimistic.counts];
      if (optimistic.myKind) newCounts[optimistic.myKind - 1] -= 1;
      if (next) newCounts[next - 1] += 1;
      setOptimistic({ counts: newCounts, myKind: next });
      await setReaction(postId, next);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {REACTIONS.map((r) => {
        const count = optimistic.counts[r.kind - 1] ?? 0;
        const mine = optimistic.myKind === r.kind;
        return (
          <button
            key={r.kind}
            onClick={() => react(r.kind)}
            title={r.label}
            aria-pressed={mine}
            aria-label={`${r.label}${count > 0 ? `, ${count}` : ""}`}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              mine
                ? "border-accent bg-accent/10 text-accent"
                : "border-hairline bg-card text-muted hover:border-accent"
            }`}
          >
            <span>{r.emoji}</span>
            <span className="text-xs">{r.label}</span>
            {count > 0 && <span className="text-xs font-medium">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
