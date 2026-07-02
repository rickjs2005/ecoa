import Link from "next/link";
import { timeAgo, userNumber } from "@/lib/format";
import { CardReactions } from "@/components/card-reactions";

export type FeedPost = {
  id: string;
  author_number: number;
  topic_slug: string;
  topic_name: string;
  body: string;
  replies_enabled: boolean;
  edited_at: string | null;
  created_at: string;
  reaction_counts: number[];
  comment_count: number;
};

const LONG_BODY = 500;

export function PostCard({
  post,
  myKind,
}: {
  post: FeedPost;
  myKind: number | null;
}) {
  const isLong = post.body.length > LONG_BODY;

  return (
    <article className="border-b border-hairline py-5">
      <header className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">Usuário {userNumber(post.author_number)}</span>
        <span className="text-muted">{timeAgo(post.created_at)}</span>
      </header>
      <p className="mt-0.5 text-xs text-muted">{post.topic_name}</p>

      <Link href={`/post/${post.id}`} className="block">
        <p
          className={`mt-3 whitespace-pre-wrap font-serif text-[17px] leading-relaxed ${
            isLong ? "line-clamp-6" : ""
          }`}
        >
          {post.body}
        </p>
      </Link>
      {isLong && (
        <Link
          href={`/post/${post.id}`}
          className="mt-1 inline-block text-sm text-accent"
        >
          continuar lendo
        </Link>
      )}

      <footer className="mt-4 flex items-center gap-4 text-sm text-muted">
        <CardReactions
          postId={post.id}
          counts={post.reaction_counts}
          myKind={myKind}
        />
        <Link
          href={`/post/${post.id}`}
          className="-my-3 inline-flex items-center py-3 hover:text-accent"
        >
          {post.replies_enabled
            ? `${post.comment_count} ${post.comment_count === 1 ? "resposta" : "respostas"}`
            : "respostas desativadas"}
        </Link>
        {post.edited_at && <span className="text-xs">editado</span>}
      </footer>
    </article>
  );
}
