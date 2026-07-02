"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <h1 className="font-serif text-2xl">Algo saiu do lugar por aqui.</h1>
      <p className="text-sm leading-relaxed text-muted">
        Não foi nada que você fez — foi coisa nossa. Seu texto e sua conta
        continuam seguros.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-accent px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
        >
          Tentar de novo
        </button>
        <Link
          href="/"
          className="rounded-xl border border-hairline bg-card px-6 py-3 text-muted hover:text-accent"
        >
          Ir para o início
        </Link>
      </div>
    </main>
  );
}
