[English](README.md) · **Português**

# ECOA — rede social anônima só de texto

Rede social 100% texto e anônima para expressão emocional: cada pessoa é só um número (`Usuário #4821`), sem fotos, seguidores, links ou algoritmo de engajamento. MVP web em Next.js + Supabase, com moderação em camadas (regras determinísticas + Claude Haiku opcional, só no servidor).

> **Tipo:** produção (MVP) · **Demo:** https://ecoa-teal.vercel.app

![Onboarding do ECOA](docs/screenshots/onboarding.webp)

<details>
<summary>Mais uma captura</summary>

![Cartão "Você é um número" do onboarding](docs/screenshots/onboarding-number.webp)
</details>

## Funcionalidades

- **Identidade anônima:** conta por navegador via auth anônima do Supabase (`signInAnonymously`); número público aleatório gerado por trigger; sem perfil público navegável.
- **Anti-desanonimização:** `posts.user_id` e `comments.user_id` têm SELECT **revogado por coluna** — o cliente nunca lê o vínculo conta↔conteúdo; a autoria pública é só o `author_number`.
- **Conteúdo:** posts de 1–2000 caracteres em temas curados, comentários em 2 níveis, 6 reações empáticas, edição de post por 15 min, exclusão com confirmação.
- **Feed:** cronológico, filtro por tema, "Carregar mais" com cursor keyset e marco de pausa.
- **Moderação:** Estágio 0 determinístico (links, blocklist de ódio, aviso de dados pessoais, sinais de crise) + Estágio 2 opcional com Claude Haiku. Denúncias ocultam o conteúdo na hora para quem denunciou; 3 denunciantes distintos ocultam para todos até revisão.
- **Acolhimento em crise:** quem escreve sobre a própria dor nunca é bloqueado — o composer mostra o CVV (188) e publica se a pessoa quiser.
- **Recuperação de conta:** frase de 6 palavras (hash bcrypt) que transfere a conta para outro dispositivo.
- **LGPD:** páginas `/privacidade` e `/regras`; `delete_me` apaga perfil, conteúdo e o usuário de auth.
- **Notificações in-app** de respostas (sem push).

## Stack

- **Next.js 16** (App Router, Turbopack, `src/proxy.ts` para sessão), React 19, Tailwind CSS v4, TypeScript
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`): Postgres com RLS nas 8 tabelas + privilégios por coluna, auth anônima, triggers (número público, estatísticas, notificações), funções `security definer` endurecidas
- **Anthropic SDK** (`@anthropic-ai/sdk`) — usado só em `web/src/lib/moderation.ts`, chamado por server actions; a chave nunca vai ao navegador

## Rodar localmente

Pré-requisitos: Node.js 20.9+ e npm; um projeto Supabase.

No projeto Supabase:

1. Aplique as migrations de `web/supabase/migrations/` em ordem (0001 → 0004).
2. Habilite **Allow anonymous sign-ins** (Authentication → Sign In / Providers).

```bash
cd web
npm ci
cp .env.example .env.local   # preencha URL + publishable key do Supabase
npm run dev
```

### Variáveis de ambiente (`web/.env.example`)

| Variável | Obrigatória | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | sim | Chave publishable (pública por design; a proteção é o RLS) |
| `ANTHROPIC_API_KEY` | não | Habilita o Estágio 2 de moderação; só no servidor, nunca com prefixo `NEXT_PUBLIC_` |

## Scripts (`web/`)

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build |
| `npm run lint` | ESLint |
| `node --env-file=.env.local scripts/e2e.mjs` | Teste de ponta a ponta do banco (19 cenários: privacidade de coluna, denúncias, recuperação, exclusão LGPD). **Cria e apaga contas anônimas e conteúdo no projeto Supabase apontado** — use um projeto de teste. |

## Estrutura

```
docs/                      # blueprint do produto, status de implementação, auditoria de UX
web/
  src/
    proxy.ts               # renova sessão + redireciona quem não tem conta p/ /bem-vindo
    lib/
      supabase/            # clients browser/server (@supabase/ssr)
      moderation.ts        # pipeline de moderação (regras + Claude Haiku, só servidor)
      reactions.ts         # as 6 reações empáticas
    app/
      actions.ts           # server actions (posts, comentários, reações, denúncias, LGPD)
      bem-vindo/           # onboarding em 3 cartões + número + recuperação de conta
      (app)/               # shell com tab bar: feed, escrever, post/[id], voce, notificacoes, ajuda
      privacidade/ regras/ # páginas públicas
  scripts/e2e.mjs          # teste de ponta a ponta contra o Supabase
  supabase/migrations/     # schema completo (RLS, triggers, view feed_posts)
```

Documentação do produto: [docs/README.md](docs/README.md) · status do que foi construído: [docs/implementacao-status.md](docs/implementacao-status.md).

## Decisões de segurança e privacidade

- RLS habilitado em todas as 8 tabelas; colunas de autoria com SELECT revogado.
- Conteúdo denunciado some do feed do denunciante na hora (view `feed_posts`).
- A moderação por IA é **fail-open por decisão de produto**: sem `ANTHROPIC_API_KEY`, ou se a API estiver indisponível, vale só o Estágio 0 determinístico — indisponibilidade não impede desabafos.

## Limitações

- Web responsivo apenas (sem app nativo); sem busca, sem push.
- Anti-bot limitado ao rate-limit do Supabase; CAPTCHA invisível recomendado antes de divulgação ampla.
- Revisão humana de denúncias feita pelo dashboard do Supabase (tabela `reports`).
- 3 erros de lint pré-existentes (regras `react-hooks/purity` e `react-hooks/set-state-in-effect`).

## Segurança

Veja [SECURITY.md](SECURITY.md) para reportar vulnerabilidades. Não abra issues públicas com detalhes de falhas.

## Licença

Ainda não há licença definida; todos os direitos reservados ao autor.
