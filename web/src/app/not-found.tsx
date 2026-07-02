import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <h1 className="font-serif text-2xl">Esta página não existe.</h1>
      <p className="text-sm leading-relaxed text-muted">
        Talvez o conteúdo tenha sido removido, ou o endereço veio errado. O
        que importa continua aqui. 💙
      </p>
      <Link
        href="/"
        className="rounded-xl bg-accent px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
