export default function Loading() {
  return (
    <div aria-hidden className="animate-pulse">
      {/* cabeçalho fantasma */}
      <div className="h-7 w-32 rounded-lg bg-hairline" />
      <div className="mt-3 h-4 w-48 rounded bg-hairline" />

      {/* posts fantasmas */}
      <div className="mt-8 flex flex-col gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-hairline bg-card p-5"
          >
            <div className="h-3 w-24 rounded bg-hairline" />
            <div className="mt-4 h-4 w-full rounded bg-hairline" />
            <div className="mt-2.5 h-4 w-11/12 rounded bg-hairline" />
            <div className="mt-2.5 h-4 w-3/5 rounded bg-hairline" />
            <div className="mt-5 flex gap-2">
              <div className="h-7 w-20 rounded-full bg-hairline" />
              <div className="h-7 w-20 rounded-full bg-hairline" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
