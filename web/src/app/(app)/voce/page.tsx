import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { timeAgo, userNumber } from "@/lib/format";
import { reactionTotal } from "@/lib/reactions";
import { deleteAccount, signOut } from "@/app/actions";
import { RecoveryPhrase } from "@/components/recovery-phrase";

type MyPost = {
  id: string;
  body: string;
  status: string;
  created_at: string;
  post_stats: { reaction_counts: number[]; comment_count: number } | null;
};

const ERROS: Record<string, string> = {
  confirmacao: 'Para excluir a conta, digite exatamente "EXCLUIR" no campo de confirmação.',
  exclusao: "Não conseguimos excluir sua conta agora. Tente de novo em instantes.",
};

export default async function Voce({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/bem-vindo");

  const { data: profile } = await supabase
    .from("profiles")
    .select("public_number, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/bem-vindo");

  const { data: postsData } = await supabase
    .from("posts")
    .select("id, body, status, created_at, post_stats(reaction_counts, comment_count)")
    .eq("author_number", profile.public_number)
    .order("created_at", { ascending: false })
    .limit(50);

  const posts = (postsData ?? []) as unknown as MyPost[];
  const totalAcolhimentos = posts.reduce(
    (sum, p) => sum + reactionTotal(p.post_stats?.reaction_counts),
    0
  );

  const since = new Date(profile.created_at).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });

  return (
    <main>
      <header className="text-center">
        <h1 className="font-serif text-3xl">
          Usuário <span className="text-accent">{userNumber(profile.public_number)}</span>
        </h1>
        <p className="mt-1 text-sm text-muted">no ECOA desde {since}</p>
      </header>

      {erro && ERROS[erro] && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-400/40 bg-card px-4 py-3 text-sm text-red-500"
        >
          {ERROS[erro]}
        </p>
      )}

      {totalAcolhimentos > 0 && (
        <p className="mt-6 rounded-2xl border border-hairline bg-card p-5 text-center text-sm">
          💙 Até agora, <strong>{totalAcolhimentos}</strong>{" "}
          {totalAcolhimentos === 1 ? "pessoa acolheu" : "pessoas acolheram"} o
          que você escreveu.
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium text-muted">Meus posts</h2>
        {posts.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Você ainda não escreveu nada.{" "}
            <Link href="/escrever" className="text-accent underline">
              Que tal agora?
            </Link>
          </p>
        ) : (
          <div className="mt-2">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/post/${p.id}`}
                className="block border-b border-hairline py-4"
              >
                <p className="line-clamp-2 font-serif text-[15px] leading-relaxed">
                  {p.body}
                </p>
                <p className="mt-1.5 text-xs text-muted">
                  {timeAgo(p.created_at)} ·{" "}
                  {reactionTotal(p.post_stats?.reaction_counts)} acolhimentos ·{" "}
                  {p.post_stats?.comment_count ?? 0} respostas
                  {p.status !== "published" && " · removido pela moderação"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <RecoveryPhrase />

      <section className="mt-10 flex flex-col gap-3 border-t border-hairline pt-6">
        <Link href="/ajuda" className="text-sm text-muted hover:text-accent">
          ? Ajuda e apoio
        </Link>
        <form action={signOut}>
          <button className="text-sm text-muted hover:text-accent">Sair</button>
        </form>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted hover:text-red-500">
            Excluir minha conta
          </summary>
          <form action={deleteAccount} className="mt-3 flex flex-col gap-2 rounded-xl border border-hairline bg-card p-4">
            <p className="text-sm text-muted">
              Isso apaga sua conta, seus posts, respostas e reações — para
              sempre e sem volta (LGPD). Digite{" "}
              <strong className="text-foreground">EXCLUIR</strong> para
              confirmar.
            </p>
            <input
              name="confirm"
              placeholder="EXCLUIR"
              className="rounded-lg border border-hairline bg-background p-2 text-sm"
            />
            <button className="self-start rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white">
              Excluir para sempre
            </button>
          </form>
        </details>
      </section>
    </main>
  );
}
