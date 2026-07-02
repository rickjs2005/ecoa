export const REACTIONS = [
  { kind: 1, emoji: "❤️", label: "Eu entendo" },
  { kind: 2, emoji: "🤝", label: "Estou com você" },
  { kind: 3, emoji: "🙏", label: "Força" },
  { kind: 4, emoji: "😊", label: "Fico feliz por você" },
  { kind: 5, emoji: "💙", label: "Você não está sozinho" },
  { kind: 6, emoji: "🌱", label: "Isso vai passar" },
] as const;

export type ReactionKind = (typeof REACTIONS)[number]["kind"];

export function reactionTotal(counts: number[] | null | undefined): number {
  if (!counts) return 0;
  return counts.reduce((a, b) => a + b, 0);
}
