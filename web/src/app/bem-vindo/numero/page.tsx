import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { userNumber } from "@/lib/format";

export default async function Numero() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/bem-vindo");

  const { data: profile } = await supabase
    .from("profiles")
    .select("public_number")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/bem-vindo");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <p className="text-muted">Você agora é</p>
      <h1 className="font-serif text-5xl tracking-tight">
        Usuário{" "}
        <span className="text-accent">
          {userNumber(profile.public_number)}
        </span>
      </h1>
      <p className="max-w-xs leading-relaxed text-muted">
        Só você sabe quem está por trás desse número. Guarde-o com carinho —
        ele é a sua voz por aqui.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-accent px-8 py-3.5 font-medium text-white transition-opacity hover:opacity-90"
      >
        Entrar no ECOA
      </Link>
      <p className="max-w-xs text-xs text-muted">
        Importante: sua conta vive neste navegador. Se você limpar os dados do
        site, ela não poderá ser recuperada.
      </p>
    </main>
  );
}
