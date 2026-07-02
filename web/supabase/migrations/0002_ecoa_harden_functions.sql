-- Hardening: funções de trigger não são API — ninguém executa via RPC
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_author_number() from public, anon, authenticated;
revoke execute on function public.guard_post_update() from public, anon, authenticated;
revoke execute on function public.guard_comment_insert() from public, anon, authenticated;
revoke execute on function public.init_post_stats() from public, anon, authenticated;
revoke execute on function public.bump_reaction_stats() from public, anon, authenticated;
revoke execute on function public.bump_comment_stats() from public, anon, authenticated;
revoke execute on function public.notify_on_comment() from public, anon, authenticated;
revoke execute on function public.auto_hide_on_reports() from public, anon, authenticated;

-- RPCs de usuário: apenas signed-in (têm checagem de auth.uid() no corpo)
revoke execute on function public.hide_comment(uuid) from public, anon;
revoke execute on function public.delete_me() from public, anon;
