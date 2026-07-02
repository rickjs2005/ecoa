# ECOA — Parte 4: Arquitetura Técnica, Banco de Dados, APIs e Escala

---

## 1. Visão geral da arquitetura

Estratégia: **monolito modular primeiro, microserviços por dor real depois.** Um produto só-texto tem payloads minúsculos — a arquitetura pode ser simples e ainda assim atender milhões. Complexidade prematura é o maior risco técnico do projeto.

### 1.1 Diagrama (estado-alvo, fase de crescimento)

```
                                   ┌─────────────────────────┐
   ┌──────────────┐                │  Cloudflare (edge)      │
   │ App iOS/     │   HTTPS/TLS1.3 │  • CDN / cache API GET  │
   │ Android      ├───────────────►│  • WAF + rate limit L7  │
   │ (React Native)│               │  • DDoS protection      │
   └──────────────┘                └───────────┬─────────────┘
   ┌──────────────┐                            ▼
   │ Web (Next.js)│──────────────► ┌─────────────────────────┐
   └──────────────┘                │  API Gateway / LB       │
                                   │  (ALB + Kong ou similar)│
                                   └───────────┬─────────────┘
                                               ▼
                     ┌─────────────────────────────────────────────┐
                     │        CORE API (monolito modular)          │
                     │  NestJS (Node/TS) — módulos:                │
                     │  identity · posts · comments · reactions ·  │
                     │  feed · reports · notifications · search-api│
                     │  (stateless, N réplicas, k8s/ECS)           │
                     └──┬─────────┬─────────┬──────────┬───────────┘
                        │         │         │          │
             ┌──────────▼──┐ ┌────▼────┐ ┌──▼───────┐ ┌▼──────────────┐
             │ PostgreSQL  │ │ Redis   │ │ NATS/    │ │ OpenSearch/   │
             │ (primary +  │ │ cache + │ │ Kafka    │ │ Meilisearch   │
             │  réplicas,  │ │ rate-   │ │ (eventos)│ │ (busca texto) │
             │  particionado)│ limit   │ └──┬───────┘ └───────────────┘
             └─────────────┘ └─────────┘    │
                                            ▼  consumidores assíncronos
                     ┌─────────────────────────────────────────────┐
                     │ WORKERS                                     │
                     │ • moderation-worker (Estágio 1: modelo local│
                     │   + Estágio 2: Claude API)                  │
                     │ • notification-worker (FCM/APNs, digests)   │
                     │ • trust-worker (scores, grafos de coordenação)│
                     │ • search-indexer                            │
                     │ • analytics-agg (métricas k-anônimas)       │
                     └─────────────────────────────────────────────┘

  Transversais: S3 (backups/exports LGPD) · KMS/Vault (segredos) ·
  OpenTelemetry → Grafana/Loki/Tempo + Sentry · Terraform · GitHub Actions
```

### 1.2 Decisões e justificativas

| Camada | Escolha | Por quê |
|---|---|---|
| App mobile | **React Native + Expo** | 1 codebase iOS/Android; app é 90% listas de texto (caso perfeito p/ RN); OTA updates p/ microcopy/regras; time pequeno |
| Web | **Next.js 15** (fase 2) | Leitura pública com SSR/SEO opcional; stack já dominada |
| Backend | **NestJS (Node/TS)** monolito modular | Tipos compartilhados com o front; módulos viram serviços quando (e se) doer; contratação fácil |
| Banco | **PostgreSQL 16** | Relacional, ACID, particionamento nativo, full-text razoável p/ MVP; é o padrão-ouro até dezenas de milhões de usuários |
| Cache | **Redis (ElastiCache)** | Cache de feed/sessões + rate limiting (sliding window) + locks |
| Mensageria | **NATS JetStream** (ou SQS no início) | Eventos post.created → moderação/busca/notificação; simples de operar; Kafka só se o volume justificar (fase 10M+) |
| Busca | **Meilisearch** → OpenSearch na escala | Full-text PT-BR com typo-tolerance; Postgres FTS serve no MVP |
| Moderação IA | Modelo leve self-hosted (Estágio 1) + **Claude Haiku** via API (Estágio 2) | Custo/latência calibrados por estágio (ver Parte 3) |
| Auth | Chave assimétrica no device (attestation) + JWT próprio | Sem senha, sem e-mail obrigatório — auth de terceiros (Auth0 etc.) não modela isso bem |
| Storage | S3 apenas p/ backups e exports LGPD | Não há mídia de usuário — storage é trivial |
| CDN/Edge | Cloudflare | CDN p/ feed público cacheado, WAF, rate limit L7, DDoS, Turnstile |
| Infra | AWS `sa-east-1` (São Paulo), ECS Fargate → EKS | Data residency BR, latência BR; Fargate primeiro (menos ops) |
| IaC | Terraform + ambientes dev/staging/prod | Reprodutível, revisável |
| CI/CD | GitHub Actions: lint→test→build→scan→deploy staging→canary prod | Canary 5% com rollback automático por métrica |
| Observabilidade | OpenTelemetry + Grafana stack (Loki/Tempo/Mimir) + Sentry + UptimeRobot | Padrão aberto, sem lock-in |

**Atalho de MVP (recomendado para validar em semanas, não meses):** Next.js full-stack + **Supabase** (Postgres + Auth anônima + Realtime + Edge Functions) + Cloudflare na frente + workers de moderação em fila (Supabase Queues/pg-boss). O schema abaixo é 100% compatível; a migração para a arquitetura-alvo é evolução, não reescrita. Row Level Security cobre as regras de acesso do MVP.

---

## 2. Banco de dados (projeto completo)

### 2.1 Diagrama entidade-relacionamento

```
users 1──N posts 1──N comments
  │            │  1──N reactions (em post)
  │            │  1──N reports (alvo post)
  │            └──1──N post_stats (agregados)
  ├──N comments ──N comment_reactions / reports (alvo comment)
  ├──N reports (como denunciante)
  ├──N sanctions
  ├──N devices
  ├──N notifications
  └──1 user_settings / 1 trust_scores
topics 1──N posts
moderation_queue N──1 (posts|comments)
moderation_decisions N──1 moderation_queue
```

### 2.2 Tabelas

```sql
-- =========== IDENTIDADE ===========
users (
  id              uuid PK default gen_random_uuid(),
  public_number   int  UNIQUE NOT NULL,        -- #48291; gerado por permutação (ver 2.4)
  status          text NOT NULL default 'active', -- active|suspended|banned|deleted
  created_at      timestamptz NOT NULL default now(),
  suspended_until timestamptz NULL,
  -- recuperação opcional (cifrado em nível de app):
  recovery_email_hash bytea NULL,              -- HMAC-SHA256(email, pepper)
  recovery_phrase_hash bytea NULL              -- argon2id
)
-- índices: UNIQUE(public_number); (status) parcial WHERE status <> 'active'

devices (
  id              uuid PK,
  user_id         uuid FK->users NOT NULL,
  device_pubkey   bytea UNIQUE NOT NULL,       -- chave do secure enclave
  platform        text NOT NULL,               -- ios|android|web
  attestation_ok  boolean NOT NULL,
  push_token      text NULL,
  last_seen_at    timestamptz,
  created_at      timestamptz
)
-- índices: UNIQUE(device_pubkey); (user_id)

user_settings (
  user_id         uuid PK FK->users,
  theme           text default 'system',
  default_sort    text default 'recent',
  quiet_hours     int4range default '[22,8)',
  pause_reminder_min int default 0,            -- 0 = off
  digest_mode     boolean default true,
  muted_topics    smallint[] default '{}'
)

trust_scores (
  user_id         uuid PK FK->users,
  score           real NOT NULL default 0.3,   -- 0..1
  report_precision real,                       -- qualidade das denúncias
  updated_at      timestamptz
)

-- =========== CONTEÚDO ===========
topics (
  id smallint PK, slug text UNIQUE, name text, sensitive boolean default false
)  -- tabela curada (~13 linhas), imutável por usuários

posts (
  id              uuid PK,                     -- UUIDv7 (ordenável por tempo)
  user_id         uuid FK->users NOT NULL,
  topic_id        smallint FK->topics NOT NULL default 1,
  body            text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  lang            text default 'pt',
  replies_enabled boolean NOT NULL default true,
  status          text NOT NULL default 'pending', -- pending|published|hidden|removed|deleted
  simhash         bigint NOT NULL,             -- dedupe/spam
  edited_at       timestamptz NULL,
  created_at      timestamptz NOT NULL default now()
) PARTITION BY RANGE (created_at);             -- partições mensais
-- índices por partição:
--   (status, created_at DESC, id DESC)        → feed cronológico (keyset)
--   (topic_id, status, created_at DESC)       → feed por tema
--   (user_id, created_at DESC)                → "meus posts"
--   GIN (to_tsvector('portuguese', body))     → busca (até migrar p/ Meilisearch)
--   (simhash)                                 → dedupe

comments (
  id              uuid PK,                     -- UUIDv7
  post_id         uuid NOT NULL,               -- FK lógica (partição)
  user_id         uuid FK->users NOT NULL,
  parent_id       uuid NULL,                   -- 1 nível de resposta
  body            text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  status          text NOT NULL default 'pending',
  hidden_by_author boolean NOT NULL default false, -- autor do post ocultou
  created_at      timestamptz NOT NULL default now()
) PARTITION BY RANGE (created_at);
-- índices: (post_id, status, created_at); (user_id, created_at DESC); (parent_id)

reactions (
  post_id         uuid NOT NULL,
  user_id         uuid NOT NULL,
  kind            smallint NOT NULL,           -- 1..6 (tabela reaction_kinds)
  created_at      timestamptz default now(),
  PRIMARY KEY (post_id, user_id)               -- 1 reação por usuário/post
)
-- índice: (user_id, created_at DESC)
comment_reactions ( comment_id, user_id, PK(comment_id, user_id), created_at )

post_stats (                                    -- agregados desnormalizados (evita COUNT quente)
  post_id         uuid PK,
  reaction_counts int[] NOT NULL default '{0,0,0,0,0,0}',
  comment_count   int NOT NULL default 0,
  unique_commenters int NOT NULL default 0,
  impressions     int NOT NULL default 0,      -- p/ cap anti-viralização
  updated_at      timestamptz
)  -- atualizado por evento (worker), não em transação com o write do usuário

-- =========== MODERAÇÃO ===========
reports (
  id              uuid PK,
  reporter_id     uuid FK->users NOT NULL,
  target_type     text NOT NULL,               -- post|comment
  target_id       uuid NOT NULL,
  category        text NOT NULL,               -- taxonomia H1..M1
  detail          text NULL,
  weight          real NOT NULL,               -- trust do denunciante no momento
  created_at      timestamptz,
  UNIQUE (reporter_id, target_type, target_id) -- 1 denúncia por alvo por pessoa
)
-- índices: (target_type, target_id); (created_at)

moderation_queue (
  id              uuid PK,
  target_type     text NOT NULL, target_id uuid NOT NULL,
  source          text NOT NULL,               -- ai_stage1|ai_stage2|reports|sample|appeal
  ai_scores       jsonb,                       -- {H1:0.2, S1:0.9, ...}
  priority        real NOT NULL,               -- severidade × alcance × recência
  state           text NOT NULL default 'open',-- open|in_review|resolved
  created_at      timestamptz
)
-- índices: (state, priority DESC); UNIQUE(target_type, target_id) WHERE state='open'

moderation_decisions (
  id uuid PK, queue_id uuid FK, decided_by text, -- ai|human:<reviewer_id>
  decision text NOT NULL,                        -- keep|remove|remove_sanction
  category text NULL, rationale text, created_at timestamptz
)

sanctions (
  id uuid PK, user_id uuid FK->users, level smallint NOT NULL, -- 1..5
  category text NOT NULL, source_decision uuid FK,
  starts_at timestamptz, ends_at timestamptz NULL,             -- NULL = permanente
  appealed boolean default false, appeal_result text NULL
)
-- índices: (user_id, ends_at); parcial WHERE ends_at IS NULL

banned_devices ( device_pubkey_hash bytea PK, reason text, created_at timestamptz )
banned_phone_hashes ( phone_hash bytea PK, created_at timestamptz )  -- escalada anti-abuso

-- =========== NOTIFICAÇÕES ===========
notifications (
  id uuid PK, user_id uuid NOT NULL, kind text NOT NULL, -- reply|digest|moderation|system
  payload jsonb NOT NULL, read_at timestamptz NULL, created_at timestamptz
) PARTITION BY RANGE (created_at);
-- índice: (user_id, created_at DESC); TTL: purge após 90 dias

-- =========== AUDITORIA/LGPD ===========
audit_logs (                                    -- acessos administrativos e correlações
  id uuid PK, actor text, action text, target text, justification text, created_at timestamptz
)  -- WORM: append-only, sem UPDATE/DELETE (revogado por GRANT)
access_logs                                     -- IP × timestamp (Marco Civil) — store SEGREGADO,
                                                -- criptografado, TTL 6 meses, acesso via ticket
```

### 2.3 Boas práticas adotadas

- **UUIDv7** para posts/comments: ordenável por tempo → índices B-tree eficientes, keyset pagination natural, sem hotspot de página.
- **Particionamento mensal** de posts/comments/notifications: purge/arquivamento barato (DETACH), índices menores, vacuum saudável.
- **Contadores desnormalizados** (`post_stats`) atualizados via evento, nunca `COUNT(*)` no caminho quente; reconciliação noturna corrige drift.
- **Soft delete → hard delete:** `status='deleted'` imediato (some da leitura), job apaga o corpo em 30 dias (janela de arrependimento + obrigações), exceto conteúdo preservado por obrigação legal (S2/ameaça, em cofre segregado).
- FKs de comments→posts lógicas (partições não suportam FK direta); integridade garantida na aplicação + verificação periódica.
- Sem ORM mágico no caminho quente: queries nomeadas e revisadas (EXPLAIN no CI para as top-10).
- `statement_timeout` e `idle_in_transaction_session_timeout` agressivos; pgbouncer/pgcat em transaction mode.

### 2.4 Geração do número público

Permutação de Feistel sobre o espaço `[10000, 9999999]` com chave secreta: `public_number = feistel(seq_nextval)`. Resultado: números únicos, aparentemente aleatórios, sem colisão, sem revelar ordem/tamanho da base, sem tabela de sorteio.

---

## 3. APIs

### 3.1 REST vs GraphQL — decisão: **REST**

GraphQL brilha quando clientes diversos compõem consultas imprevisíveis sobre um grafo rico. O ECOA é o oposto: **um cliente nosso, meia dúzia de telas, consultas fixas e rasas** (feed → post → comentários). REST versionado ganha em:
- cacheabilidade por URL no edge (feed público cacheado no Cloudflare — impossível com POST /graphql sem ginástica);
- rate limiting e WAF por rota (essencial no nosso modelo de abuso);
- simplicidade operacional e de segurança (sem query depth attacks, sem N+1 resolvers).
Se um dia houver múltiplos clientes de terceiros (não planejado), reavaliamos.

### 3.2 Convenções

`https://api.ecoa.app/v1` · JSON · autenticação Bearer JWT · erros RFC 9457 (problem+json) · paginação por cursor opaco (`?cursor=&limit=`) · idempotência por `Idempotency-Key` nos POSTs de conteúdo.

### 3.3 Endpoints

```
AUTH / IDENTIDADE
POST   /auth/register            body: device_pubkey, attestation_token, pow_solution
                                 → cria user + devolve tokens (201)
POST   /auth/token               refresh rotativo
POST   /auth/recovery/phrase     gera frase (autenticado)
POST   /auth/recovery/redeem     recupera conta em novo device (frase ou e-mail)
DELETE /auth/sessions            logout (revoga família de tokens)

USUÁRIO (sempre o próprio — não existe GET /users/{outro})
GET    /me                       número, criado_em, status, sanções ativas
GET    /me/posts?cursor=
GET    /me/comments?cursor=
GET    /me/settings   PATCH /me/settings
GET    /me/export                → job assíncrono, link p/ JSON (LGPD)
DELETE /me                       exclusão de conta (confirmação em 2 passos)

FEED / POSTS
GET    /feed?sort=recent|supported|discussed|community&topic=&cursor=&limit=
GET    /posts/{id}               post + stats agregadas
POST   /posts                    body: {body, topic_id?, replies_enabled?}
                                 → 201 published | 202 pending (fila) | 422 policy_violation
PATCH  /posts/{id}               edição (janela 15 min, só autor)
DELETE /posts/{id}               só autor
POST   /posts/{id}/impressions   batch de telemetria mínima (cap anti-viralização)

COMENTÁRIOS
GET    /posts/{id}/comments?cursor=
POST   /posts/{id}/comments      body: {body, parent_id?}
DELETE /comments/{id}            só autor
POST   /comments/{id}/hide       só autor DO POST (ocultar no próprio post)

REAÇÕES
PUT    /posts/{id}/reaction      body: {kind}  (idempotente; troca substitui)
DELETE /posts/{id}/reaction
PUT    /comments/{id}/reaction   (kind fixo "apoio")

BUSCA
GET    /search?q=&topic=&cursor=       (full-text; nunca filtra por usuário)

DENÚNCIA / MODERAÇÃO (usuário)
POST   /reports                  body: {target_type, target_id, category, detail?}
GET    /me/reports               status das minhas denúncias
POST   /appeals                  contestar sanção/remoção
GET    /me/sanctions

NOTIFICAÇÕES
GET    /notifications?cursor=
POST   /notifications/read       body: {ids[] | all}
PUT    /me/push-token

SISTEMA
GET    /topics                   lista curada
GET    /policies/community       versão vigente das regras (cacheada)
GET    /health                   liveness/readiness

ADMIN (rede separada, VPN + SSO + MFA, audit em tudo)
GET    /admin/queue?state=&cursor=          fila de moderação priorizada
POST   /admin/queue/{id}/decision
GET    /admin/users/{uuid}/history          (justificativa obrigatória → audit_log)
POST   /admin/sanctions  /admin/bans/device
GET    /admin/metrics/moderation
```

### 3.4 Eventos internos (mensageria)

```
post.created / comment.created  → moderation-worker, search-indexer
post.published                  → notification-worker (respostas), stats
moderation.decided              → sanctions, notificações, feedback denunciante
reaction.added                  → stats-aggregator (batch 5s)
report.created                  → queue-scorer
user.deleted                    → cascata LGPD (purge search, cache, push)
```

---

## 4. Performance e escalabilidade (100 mil → 100 milhões)

Premissas de carga (texto puro = payloads de ~1–3 KB; leitura:escrita ≈ 50:1):

| Estágio | MAU | Pico req/s (API) | Posts/dia |
|---|---|---|---|
| A | 100 mil | ~200–500 | ~30 mil |
| B | 1 milhão | ~2–5 mil | ~300 mil |
| C | 10 milhões | ~20–50 mil | ~3 milhões |
| D | 100 milhões | ~200–500 mil | ~30 milhões |

### Estágio A — 100 mil usuários (arquitetura MVP aguenta com folga)
- 2–3 réplicas da API atrás do LB; Postgres single-primary (ex.: 4 vCPU) + 1 réplica de leitura; Redis pequeno; fila gerenciada (SQS/pg-boss).
- Feed cronológico = 1 query keyset em índice — Postgres sozinho entrega isso a milhares de req/s.
- Cache Cloudflare para `GET /feed?sort=recent` anônimo (TTL 10–30s) já absorve a maioria da leitura.
- **Custo estimado: US$ 500–1.500/mês.** Nada exótico é necessário.

### Estágio B — 1 milhão
- API autoscaling (5–15 réplicas); Postgres maior + 2–3 réplicas de leitura (leituras de feed/busca vão para réplica); pgbouncer obrigatório.
- Redis passa a guardar as **listas de feed materializadas** ("supported/discussed/community" recalculadas por worker a cada 30–60s — são globais, não por usuário: 1 chave por ordenação × tema, barato e sem fan-out).
- Meilisearch dedicado para busca (tira o GIN do caminho).
- NATS/Kafka para eventos; workers escalam horizontalmente por lag da fila.
- Moderação: Estágio 1 self-hosted em GPU pequena/CPU (batch); orçamento de LLM ~10% dos textos.

### Estágio C — 10 milhões
- **Particionamento já existente vira arma:** partições antigas migram para storage frio; working set cabe em RAM.
- Postgres: primary robusto + 4–6 réplicas; considerar **Citus/particionamento por hash de post_id** para writes se o primary saturar (~5–10k writes/s é o sinal); contadores movem para Redis com flush batch.
- CQRS leve: caminho de leitura (feed) servido por réplicas + Redis + edge cache; caminho de escrita isolado.
- Multi-AZ ativo; DR com réplica cross-region (RPO < 5 min).
- OpenSearch cluster para busca; Kafka de verdade para o firehose de eventos.
- Times de moderação humana regionalizados; pipeline de IA com autoscaling por fila.

### Estágio D — 100 milhões
- **Arquitetura celular:** dividir a base em células independentes (ex.: por faixa de user_id), cada célula com seu Postgres/Redis/API — blast radius limitado, escala linear. O feed global é o único componente cross-cell (serviço próprio, alimentado por Kafka, materializado em Redis Cluster/ScyllaDB).
- Alternativa de storage para conteúdo: manter Postgres shardado (Citus/Vitess-like) ou mover posts para um wide-column (Scylla) mantendo Postgres para identidade/moderação — decidir com dados reais.
- Edge computing: feed público renderizado/cacheado no edge (Cloudflare Workers + cache regional), invalidação por evento.
- Time de plataforma dedicado, SRE on-call, error budgets formais.
- A boa notícia estrutural: **sem mídia e sem grafo social (sem seguidores), o problema mais caro das redes — fan-out de timeline personalizada — simplesmente não existe aqui.** O ECOA escala como um "leitor de listas globais", que é ordens de magnitude mais barato que um Twitter.

### 4.1 Metas de performance (SLO)

- p95 de `GET /feed` < 250 ms; p95 de `POST /posts` < 400 ms (incluindo Estágio 0/1 de moderação).
- Disponibilidade 99,9% (Estágios A–B) → 99,95% (C+).
- Cold start do app → feed visível < 2 s em 4G.

### 4.2 Observabilidade e operação

- OpenTelemetry (traces em 100% dos erros, 1% amostrado no sucesso); RED metrics por endpoint; dashboards por SLO.
- Logs estruturados (JSON) com `trace_id`; **nunca logar corpo de post nem IP junto de user_id** no log de aplicação (privacidade por design — correlação só no store segregado).
- Alertas: burn rate de SLO, lag de fila de moderação (conteúdo pendente > X min é incidente), taxa de 429/403 (ataque), drift de contadores.
- Runbooks: incidente de moderação (onda de ódio), vazamento suspeito, DDoS, falha de attestation em massa (release nova de OS).
- Deploy: canary 5% → 25% → 100% com rollback automático por p95/erro; migrações de banco sempre backward-compatible (expand → migrate → contract).
