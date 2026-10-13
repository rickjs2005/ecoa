# ECOA — Blueprint completo do produto

> Rede social 100% texto e 100% anônima para expressão emocional saudável.
> Usuários são apenas números (`Usuário #48291`). Sem fama, sem seguidores, sem algoritmo viciante.

**Status:** MVP **implementado e em produção** — https://ecoa-teal.vercel.app (código em [`../web/`](../README.pt-BR.md)).
**Data:** julho/2026 · **Nome de trabalho:** ECOA (trocável).

> Este blueprint é o documento de *design* original. O que foi construído segue o
> blueprint com as divergências conscientes listadas em
> [implementacao-status.md](implementacao-status.md). A auditoria de UX pós-MVP
> está em [auditoria-ux-v1.md](auditoria-ux-v1.md).

## Estrutura do documento

| Parte | Arquivo | Conteúdo |
|---|---|---|
| 1 | [01-visao-produto.md](01-visao-produto.md) | Visão, proposta de valor, anti-objetivos, métricas de saúde, modelo de identidade anônima, todas as regras de negócio (posts, comentários, reações, temas, contas, notificações), fluxos principais, princípios de decisão |
| 2 | [02-experiencia-usuario.md](02-experiencia-usuario.md) | Identidade visual, design system, voz/microcopy, **13 telas em wireframe de texto**, algoritmos de ordenação do feed (sem vício), sistema de reações empáticas, UX de acolhimento/antivício/comunidade |
| 3 | [03-moderacao-seguranca-privacidade.md](03-moderacao-seguranca-privacidade.md) | Taxonomia de política de conteúdo, pipeline de moderação por IA em 4 estágios, detecção de campanhas políticas coordenadas, fluxo de denúncia, revisão humana, escada de sanções, anti-bot/spam/flood/ataques, LGPD, criptografia, minimização de dados |
| 4 | [04-arquitetura-tecnica.md](04-arquitetura-tecnica.md) | Arquitetura completa (diagrama), decisões de stack justificadas, **schema completo do banco** (tabelas, índices, particionamento), REST vs GraphQL, **todas as APIs**, plano de escala 100k → 100M usuários, SLOs, observabilidade, CI/CD |
| 5 | [05-roadmap-mvp-monetizacao-riscos.md](05-roadmap-mvp-monetizacao-riscos.md) | Escopo do MVP com critérios go/no-go, roadmap em 5 fases, funcionalidades futuras avaliadas, monetização ética, tecnologias consolidadas, matriz de riscos, melhorias sugeridas, resumo executivo |

## Decisões-chave (TL;DR)

1. **Identidade:** número público gerado por permutação de Feistel; UUID interno; **sem perfil público navegável** (anti-stalking e anti-desanonimização).
2. **Anti-ódio estrutural:** sem links, sem mídia, sem menções, sem compartilhamento, sem trending, threads rasas — a arquitetura do produto remove os vetores antes da moderação agir.
3. **Moderação IA em camadas:** regras determinísticas (~5ms) → classificador leve PT-BR (~100ms, 100% dos textos) → Claude Haiku (zona cinzenta, assíncrono) → fila humana; escada de 5 níveis de sanção com contestação; fluxo de crise (CVV 188) que acolhe em vez de punir.
4. **Anti-bot sem coletar dados:** device attestation (Play Integrity/App Attest) + 1 conta por dispositivo + proof-of-work invisível + trust score progressivo.
5. **Feed sem vício:** cronológico por padrão, ordenações explícitas escolhidas pelo usuário, cap de impressões anti-viralização, marcos de pausa, digest em vez de push.
6. **LGPD por minimização radical:** só existe UUID, número, chave de dispositivo, textos e IP segregado (6 meses, Marco Civil). Nada de nome, telefone, localização ou analytics identificável.
7. **Stack:** React Native + Expo · NestJS monolito modular · PostgreSQL particionado · Redis · NATS · Meilisearch · Cloudflare · AWS sa-east-1. **MVP-atalho:** Next.js + Supabase (schema compatível, migração evolutiva).
8. **Escala:** sem grafo social e sem mídia, não existe fan-out de timeline — o produto escala como leitor de listas globais (barato). 100M usuários = arquitetura celular.
9. **Monetização:** apoiador voluntário (modelo Signal/Wikipedia) + utilidades pessoais premium + espaços institucionais B2B. Zero ads, zero venda de dados.
10. **Maior risco não é técnico:** é cultura da comunidade e cold start → beta fechado com comunidades-semente e moderação impecável desde o primeiro post.
