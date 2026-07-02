import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { FeedPost } from "@/components/post-card";
import { FeedList } from "@/components/feed-list";
import { PublishedNotice } from "@/components/published-notice";

const PAGE_SIZE = 20;

export default async function Feed({
  searchParams,
}: {
  searchParams: Promise<{ tema?: string; publicado?: string }>;
}) {
  const { tema, publicado } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("feed_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (tema) query = query.eq("topic_slug", tema);

  const [{ data: topics }, { data }] = await Promise.all([
    supabase.from("topics").select("id, slug, name").order("id"),
    query,
  ]);

  const rows = (data ?? []) as FeedPost[];
  const hasMore = rows.length > PAGE_SIZE;
  const posts = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const last = posts[posts.length - 1];
  const nextCursor = hasMore && last ? `${last.created_at}|${last.id}` : null;

  // minhas reações na primeira página (a RLS já limita às do usuário)
  const myReactions: Record<string, number> = {};
  if (posts.length > 0) {
    const { data: reactions } = await supabase
      .from("reactions")
      .select("post_id, kind")
      .in(
        "post_id",
        posts.map((p) => p.id)
      );
    for (const r of (reactions ?? []) as { post_id: string; kind: number }[]) {
      myReactions[r.post_id] = r.kind;
    }
  }

  return (
    <main>
      <header className="flex items-baseline justify-between">
        <h1 className="font-serif text-2xl lowercase">ecoa</h1>
        <span className="text-xs text-muted">recentes</span>
      </header>

      {publicado && <PublishedNotice />}

      <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <TopicChip href="/" label="Tudo" active={!tema} />
        {(topics ?? []).map((t) => (
          <TopicChip
            key={t.id}
            href={`/?tema=${t.slug}`}
            label={t.name}
            active={tema === t.slug}
          />
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="py-20 text-center text-muted">
          <p className="font-serif text-lg">Nada por aqui ainda.</p>
          <p className="mt-2 text-sm">
            Que tal ser a primeira pessoa a{" "}
            <Link href="/escrever" className="text-accent underline">
              escrever
            </Link>{" "}
            hoje?
          </p>
        </div>
      ) : (
        <FeedList
          key={tema ?? "tudo"}
          initialPosts={posts}
          initialCursor={nextCursor}
          tema={tema ?? null}
          initialMyReactions={myReactions}
        />
      )}
    </main>
  );
}

function TopicChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs ${
        active
          ? "border-accent bg-accent text-white"
          : "border-hairline bg-card text-muted"
      }`}
    >
      {label}
    </Link>
  );
}
