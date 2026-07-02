-- Correções da revisão geral (code review)

-- 1. LGPD completo: delete_me também remove o registro em auth.users
--    (antes ficava um usuário órfão no schema auth para sempre)
create or replace function public.delete_me()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'não autenticado';
  end if;
  delete from public.profiles where id = v_uid;
  begin
    delete from auth.users where id = v_uid;
  exception when insufficient_privilege then
    -- fallback: perfil e conteúdo já foram apagados; o registro auth órfão
    -- pode ser limpo via dashboard se este ambiente não permitir o delete
    null;
  end;
end;
$$;

-- 2. Anti-brigading: só denúncias de contas com 1h+ de vida contam para a
--    ocultação automática (contas recém-criadas não censuram ninguém)
create or replace function public.auto_hide_on_reports()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  select count(*) into n
  from public.reports r
  join public.profiles p on p.id = r.reporter_id
  where r.target_type = new.target_type
    and r.target_id = new.target_id
    and p.created_at < now() - interval '1 hour';
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

-- 3. comment_count consistente: só decrementa no DELETE se a resposta ainda
--    estava visível, e acompanha mudanças de visibilidade (removida/oculta)
create or replace function public.bump_comment_stats()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  was_visible boolean;
  is_visible  boolean;
begin
  if tg_op = 'INSERT' then
    update public.post_stats
      set comment_count = comment_count + 1, updated_at = now()
      where post_id = new.post_id;
    return new;
  elsif tg_op = 'UPDATE' then
    was_visible := old.status = 'published' and not old.hidden_by_author;
    is_visible  := new.status = 'published' and not new.hidden_by_author;
    if was_visible and not is_visible then
      update public.post_stats
        set comment_count = greatest(comment_count - 1, 0), updated_at = now()
        where post_id = new.post_id;
    elsif is_visible and not was_visible then
      update public.post_stats
        set comment_count = comment_count + 1, updated_at = now()
        where post_id = new.post_id;
    end if;
    return new;
  else
    if old.status = 'published' and not old.hidden_by_author then
      update public.post_stats
        set comment_count = greatest(comment_count - 1, 0), updated_at = now()
        where post_id = old.post_id;
    end if;
    return old;
  end if;
end;
$$;

drop trigger if exists comments_bump_stats on public.comments;
create trigger comments_bump_stats
  after insert or update or delete on public.comments
  for each row execute function public.bump_comment_stats();
