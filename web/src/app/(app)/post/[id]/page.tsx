import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fullDate, timeAgo, userNumber } from "@/lib/format";
import { ReactionBar } from "@/components/reaction-bar";
import { CommentForm } from "@/components/comment-form";
import { ReportDialog } from "@/components/report-dialog";
import {
  PostOwnerActions,
  CommentOwnerActions,
} from "@/components/owner-actions";
import { PostEditor } from "@/components/post-editor";
import type { FeedPost } from "@/components/post-card";

type Comment = {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_number: number;
  body: string;
  status: string;
  hidden_by_author: boolean;
  created_at: string;
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/bem-vindo");

  const [
    { data: postData },
    { data: profile },
    { data: myReaction },
    { data: commentsData },
    { data: myCommentReports },
  ] = await Promise.all([
    supabase.from("feed_posts").select("*").eq("id", id).maybeSingle(),
    supabase.from("profiles").select("public_number").eq("id", user.id).single(),
    supabase.from("reactions").select("kind").eq("post_id", id).maybeSingle(),
    supabase
      .from("comments")
      .select(
        "id, post_id, parent_id, author_number, body, status, hidden_by_author, created_at"
      )
      .eq("post_id", id)
      .order("created_at"),
    supabase.from("reports").select("target_id").eq("target_type", "comment"),
  ]);

  const post = postData as (FeedPost & { topic_sensitive: boolean }) | null;

  if (!post) {
    return (
      <main className="py-20 text-center text-muted">
        <p className="font-serif text-lg">Este post não está mais disponível.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-accent underline">
          ← Voltar ao início
        </Link>
      </main>
    );
  }

  const myNumber = profile?.public_number ?? null;
  const isOwn = myNumber !== null && post.author_number === myNumber;
  const canEdit =
    isOwn && Date.now() - new Date(post.created_at).getTime() < 15 * 60_000;
  // "vai sumir do seu feed" vale para respostas também: esconde as que EU denunciei
  const reportedByMe = new Set(
    (myCommentReports ?? []).map((r) => r.target_id as string)
  );
  const comments = ((commentsData ?? []) as Comment[]).filter(
    (c) => !reportedByMe.has(c.id)
  );
  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesOf = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId);

  return (
    <main>
      <Link href="/" className="text-sm text-muted hover:text-accent">
        ← Voltar
      </Link>

      <article className="mt-4">
        <header className="flex items-baseline justify-between gap-2 text-sm">
          <span className="font-medium">
            Usuário {userNumber(post.author_number)}
            {isOwn && <span className="ml-2 text-xs text-accent">você</span>}
          </span>
          <span className="text-muted">{fullDate(post.created_at)}</span>
        </header>
        <p className="mt-0.5 text-xs text-muted">
          {post.topic_name}
          {post.edited_at && " · editado"}
        </p>

        <PostEditor postId={post.id} body={post.body} editable={canEdit} />

        <div className="mt-6">
          <ReactionBar
            postId={post.id}
            counts={post.reaction_counts}
            myKind={myReaction?.kind ?? null}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          {isOwn ? (
            <PostOwnerActions postId={post.id} repliesEnabled={post.replies_enabled} />
          ) : (
            <ReportDialog targetType="post" targetId={post.id} />
          )}
        </div>
      </article>

      <section className="mt-8 border-t border-hairline pt-6">
        <h2 className="text-sm font-medium text-muted">
          Respostas ({topLevel.length})
        </h2>

        <div className="mt-4 flex flex-col gap-5">
          {topLevel.map((c) => (
            <div key={c.id}>
              <CommentBlock
                comment={c}
                postId={post.id}
                myNumber={myNumber}
                isPostAuthor={isOwn}
                postAuthorNumber={post.author_number}
              />
              {repliesOf(c.id).map((r) => (
                <div key={r.id} className="ml-6 mt-3 border-l border-hairline pl-4">
                  <CommentBlock
                    comment={r}
                    postId={post.id}
                    myNumber={myNumber}
                    isPostAuthor={isOwn}
                    postAuthorNumber={post.author_number}
                  />
                </div>
              ))}
              {post.replies_enabled && (
                <details className="ml-6 mt-2">
                  <summary className="-my-2.5 cursor-pointer py-2.5 text-xs text-muted hover:text-accent">
                    Responder
                  </summary>
                  <div className="mt-2">
                    <CommentForm postId={post.id} parentId={c.id} />
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8">
          {post.replies_enabled ? (
            <CommentForm postId={post.id} sensitive={post.topic_sensitive} />
          ) : (
            <p className="rounded-xl bg-card px-4 py-3 text-sm text-muted">
              O autor pediu só para ser ouvido. Você ainda pode acolher. 💙
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function CommentBlock({
  comment,
  postId,
  myNumber,
  isPostAuthor,
  postAuthorNumber,
}: {
  comment: Comment;
  postId: string;
  myNumber: number | null;
  isPostAuthor: boolean;
  postAuthorNumber: number;
}) {
  const isMine = myNumber !== null && comment.author_number === myNumber;
  const removed = comment.status !== "published";
  const hidden = comment.hidden_by_author;

  return (
    <div className={removed || hidden ? "opacity-60" : ""}>
      <header className="flex items-baseline gap-2 text-sm">
        <span className="font-medium">Usuário {userNumber(comment.author_number)}</span>
        {comment.author_number === postAuthorNumber && (
          <span className="text-xs text-accent">Autor</span>
        )}
        {isMine && comment.author_number !== postAuthorNumber && (
          <span className="text-xs text-accent">você</span>
        )}
        <span className="text-xs text-muted">{timeAgo(comment.created_at)}</span>
      </header>
      {removed ? (
        <p className="mt-1 text-sm italic text-muted">resposta removida pela moderação</p>
      ) : (
        <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed">
          {comment.body}
        </p>
      )}
      {hidden && isMine && (
        <p className="mt-1 text-xs italic text-muted">
          oculta pelo autor do post (só você vê)
        </p>
      )}
      {!removed && (
        <div className="mt-1.5 flex items-center gap-3">
          {(isMine || isPostAuthor) && (
            <CommentOwnerActions
              commentId={comment.id}
              postId={postId}
              isCommentAuthor={isMine}
              isPostAuthor={isPostAuthor}
            />
          )}
          {!isMine && <ReportDialog targetType="comment" targetId={comment.id} />}
        </div>
      )}
    </div>
  );
}
