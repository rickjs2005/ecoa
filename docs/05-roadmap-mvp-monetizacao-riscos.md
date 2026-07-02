# ECOA — Parte 5: MVP, Roadmap, Monetização, Funcionalidades Futuras e Riscos

---

## 1. MVP (o menor produto que valida a tese)

**Tese a validar:** "Pessoas querem escrever sentimentos anonimamente E outras pessoas respondem com empatia suficiente para ambas voltarem."

### 1.1 Dentro do MVP

- Conta anônima por dispositivo + número público + frase de recuperação.
- Feed **Recentes** + filtro por tema (as outras ordenações ficam para depois — cronológico basta para validar).
- Publicar (texto, tema, respostas on/off), comentar (2 níveis), 6 reações.
- Moderação: Estágio 0 + Estágio 2 (LLM em 100% dos posts — na escala do MVP é barato e dá dataset rotulado para treinar o Estágio 1 depois) + fila humana simples (painel interno) + denúncia + escada de sanções.
- Fluxo de crise (CVV) no composer e na Ajuda.
- Perfil próprio, configurações essenciais, notificações de resposta + digest.
- LGPD: export, exclusão, política humana.

### 1.2 Fora do MVP (deliberadamente)

Web app · busca full-text (fase 2) · ordenações "apoiados/conversados/comunidade" · comunidades · modos temáticos · monetização · modo efêmero · múltiplos idiomas.

### 1.3 Time e prazo realistas

- 1 dev full-stack (RN + backend) + 1 designer parcial + fundador como moderador → **10–14 semanas** até beta fechado.
- Beta fechado por convite (500–2.000 pessoas, ex.: comunidades de saúde mental e escrita) antes de abrir — moderação e tom da comunidade se estabelecem com base pequena ("broken windows": os primeiros mil posts definem a cultura).

### 1.4 Critérios de sucesso do beta (go/no-go)

- ≥ 35% dos cadastrados publicam na 1ª semana.
- ≥ 60% dos posts de dor recebem ao menos 1 acolhimento em 24h.
- Retenção D30 ≥ 20%.
- Conteúdo removido < 3% dos posts.
- Pesquisa: ≥ 70% "me senti acolhido".

---

## 2. Roadmap

```
FASE 0 — Fundacão (sem. 1–4)
  design system, políticas escritas, RIPD/LGPD, infra base, auth anônima
FASE 1 — MVP beta fechado (sem. 5–14)
  feed, post, comentários, reações, moderação v1, denúncia, crise, painel admin
FASE 2 — Abertura pública BR (mês 4–6)
  busca, ordenações extras, modo Comunidade, trust score v2,
  Estágio 1 self-hosted treinado com dados do beta, hardening anti-bot
FASE 3 — Comunidade e rituais (mês 6–10)
  mural do dia, modos (diário/gratidão/desabafo/conquistas/perguntas),
  temas silenciáveis avançados, web somente-leitura
FASE 4 — Sustentabilidade (mês 10–14)
  apoiador voluntário (monetização), relatório de transparência,
  comunidades por interesse (beta), modo efêmero
FASE 5 — Escala (ano 2)
  internacionalização (ES/EN), arquitetura estágio C, eventos temáticos,
  programa de acolhedores voluntários
```

---

## 3. Funcionalidades futuras (avaliadas)

| Recurso | Descrição | Risco a vigiar |
|---|---|---|
| **Comunidades por interesse** | Espaços com regras próprias (ex.: "Maternidade", "Recomeços", "Vida adulta"), curados — criação mediante proposta aprovada, não livre | Subculturas tóxicas; exigir massa crítica de moderação |
| **Modo diário** | 1 notificação/dia opt-in ("Como foi seu dia?") → escreve e fecha, sem feed | Nenhum — é o recurso mais alinhado à missão |
| **Modo desabafo** | Post efêmero (some em 24h) e/ou com número rotativo | Abuso sob efemeridade → moderação igual, logs internos mantidos |
| **Modo gratidão / conquistas / perguntas** | Prompts guiados + tags dedicadas + coleções pessoais privadas | Virar gamificação; sem streaks |
| **Espaços temáticos / eventos** | "Semana do recomeço", mural coletivo em datas sensíveis (setembro amarelo) com apoio de instituições | Exploração comercial; parcerias só com ONGs |
| **Tags livres** | — | **Recusado**: hashtag livre = vetor de campanha/trending. Temas continuam curados |
| **Filtros por tema** | Silenciar/segurar temas (já no MVP: mute; futuro: "modo sensível" que oculta Luto/Medos temporariamente) | — |
| **Cartas ao futuro** | Escrever para si mesmo, entregue em 6/12 meses (privado) | Nenhum |
| **Acolhedores voluntários** | Usuários veteranos com selo interno (invisível ao público) priorizados no feed Comunidade para responder posts sem resposta | Criar "status" — selo jamais público |

---

## 4. Monetização (sem trair a missão)

Restrições: não vender dados, sem ads comportamentais, sem otimizar tempo de tela, sem paywall da empatia (acolhimento nunca é premium).

### 4.1 Modelo principal: **Apoiador ECOA** (assinatura voluntária, tipo Wikipedia/Signal)
- R$ 9,90/mês ou contribuição anual livre. O produto é idêntico — apoiar é um ato de comunidade, não uma compra de vantagens.
- Benefícios apenas cosméticos/simbólicos e privados: temas de cor extras, selo privado "apoio o ECOA" visível só para si, relatório pessoal anual ("seu ano em palavras", privado).
- Benchmark: 1–3% de conversão em produtos com forte alinhamento de valores. Com 1M MAU × 2% × R$ 9,90 ≈ **R$ 198 mil/mês** — paga infra (estágio B custa ~R$ 50–100 mil/mês com folga) e um time enxuto.

### 4.2 Complementares (avaliar na Fase 4+)
- **Recursos premium de utilidade pessoal** (nunca de alcance): exportação bonita do diário em PDF, cartas ao futuro ilimitadas, estatísticas pessoais privadas de humor ao longo do tempo.
- **Patrocínio institucional transparente:** instituições de saúde mental/educação financiam espaços temáticos com selo claro ("Espaço apoiado por —"), sem dados, sem segmentação, conteúdo sob nossas regras.
- **B2B "Espaços privados":** instâncias fechadas para universidades/empresas (canal anônimo de bem-estar dos alunos/funcionários), pagas pela instituição, com garantia contratual de anonimato perante o contratante. Potencial de receita alto; exige cuidado extremo de confiança.
- **Doações e grants:** fundações de saúde mental e filantropia de tecnologia cívica (o posicionamento do ECOA é elegível).

### 4.3 Recusados explicitamente
Ads de qualquer tipo no MVP e display ads para sempre · venda/compartilhamento de dados · "boost" de posts · perfis premium com destaque · marketplace de criadores.

---

## 5. Tecnologias recomendadas (resumo consolidado)

| Camada | MVP (validar rápido) | Alvo (escala) |
|---|---|---|
| Mobile | React Native + Expo | idem |
| Web | — (fase 2: Next.js 15) | Next.js no edge |
| Backend | Next.js API/Supabase Edge Functions **ou** NestJS único | NestJS monolito modular → serviços |
| Banco | Supabase Postgres (RLS) | PostgreSQL 16 particionado + réplicas → Citus/células |
| Cache/RL | Upstash Redis | Redis ElastiCache/Cluster |
| Fila | pg-boss / Supabase Queues | NATS JetStream → Kafka |
| Busca | Postgres FTS | Meilisearch → OpenSearch |
| Moderação IA | Claude Haiku (100% dos posts) | DistilBERT PT-BR self-hosted + Claude Haiku (zona cinzenta) |
| Edge/CDN | Cloudflare (WAF, cache, Turnstile) | idem + Workers |
| Infra | Vercel/Supabase gerenciados | AWS sa-east-1, ECS→EKS, Terraform |
| Observabilidade | Sentry + logs da plataforma | OpenTelemetry + Grafana stack + Sentry |
| CI/CD | GitHub Actions + EAS (Expo) | + canary/rollback automáticos |

---

## 6. Riscos do projeto e mitigações

### 6.1 Riscos de produto/comunidade (os maiores)

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| **Cold start** — feed vazio não retém ninguém | Alta | Alto | Beta fechado com comunidades-semente; mural do dia; time semeia conteúdo autêntico no início |
| **Anonimato atrai o pior** (4chan effect) | Alta | Crítico | Moderação forte desde o post nº 1; beta fechado define cultura; sanção por dispositivo; regras visíveis |
| **Concentração de tristeza** — app vira "lugar pesado", afasta usuários | Média | Alto | Temas de gratidão/conquista com espaço estrutural (mural do dia alterna tons); modo sensível; equilíbrio editorial do feed Comunidade |
| **Responsabilidade em crises reais** (suicídio anunciado na plataforma) | Média | Crítico | Fluxo de crise robusto, parceria formal com CVV, protocolo de escalação, assessoria jurídica; jamais prometer "vigilância" que não podemos cumprir |
| Desanonimização por conteúdo (usuário se expõe) | Média | Médio | Detector de PII, educação, modo efêmero, sem perfil público |
| Crescimento viral prematuro (imprensa) antes da moderação escalar | Média | Alto | Cadastro com fila de espera acionável; limites de conta nova já seguram |

### 6.2 Riscos legais/regulatórios

| Risco | Mitigação |
|---|---|
| Responsabilização por conteúdo de terceiros (cenário pós-Marco Civil art. 19 no STF: dever de cuidado ampliado) | Moderação proativa documentada + resposta rápida a notificações + assessoria jurídica desde o início |
| Requisições judiciais de identificação de usuário | Coletamos o mínimo: só IP×timestamp existe para entregar; política transparente; logs expiram em 6 meses |
| ANPD / incidente de dados | Minimização radical (pouco a vazar), RIPD, plano de resposta |
| Eleições (TSE) — pressão sobre plataformas em ano eleitoral | Política antipolítica já é o produto; canal de contato institucional; relatório de transparência |

### 6.3 Riscos técnicos/financeiros

| Risco | Mitigação |
|---|---|
| Custo de moderação por LLM explode com escala | Estágio 1 self-hosted assume 85–95% do volume; orçamento monitorado por post |
| Falso positivo silencia desabafo legítimo (dano à missão) | Bloqueio automático só ≥0.95 em categorias graves; contestação humana em 72h; métrica de reversão |
| Attestation quebra com update de OS | Fallback gracioso (modo leitura + fila de re-attestation), alerta de plataforma |
| Dependência de fornecedor (Supabase/AWS) | IaC + Postgres/Redis/NATS padrão aberto — migração sempre possível |
| Time pequeno + operação 24/7 de moderação | Fila com SLA por severidade (só H2/S2 exigem resposta rápida); LLM cobre madrugada; crescimento controlado |

---

## 7. Melhorias sugeridas (além do briefing)

1. **Modo efêmero / número rotativo** para desabafos sensíveis — resolve o maior risco real de privacidade (autoexposição).
2. **Detector de PII no composer** — proteção ativa, não só política.
3. **Fluxo de crise como cidadão de primeira classe** (CVV 188, protocolo, parceria formal) — um app de desabafo sem isso é negligente.
4. **Cap de impressões anti-viralização** — aqui ninguém "bomba"; remove o prêmio da manipulação e a ansiedade da audiência.
5. **Feed "Comunidade" que promove quem tem MENOS engajamento** (posts sem resposta) — o anti-algoritmo como identidade de produto.
6. **Denúncia oculta o conteúdo imediatamente para o denunciante** — controle emocional instantâneo, independente do veredito.
7. **Trust score invisível** governando limites — pune abuso sem criar karma público.
8. **Relatório de transparência semestral** — confiança é o ativo central de um app anônimo.
9. **"Escrever sem entrar no feed"** (modo diário via notificação) — expressão sem exposição ao scroll.
10. **Beta fechado com comunidades-semente** — cultura se define nos primeiros mil posts, não no milhão.

---

## 8. Resumo executivo (1 parágrafo)

O ECOA é uma rede social de texto puro e anonimato total, onde pessoas identificadas apenas por um número compartilham sentimentos e recebem acolhimento por meio de reações empáticas curadas — sem seguidores, sem métricas públicas, sem algoritmo de engajamento e sem espaço estrutural para política ou ódio. A arquitetura é deliberadamente simples (monolito modular Node/Postgres/Redis com moderação por IA em camadas — regras determinísticas, classificador leve e LLM — mais revisão humana), porque um produto só-texto sem grafo social escala barato; o difícil não é a técnica, é a comunidade — por isso o plano começa com beta fechado, moderação impecável desde o primeiro post, fluxo de crise integrado ao CVV, LGPD por minimização radical e monetização por apoio voluntário que nunca troca a missão por receita.
