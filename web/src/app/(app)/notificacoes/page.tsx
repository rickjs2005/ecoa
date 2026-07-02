import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { timeAgo, userNumber } from "@/lib/format";
import { markAllRead } from "@/app/actions";

type Notification = {
  id: string;
  kind: string;
  post_id: string | null;
  actor_number: number | null;
  preview: string | null;
  read_at: string | null;
  created_at: string;
};

export default async function Notificacoes() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/bem-vindo");

  const { data } = await supabase
    .from("notifications")
    .select("id, kind, post_id, actor_number, preview, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = (data ?? []) as Notification[];
  const hasUnread = notifications.some((n) => !n.read_at);

  return (
    <main>
      <header className="flex items-baseline justify-between">
        <h1 className="font-serif text-2xl">Avisos</h1>
        {hasUnread && (
          <form action={markAllRead}>
            <button className="-my-3.5 inline-flex items-center py-3.5 text-xs text-muted hover:text-accent">
              marcar como lidos
            </button>
          </form>
        )}
      </header>

      {notifications.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted">
          Nada por aqui. Quando alguém responder ao que você escreveu, você
          fica sabendo. 💙
        </p>
      ) : (
        <div className="mt-4">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.post_id ? `/post/${n.post_id}` : "/"}
              className="block border-b border-hairline py-4"
            >
              <p className="text-sm">
                {!n.read_at && (
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle">
                    <span className="sr-only">não lida</span>
                  </span>
                )}
                <span className="font-medium">
                  Usuário {userNumber(n.actor_number)}
                </span>{" "}
                <span className="text-muted">respondeu:</span>
              </p>
              {n.preview && (
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  “{n.preview}”
                </p>
              )}
              <p className="mt-1 text-xs text-muted">{timeAgo(n.created_at)}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
