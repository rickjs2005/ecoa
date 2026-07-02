"use client";

import { Fragment, useState, useTransition } from "react";
import { loadMoreFeed } from "@/app/feed-actions";
import { PostCard, type FeedPost } from "@/components/post-card";

// a cada ~60 posts lidos, um marco de respiro inline
const PAUSE_EVERY = 60;

export function FeedList({
  initialPosts,
  initialCursor,
  tema,
  initialMyReactions,
}: {
  initialPosts: FeedPost[];
  initialCursor: string | null;
  tema: string | null;
  initialMyReactions: Record<string, number>;
}) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [myReactions, setMyReactions] =
    useState<Record<string, number>>(initialMyReactions);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    if (!cursor || isPending) return;
    startTransition(async () => {
      const page = await loadMoreFeed(tema, cursor);
      // sempre append — nunca substitui a lista nem reseta o scroll
      setPosts((prev) => [...prev, ...page.posts]);
      setMyReactions((prev) => ({ ...prev, ...page.myReactions }));
      setCursor(page.nextCursor);
    });
  }

  return (
    <>
      <div>
        {posts.map((post, i) => (
          <Fragment key={post.id}>
            <PostCard post={post} myKind={myReactions[post.id] ?? null} />
            {(i + 1) % PAUSE_EVERY === 0 && <PauseCard />}
          </Fragment>
        ))}
      </div>

      {cursor ? (
        <div className="py-6 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="rounded-xl border border-hairline bg-card px-6 py-2.5 text-sm text-muted transition-colors hover:text-accent disabled:opacity-60"
          >
            {isPending ? "Carregando…" : "Carregar mais"}
          </button>
          <p className="mt-3 text-xs text-muted">Sem pressa. 🌱</p>
        </div>
      ) : (
        <p className="py-8 text-center text-xs text-muted">
          Você chegou ao fim por hoje. 🌱
        </p>
      )}
    </>
  );
}

function PauseCard() {
  return (
    <div className="my-6 rounded-2xl border border-hairline bg-card p-6 text-center">
      <p className="font-serif">Você leu bastante. 💙</p>
      <p className="mt-1 text-sm text-muted">
        Tudo bem fechar o app. O ECOA continua aqui mais tarde.
      </p>
    </div>
  );
}
