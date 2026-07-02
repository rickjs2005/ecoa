"use server";

import { createClient } from "@/lib/supabase/server";
import type { FeedPost } from "@/components/post-card";

const PAGE_SIZE = 20;

export type FeedPage = {
  posts: FeedPost[];
  nextCursor: string | null;
  myReactions: Record<string, number>;
};

export async function loadMoreFeed(
  tema: string | null,
  cursor: string
): Promise<FeedPage> {
  const supabase = await createClient();

  let query = supabase
    .from("feed_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (tema) query = query.eq("topic_slug", tema);

  // cursor composto (created_at|id): sem o desempate por id, posts com o
  // mesmo timestamp do limite da página seriam pulados
  const [cAt, cId] = cursor.split("|");
  if (cAt && cId) {
    query = query.or(
      `created_at.lt."${cAt}",and(created_at.eq."${cAt}",id.lt."${cId}")`
    );
  } else if (cAt) {
    query = query.lt("created_at", cAt);
  }

  const { data } = await query;
  const rows = (data ?? []) as FeedPost[];
  const hasMore = rows.length > PAGE_SIZE;
  const posts = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const last = posts[posts.length - 1];
  const nextCursor = hasMore && last ? `${last.created_at}|${last.id}` : null;

  // minhas reações nos posts desta página (a RLS já limita às do usuário)
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

  return { posts, nextCursor, myReactions };
}
