-- ============================================================
-- Frase de recuperação (estilo carteira cripto)
-- A conta vive no navegador; a frase permite trazê-la de volta
-- em outro aparelho sem nunca pedir dado pessoal.
-- ============================================================

-- pgcrypto (crypt/gen_salt) — no Supabase vive no schema extensions
create extension if not exists pgcrypto with schema extensions;

-- ---------- 1. colunas ----------

alter table public.profiles
  add column recovery_hash text,
  add column recovery_attempts integer not null default 0,
  add column recovery_locked_until timestamptz;

-- ---------- 2. privilégio de coluna ----------
-- o hash (e o estado do rate limit) nunca viajam ao cliente

revoke all on public.profiles from anon;
revoke select on public.profiles from authenticated;
grant select (id, public_number, status, created_at)
  on public.profiles to authenticated;

-- ---------- 3. FKs com ON UPDATE CASCADE ----------
-- a recuperação troca o id do perfil; as cascatas movem o conteúdo junto

alter table public.posts
  drop constraint posts_user_id_fkey,
  add constraint posts_user_id_fkey
    foreign key (user_id) references public.profiles(id)
    on delete cascade on update cascade;

alter table public.comments
  drop constraint comments_user_id_fkey,
  add constraint comments_user_id_fkey
    foreign key (user_id) references public.profiles(id)
    on delete cascade on update cascade;

alter table public.reactions
  drop constraint reactions_user_id_fkey,
  add constraint reactions_user_id_fkey
    foreign key (user_id) references public.profiles(id)
    on delete cascade on update cascade;

alter table public.notifications
  drop constraint notifications_user_id_fkey,
  add constraint notifications_user_id_fkey
    foreign key (user_id) references public.profiles(id)
    on delete cascade on update cascade;

alter table public.reports
  drop constraint reports_reporter_id_fkey,
  add constraint reports_reporter_id_fkey
    foreign key (reporter_id) references public.profiles(id)
    on delete cascade on update cascade;

-- o trigger de imutabilidade de posts precisa deixar a cascata do
-- ON UPDATE passar (triggers disparam também em updates de FK).
-- Clientes continuam sem poder tocar em user_id: o grant de update
-- em posts cobre apenas (body, replies_enabled), e set_config não é
-- alcançável via PostgREST — só recover_account liga 'ecoa.recovery'.
create or replace function public.guard_post_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.user_id <> old.user_id
      and coalesce(current_setting('ecoa.recovery', true), '') <> 'on')
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

-- ---------- 4. gerar/atualizar a frase ----------

create or replace function public.set_recovery_phrase(phrase text)
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
  if char_length(phrase) < 20 then
    raise exception 'frase muito curta';
  end if;
  update public.profiles
     set recovery_hash         = extensions.crypt(phrase, extensions.gen_salt('bf')),
         recovery_attempts     = 0,
         recovery_locked_until = null
   where id = v_uid;
  if not found then
    raise exception 'perfil não encontrado';
  end if;
end;
$$;

revoke execute on function public.set_recovery_phrase(text) from public, anon;

-- ---------- 5. recuperar a conta ----------
-- chamada a partir de uma conta anônima RECÉM-CRIADA (sem conteúdo).
-- Em sucesso, o perfil antigo passa a apontar para o auth.users novo
-- (as FKs on update cascade movem posts/comments/reactions/
-- notifications/reports) e o auth.users antigo é apagado — o que
-- revoga o acesso do dispositivo antigo.
--
-- Obs.: como um RAISE desfaz a transação do PostgREST, o incremento de
-- recovery_attempts feito no mesmo request é desfeito junto; o
-- rate limit persiste apenas se aplicado fora do raise (limitação
-- conhecida deste desenho — sem transação autônoma no Postgres).

create or replace function public.recover_account(target_number integer, phrase text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new    uuid := (select auth.uid());
  v_old    uuid;
  v_target record;
begin
  if v_new is null then
    raise exception 'não autenticado';
  end if;

  -- só uma conta fresca pode "receber" a conta antiga — senão o
  -- conteúdo da conta atual seria perdido no delete abaixo
  if exists (select 1 from public.posts where user_id = v_new)
     or exists (select 1 from public.comments where user_id = v_new) then
    raise exception 'esta conta já tem conteúdo — a recuperação só funciona a partir de uma conta recém-criada';
  end if;

  select id, recovery_hash, recovery_attempts, recovery_locked_until
    into v_target
    from public.profiles
   where public_number = target_number;

  -- mensagem genérica: não revelar se o número existe ou se tem frase
  if not found or v_target.recovery_hash is null then
    raise exception 'número ou frase incorretos';
  end if;

  if v_target.recovery_locked_until is not null
     and v_target.recovery_locked_until > now() then
    raise exception 'muitas tentativas — tente novamente mais tarde';
  end if;

  if v_target.recovery_hash <> extensions.crypt(phrase, v_target.recovery_hash) then
    if v_target.recovery_attempts + 1 >= 5 then
      update public.profiles
         set recovery_attempts     = 0,
             recovery_locked_until = now() + interval '1 hour'
       where id = v_target.id;
    else
      update public.profiles
         set recovery_attempts = recovery_attempts + 1
       where id = v_target.id;
    end if;
    raise exception 'número ou frase incorretos';
  end if;

  -- recuperar a própria conta é um no-op
  if v_target.id = v_new then
    return;
  end if;

  v_old := v_target.id;

  -- libera a troca de dono em posts durante a cascata (transaction-local)
  perform set_config('ecoa.recovery', 'on', true);

  -- o perfil fresco some (sem conteúdo por definição, checado acima)
  delete from public.profiles where id = v_new;

  -- o perfil antigo assume o uid novo; cascatas movem todo o conteúdo
  update public.profiles
     set id                    = v_new,
         recovery_attempts     = 0,
         recovery_locked_until = null
   where id = v_old;

  perform set_config('ecoa.recovery', '', true);

  -- revoga o acesso do dispositivo antigo
  begin
    delete from auth.users where id = v_old;
  exception when insufficient_privilege then
    null;
  end;
end;
$$;

revoke execute on function public.recover_account(integer, text) from public, anon;
