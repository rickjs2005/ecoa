export default function Loading() {
  return (
    <div
      aria-hidden
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-12"
    >
      <div className="h-3 w-24 animate-pulse rounded bg-hairline" />
      <div className="h-16 w-16 animate-pulse rounded-full bg-hairline" />
      <div className="h-3 w-40 animate-pulse rounded bg-hairline" />
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
