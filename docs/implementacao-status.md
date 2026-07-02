# ECOA — Status de implementação (julho/2026)

> O que do blueprint está construído, o que divergiu de propósito e como operar o que existe.

## Onde as coisas estão

| Coisa | Onde |
|---|---|
| Produção | https://ecoa-teal.vercel.app (projeto Vercel `ecoa`, conta rickjs2005) |
| Código | `web/` neste repositório (Next.js 16 + Tailwind v4 + Supabase) |
| Banco | Supabase, projeto `ecoa`, ref `duglkbtapxwngrbywbkf`, região `sa-east-1` |
| Migrations | `web/supabase/migrations/0001…0004` (aplicadas em produção nessa ordem) |
| Teste e2e | `node scripts/e2e.mjs` dentro de `web/` — 19 cenários contra o banco real |
| Deploy | `vercel deploy --prod --yes` dentro de `web/` (deploy por git ainda não conectado) |
| Env | `web/.env.example` → `.env.local`; na Vercel: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |

## Implementado (MVP + auditoria aplicada)

- **Identidade anônima**: conta por navegador via `signInAnonymously`; número público aleatório gerado por trigger; exibição com 4+ dígitos (`#0001`); sem perfil público navegável.
- **Anti-desanonimização**: `posts.user_id`/`comments.user_id` com SELECT revogado por coluna — nem via API dá para ligar conta ↔ conteúdo; autoria pública é só o `author_number` denormalizado.
- **Conteúdo**: posts (1–2000 chars, 13 temas curados, "só quero ser ouvido"), comentários em 2 níveis (3º nível achata), 6 reações com frase, edição de post por 15 min (trigger no banco + UI), exclusões com modal próprio.
- **Feed**: cronológico, filtro por tema, "Carregar mais" aditivo com cursor keyset composto, reação rápida no card, clamp de posts longos, marco de respiro (~60 posts), skeletons por rota.
- **Moderação**: Estágio 0 determinístico (`web/src/lib/moderation.ts` — links, blocklist de ódio, PII, sinais de crise) + Estágio 2 com Claude Haiku (`claude-haiku-4-5`, structured outputs, fail-open) quando `ANTHROPIC_API_KEY` presente; denúncias com ocultação imediata para o denunciante e auto-remoção com 3+ denunciantes (contas com 1h+ de vida); fluxo de crise CVV 188 que nunca bloqueia desabafo.
- **Recuperação de conta**: frase de 6 palavras (wordlist 240, ~47 bits) com hash bcrypt; RPC `recover_account` transfere a conta para um novo dispositivo via FKs `on update cascade` e revoga o antigo; UI em Você + `/bem-vindo/recuperar`.
- **LGPD/confiança**: `/privacidade` e `/regras` públicas e linkadas no aceite; `delete_me` apaga perfil + conteúdo + registro em `auth.users`; favicon/OG próprios; erros humanizados em PT.
- **Acessibilidade**: `:focus-visible` global, `role=alert/status` em erros e avisos, `aria-current/pressed`, alvos ≥44px, safe-area, contraste AA/AAA verificado.
- **Notificações**: in-app (respostas ao seu post/comentário), via trigger; sem push.
- **Desktop**: 2 colunas ≥lg com trilho lateral (sobre + CVV) e navegação de topo.

## Divergências conscientes do blueprint (MVP)

| Blueprint | MVP construído | Motivo |
|---|---|---|
| App React Native + Expo | Web responsivo (mobile-first) | Validar mais rápido; RN fica p/ tração |
| Ordenações "Apoiados/Conversados/Comunidade" | Só cronológico + tema | Cronológico basta p/ validar; demais são fase 2 |
| Busca full-text | Não implementada | Fase 2 |
| Notificações push + digest | Só in-app | Push exige infra FCM/APNs |
| Device attestation + PoW anti-bot | Nada além do rate-limit do Supabase (30 signups/h/IP) | É conceito de app nativo; p/ web, ativar CAPTCHA invisível antes de abrir ao público |
| Fila de moderação humana própria | Dashboard do Supabase (tabela `reports`) | Suficiente até ter volume |
| Soft-delete com purga em 30d | Hard delete imediato | Mais simples e mais LGPD |
| Números via permutação de Feistel | Sorteio aleatório com unicidade | Efeito idêntico nesta escala |

## Pendências conhecidas

1. **Domínio próprio** — depende de registro pelo Rick; depois `vercel domains add`.
2. **`ANTHROPIC_API_KEY` na Vercel** — aguarda créditos na conta Anthropic (US$ 0,01 hoje); sem ela vale só o Estágio 0.
3. **CAPTCHA invisível (Turnstile)** nos signups anônimos — recomendado pelo Supabase antes de divulgar o app.
4. **Deploy por git** — repo GitHub existe (`rickjs2005/ecoa`) mas não está conectado à Vercel.
5. Contas órfãs de teste no banco (limpar em Auth → Users no dashboard, se incomodar).
6. Rate-limit de tentativas da frase de recuperação é revertido junto com a transação do erro (limitação Postgres; a entropia da frase + bcrypt são a defesa real).

## Histórico de qualidade

- Code review multi-agente (30 candidatos → 16 problemas reais corrigidos — ver mensagens do commit inicial).
- Auditoria UX completa: [auditoria-ux-v1.md](auditoria-ux-v1.md) — nota geral 7,3; melhorias imediatas, de curto e de médio prazo **todas aplicadas** (exceto domínio próprio).
- Security advisors do Supabase: sem pendências relevantes (2 avisos aceitos: RPCs `hide_comment`/`delete_me` executáveis por autenticados — têm checagem de `auth.uid()` no corpo).
- E2e: 19/19 cenários, incluindo privacidade de coluna, moderação estrutural, recuperação de conta e exclusão LGPD.
