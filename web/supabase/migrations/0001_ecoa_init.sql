-- ============================================================
-- ECOA MVP — schema inicial
-- Rede social 100% texto e anônima. Usuários = números.
-- ============================================================

-- ---------- IDENTIDADE ----------

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  public_number integer unique not null,
  status        text not null default 'active'
                check (status in ('active', 'suspended', 'banned', 'deleted')),
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

-- número público aleatório, não sequencial (não revela ordem de cadastro)
create or replace function public.generate_public_number()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  loop
    n := 10000 + floor(random() * 9989999)::integer;
    exit when not exists (select 1 from public.profiles where public_number = n);
  end loop;
  return n;
end;
$$;

revoke execute on function public.generate_public_number() from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, public_number)
  values (new.id, public.generate_public_number());
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- TEMAS (lista curada, sem hashtag livre) ----------

create table public.topics (
  id        smallint primary key,
  slug      text unique not null,
  name      text not null,
  sensitive boolean not null default false
);

alter table public.topics enable row level security;

create policy "topics_select_all" on public.topics
  for select to authenticated
  using (true);

insert into public.topics (id, slug, name, sensitive) values
  (1,  'cotidiano', 'Cotidiano',                  false),
  (2,  'desabafo',  'Desabafo',                   false),
  (3,  'gratidao',  'Gratidão',                   false),
  (4,  'conquista', 'Conquista',                  false),
  (5,  'trabalho',  'Trabalho',                   false),
  (6,  'estudos',   'Estudos',                    false),
  (7,  'familia',   'Família',                    false),
  (8,  'amor',      'Amor & Relacionamentos',     false),
  (9,  'saude',     'Saúde',                      true),
  (10, 'luto',      'Luto',                       true),
  (11, 'medos',     'Medos & Ansiedade',          true),
  (12, 'reflexoes', 'Reflexões',                  false),
  (13, 'pergunta',  'Pergunta para a comunidade', false);

-- ---------- POSTS ----------

create table public.posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  author_number   integer not null,
  topic_id        smallint not null default 1 references public.topics(id),
  body            text not null check (char_length(body) between 1 and 2000),
  replies_enabled boolean not null default true,
  status          text not null default 'published'
                  check (status in ('published', 'removed')),
  edited_at       timestamptz,
  created_at      timestamptz not null default now()
);

create index posts_feed_idx   on public.posts (status, created_at desc, id desc);
create index posts_topic_idx  on public.posts (topic_id, status, created_at desc);
create index posts_author_idx on public.posts (author_number, created_at desc);
create index posts_user_idx   on public.posts (user_id);

alter table public.posts enable row level security;

-- denormaliza o número do autor (evita expor o user_id nas leituras)
create or replace function public.set_author_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select p.public_number into new.author_number
  from public.profiles p
  where p.id = new.user_id and p.status = 'active';
  if new.author_number is null then
    raise exception 'perfil não encontrado ou suspenso';
  end if;
  return new;
end;
$$;

create trigger posts_set_author
  before insert on public.posts
  for each row execute function public.set_author_number();

-- imutabilidade + janela de edição de 15 min + status só via moderação
create or replace function public.guard_post_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id <> old.user_id
     or new.author_number <> old.author_number
     or new.created_at <> old.created_at
     or new.topic_id <> old.topic_id then
    raise exception 'campo imutável';
  end if;
  if new.status <> old.status
     and (select auth.uid()) is not null
     and coalesce(current_setting('ecoa.moderation', true), '') <> 'on' then
    raise exception 'transição de status não permitida';
  end if;
  if new.body <> old.body then
    if (select auth.uid()) is not null
       and old.created_at < now() - interval '15 minutes' then
      raise exception 'janela de edição encerrada';
    end if;
    new.edited_at := now();
  end if;
  return new;
end;
$$;

create trigger posts_guard_update
  before update on public.posts
  for each row execute function public.guard_post_update();

create policy "posts_select_published_or_own" on public.posts
  for select to authenticated
  using (status = 'published' or user_id = (select auth.uid()));

create policy "posts_insert_own" on public.posts
  for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'published');

create policy "posts_update_own" on public.posts
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "posts_delete_own" on public.posts
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- privilégio de coluna: user_id nunca é legível pelo cliente (anti-desanonimização)
revoke all on public.posts from anon;
revoke select, insert, update on public.posts from authenticated;
grant select (id, author_number, topic_id, body, replies_enabled, status, edited_at, created_at)
  on public.posts to authenticated;
grant insert (user_id, topic_id, body, replies_enabled) on public.posts to authenticated;
grant update (body, replies_enabled) on public.posts to authenticated;

-- ---------- COMENTÁRIOS (2 níveis) ----------

create table public.comments (
  id               uuid primary key default gen_random_uuid(),
  post_id          uuid not null references public.posts(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  parent_id        uuid references public.comments(id) on delete cascade,
  author_number    integer not null,
  body             text not null check (char_length(body) between 1 and 1000),
  status           text not null default 'published'
                   check (status in ('published', 'removed')),
  hidden_by_author boolean not null default false,
  created_at       timestamptz not null default now()
);

create index comments_post_idx   on public.comments (post_id, created_at);
create index comments_author_idx on public.comments (author_number, created_at desc);
create index comments_user_idx   on public.comments (user_id);
create index comments_parent_idx on public.comments (parent_id);

alter table public.comments enable row level security;

create or replace function public.guard_comment_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  post_rec   record;
  parent_rec record;
begin
  select status, replies_enabled into post_rec
  from public.posts where id = new.post_id;
  if post_rec is null or post_rec.status <> 'published' then
    raise exception 'post indisponível';
  end if;
  if not post_rec.replies_enabled then
    raise exception 'o autor pediu só para ser ouvido';
  end if;
  if new.parent_id is not null then
    select post_id, parent_id into parent_rec
    from public.comments where id = new.parent_id;
    if parent_rec is null or parent_rec.post_id <> new.post_id then
      raise exception 'resposta inválida';
    end if;
    -- threads têm no máximo 2 níveis: responder a uma resposta achata para o pai
    if parent_rec.parent_id is not null then
      new.parent_id := parent_rec.parent_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger comments_a_guard_insert
  before insert on public.comments
  for each row execute function public.guard_comment_insert();

create trigger comments_b_set_author
  before insert on public.comments
  for each row execute function public.set_author_number();

create policy "comments_select" on public.comments
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (status = 'published' and not hidden_by_author)
  );

create policy "comments_insert_own" on public.comments
  for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'published');

create policy "comments_delete_own" on public.comments
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.comments from anon;
revoke select, insert, update on public.comments from authenticated;
grant select (id, post_id, parent_id, author_number, body, status, hidden_by_author, created_at)
  on public.comments to authenticated;
grant insert (post_id, user_id, parent_id, body) on public.comments to authenticated;

-- autor do post oculta uma resposta no próprio post (sem notificar — evita retaliação)
create or replace function public.hide_comment(comment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  post_owner uuid;
begin
  select p.user_id into post_owner
  from public.comments c
  join public.posts p on p.id = c.post_id
  where c.id = comment_id;
  if post_owner is null or post_owner <> (select auth.uid()) then
    raise exception 'apenas o autor do post pode ocultar respostas';
  end if;
  update public.comments set hidden_by_author = true where id = comment_id;
end;
$$;

-- ---------- REAÇÕES (1 por usuário/post, 6 tipos empáticos) ----------

create table public.reactions (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       smallint not null check (kind between 1 and 6),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index reactions_user_idx on public.reactions (user_id, created_at desc);

alter table public.reactions enable row level security;

create policy "reactions_select_own" on public.reactions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "reactions_insert_own" on public.reactions
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "reactions_update_own" on public.reactions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "reactions_delete_own" on public.reactions
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on public.reactions from anon;

-- ---------- AGREGADOS (evita COUNT no caminho quente) ----------

create table public.post_stats (
  post_id         uuid primary key references public.posts(id) on delete cascade,
  reaction_counts integer[] not null default '{0,0,0,0,0,0}',
  comment_count   integer not null default 0,
  updated_at      timestamptz not null default now()
);

alter table public.post_stats enable row level security;

create policy "post_stats_select_all" on public.post_stats
  for select to authenticated using (true);

revoke all on public.post_stats from anon;
revoke insert, update, delete on public.post_stats from authenticated;

create or replace function public.init_post_stats()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.post_stats (post_id) values (new.id);
  return new;
end;
$$;

create trigger posts_init_stats
  after insert on public.posts
  for each row execute function public.init_post_stats();

create or replace function public.bump_reaction_stats()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.post_stats
      set reaction_counts[new.kind] = reaction_counts[new.kind] + 1,
          updated_at = now()
      where post_id = new.post_id;
    return new;
  elsif tg_op = 'UPDATE' then
    if old.kind <> new.kind then
      update public.post_stats
        set reaction_counts[old.kind] = greatest(reaction_counts[old.kind] - 1, 0)
        where post_id = new.post_id;
      update public.post_stats
        set reaction_counts[new.kind] = reaction_counts[new.kind] + 1,
            updated_at = now()
        where post_id = new.post_id;
    end if;
    return new;
  else
    update public.post_stats
      set reaction_counts[old.kind] = greatest(reaction_counts[old.kind] - 1, 0),
          updated_at = now()
      where post_id = old.post_id;
    return old;
  end if;
end;
$$;

create trigger reactions_bump_stats
  after insert or update or delete on public.reactions
  for each row execute function public.bump_reaction_stats();

create or replace function public.bump_comment_stats()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.post_stats
      set comment_count = comment_count + 1, updated_at = now()
      where post_id = new.post_id;
    return new;
  else
    update public.post_stats
      set comment_count = greatest(comment_count - 1, 0), updated_at = now()
      where post_id = old.post_id;
    return old;
  end if;
end;
$$;

create trigger comments_bump_stats
  after insert or delete on public.comments
  for each row execute function public.bump_comment_stats();

-- ---------- NOTIFICAÇÕES (respostas ao seu post/comentário) ----------

create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  kind         text not null default 'reply',
  post_id      uuid references public.posts(id) on delete cascade,
  actor_number integer,
  preview      text,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select to authenticated using (user_id = (select auth.uid()));
create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.notifications from anon;
revoke insert, update, delete on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  post_owner   uuid;
  parent_owner uuid;
begin
  select user_id into post_owner from public.posts where id = new.post_id;
  if post_owner is not null and post_owner <> new.user_id then
    insert into public.notifications (user_id, kind, post_id, actor_number, preview)
    values (post_owner, 'reply', new.post_id, new.author_number, left(new.body, 90));
  end if;
  if new.parent_id is not null then
    select user_id into parent_owner from public.comments where id = new.parent_id;
    if parent_owner is not null
       and parent_owner <> new.user_id
       and parent_owner is distinct from post_owner then
      insert into public.notifications (user_id, kind, post_id, actor_number, preview)
      values (parent_owner, 'reply', new.post_id, new.author_number, left(new.body, 90));
    end if;
  end if;
  return new;
end;
$$;

create trigger comments_notify
  after insert on public.comments
  for each row execute function public.notify_on_comment();

-- ---------- DENÚNCIAS ----------

create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment')),
  target_id   uuid not null,
  category    text not null check (category in
    ('odio', 'assedio', 'sexual', 'spam', 'politica', 'autolesao', 'doxxing', 'outro')),
  detail      text check (char_length(detail) <= 500),
  created_at  timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

create index reports_target_idx on public.reports (target_type, target_id);

alter table public.reports enable row level security;

create policy "reports_insert_own" on public.reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "reports_select_own" on public.reports
  for select to authenticated using (reporter_id = (select auth.uid()));

revoke all on public.reports from anon;

-- válvula de segurança do MVP: 3+ denunciantes distintos ocultam o conteúdo
-- até revisão humana (via dashboard/service role)
create or replace function public.auto_hide_on_reports()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  select count(*) into n from public.reports
  where target_type = new.target_type and target_id = new.target_id;
  if n >= 3 then
    perform set_config('ecoa.moderation', 'on', true);
    if new.target_type = 'post' then
      update public.posts set status = 'removed'
      where id = new.target_id and status = 'published';
    else
      update public.comments set status = 'removed'
      where id = new.target_id and status = 'published';
    end if;
    perform set_config('ecoa.moderation', '', true);
  end if;
  return new;
end;
$$;

create trigger reports_auto_hide
  after insert on public.reports
  for each row execute function public.auto_hide_on_reports();

-- ---------- FEED (view: publicados, menos o que EU denunciei) ----------

create view public.feed_posts
with (security_invoker = true)
as
select
  p.id,
  p.author_number,
  p.topic_id,
  t.slug as topic_slug,
  t.name as topic_name,
  t.sensitive as topic_sensitive,
  p.body,
  p.replies_enabled,
  p.edited_at,
  p.created_at,
  coalesce(s.reaction_counts, '{0,0,0,0,0,0}'::integer[]) as reaction_counts,
  coalesce(s.comment_count, 0) as comment_count
from public.posts p
join public.topics t on t.id = p.topic_id
left join public.post_stats s on s.post_id = p.id
where p.status = 'published'
  and not exists (
    select 1 from public.reports r
    where r.reporter_id = (select auth.uid())
      and r.target_type = 'post'
      and r.target_id = p.id
  );

revoke all on public.feed_posts from anon;
grant select on public.feed_posts to authenticated;

-- ---------- LGPD: exclusão de conta ----------

create or replace function public.delete_me()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- apaga o perfil; posts/comentários/reações caem em cascata
  delete from public.profiles where id = (select auth.uid());
end;
$$;
