# ECOA — MVP web (Next.js + Supabase)

Rede social 100% texto e anônima. Blueprint completo em [`../docs/`](../docs/README.md).

## Stack

- **Next.js 16** (App Router, Turbopack, `src/proxy.ts` para sessão) + Tailwind v4
- **Supabase**: Postgres com RLS + privilégios de coluna, auth anônima (`signInAnonymously`), triggers para número público/stats/notificações
- **Moderação**: Estágio 0 determinístico (`src/lib/moderation.ts`) + Estágio 2 opcional com Claude Haiku (`ANTHROPIC_API_KEY`)

## Rodar

```bash
npm install
cp .env.example .env.local   # preencha URL + publishable key do Supabase
npm run dev
```

Pré-requisitos no projeto Supabase:

1. Migrations de `supabase/migrations/` aplicadas em ordem (0001 → 0004).
2. **Allow anonymous sign-ins** habilitado (Authentication → Sign In / Providers).

## Estrutura

```
src/
  proxy.ts               # renova sessão + redireciona quem não tem conta p/ /bem-vindo
  lib/
    supabase/            # clients browser/server (@supabase/ssr)
    moderation.ts        # pipeline de moderação (regras + Claude Haiku)
    reactions.ts         # as 6 reações empáticas
  app/
    actions.ts           # server actions (posts, comentários, reações, denúncias, LGPD)
    bem-vindo/           # onboarding em 3 cartões + revelação do número
    (app)/               # shell com tab bar
      page.tsx           # feed cronológico + filtro por tema + marco de respiro
      escrever/          # composer (aviso de PII, fluxo de crise CVV)
      post/[id]/         # detalhe + reações + comentários (2 níveis)
      voce/              # perfil anônimo + exclusão de conta (LGPD)
      notificacoes/      # respostas ao que você escreveu
      ajuda/             # CVV 188 + regras da comunidade
supabase/migrations/     # schema completo (RLS, triggers, view feed_posts)
```

## Decisões de segurança/privacidade

- `posts.user_id` e `comments.user_id` têm SELECT **revogado por coluna** — o cliente nunca lê o vínculo conta↔conteúdo; a autoria pública é só o `author_number`.
- Conteúdo denunciado some do feed do denunciante na hora (view `feed_posts`); 3 denunciantes distintos ocultam para todos até revisão.
- Quem escreve sobre a própria dor nunca é bloqueado — o composer mostra o CVV (188) e publica se a pessoa quiser.
- Moderação por IA é fail-open: indisponibilidade da API não impede desabafos.
