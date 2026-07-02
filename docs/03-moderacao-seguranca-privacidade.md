# ECOA — Parte 3: Moderação com IA, Segurança e Privacidade

---

## 1. Moderação

### 1.1 Filosofia

- Anonimato público ≠ anonimato para a moderação: toda ação é atribuível a uma conta interna (UUID) com histórico de sanções.
- **Camadas em profundidade:** nenhum filtro pega tudo; o sistema combina prevenção estrutural (sem links, sem mídia, sem menções), IA em duas velocidades, denúncias da comunidade e revisão humana.
- Erro calibrado por dano: falso negativo de ódio é pior que falso positivo de desabafo; falso positivo em post de dor é gravíssimo (silenciar quem sofre). Por isso: **bloqueio automático só com alta confiança**; o resto vai para fila humana com o conteúdo no ar ou oculto conforme severidade.

### 1.2 Categorias de política (taxonomia interna)

| Código | Categoria | Ação padrão |
|---|---|---|
| H1 | Discurso de ódio (raça, etnia, orientação sexual, gênero, religião, origem, deficiência) | Bloqueio automático + sanção |
| H2 | Ameaça / incitação à violência | Bloqueio + sanção grave + preservação de evidência |
| H3 | Assédio direcionado / perseguição | Remoção + sanção |
| S1 | Conteúdo sexual explícito / pornografia textual | Bloqueio |
| S2 | Sexualização de menores | Bloqueio + ban imediato + preservação p/ autoridades (obrigação legal) |
| V1 | Violência gráfica gratuita | Remoção |
| C1 | Atividade criminosa (venda de drogas, golpes, armas) | Bloqueio + ban |
| P1 | Propaganda político-partidária, campanha, mobilização | Remoção (off-topic, não "crime") |
| P2 | Operação coordenada de influência | Ban de rede + relatório interno |
| A1 | Ideação suicida / autolesão (pessoa em sofrimento) | **NÃO punir** — fluxo de acolhimento |
| A2 | Incentivo/instrução a autolesão de terceiros | Bloqueio + sanção grave |
| SP1 | Spam / flood / correntes | Remoção + throttle |
| D1 | Doxxing (dados pessoais de terceiros) | Bloqueio + sanção |
| M1 | Desinformação médica perigosa ("pare de tomar seu remédio") | Remoção |

### 1.3 Pipeline de moderação por IA (duas velocidades + humano)

```
                    ┌───────────────────────────────────────────────┐
 texto submetido →  │ ESTÁGIO 0 — Regras determinísticas (~5ms)     │
                    │ • URL/link? → recusa imediata                 │
                    │ • Regex/bloomfilter de termos inequívocos     │
                    │ • Fingerprint (SimHash) = duplicata? → spam   │
                    │ • Rate limit / trust score do autor           │
                    └───────────────┬───────────────────────────────┘
                                    ▼
                    ┌───────────────────────────────────────────────┐
                    │ ESTÁGIO 1 — Classificador rápido (~50-100ms)  │
                    │ Modelo pequeno (DistilBERT/fasttext fine-     │
                    │ tuned PT-BR, self-hosted, barato) →           │
                    │ score por categoria                           │
                    │ • score ≥ 0.95 em H1/H2/S1/S2/C1 → BLOQUEIA   │
                    │   (com direito a contestação)                 │
                    │ • score ≤ 0.05 em tudo → PUBLICA              │
                    │ • zona cinzenta → PUBLICA* e marca p/ Estágio 2│
                    │   (*severidade alta fica oculto até análise)  │
                    └───────────────┬───────────────────────────────┘
                                    ▼ (assíncrono, fila)
                    ┌───────────────────────────────────────────────┐
                    │ ESTÁGIO 2 — LLM (segundos, assíncrono)        │
                    │ Claude Haiku com policy-prompt estruturado:   │
                    │ entende ironia, gíria, contexto, ódio velado, │
                    │ política disfarçada. Saída JSON:              │
                    │ {categoria, confiança, trecho, justificativa} │
                    │ • confirma violação clara → remove + sanção   │
                    │ • incerto ou apelável → FILA HUMANA           │
                    │ • detecta A1 (sofrimento) → fluxo acolhimento │
                    └───────────────┬───────────────────────────────┘
                                    ▼
                    ┌───────────────────────────────────────────────┐
                    │ ESTÁGIO 3 — Revisão humana                    │
                    │ Fila priorizada por severidade × alcance      │
                    │ Decisão humana realimenta datasets dos        │
                    │ estágios 1 e 2 (active learning)              │
                    └───────────────────────────────────────────────┘
```

Custo sob controle: Estágio 0/1 roda em 100% dos textos (centavos por milhão); o LLM só na zona cinzenta (estimativa: 5–15% dos textos) e em amostragem aleatória de 1–2% dos aprovados (auditoria de falso negativo).

### 1.4 Detecção de conteúdo político e campanhas coordenadas

Duas frentes distintas:

**(a) Conteúdo político individual (P1)** — classificador semântico (Estágio 1 + LLM) treinado para distinguir:
- ✅ permitido: "Estou ansioso com o futuro do país" (sentimento pessoal);
- ❌ removido: "Vote no candidato X", "Abaixo o partido Y", convocação para atos, propaganda.
A régua é: **fala do próprio sentimento = fica; advoga/mobiliza/ataca grupo político = sai.** Comunicado com transparência nas regras da casa.

**(b) Coordenação (P2)** — análise comportamental de rede, não de conteúdo:
- Embeddings de posts (mesmo sem palavras iguais) agrupados por similaridade — clusters de textos quase idênticos em janela curta = campanha;
- Grafos de sincronização: contas criadas próximas, mesmo padrão de horário, mesma ASN/fingerprint, reagindo em bloco aos mesmos alvos;
- Detecção de burst: pico anômalo de posts sobre a mesma entidade nomeada (NER);
- Ação: quarentena silenciosa do cluster (shadow-limit) → análise humana → ban em rede.

### 1.5 Fluxo de denúncia (detalhado)

1. Usuário denuncia com categoria (+ texto opcional). Conteúdo some do feed dele na hora (controle pessoal imediato).
2. Denúncia entra ponderada pelo **trust score do denunciante** (quem denuncia com precisão histórica pesa mais; brigading de denúncias pesa quase zero).
3. Thresholds: peso acumulado ≥ T1 → prioriza na fila LLM; ≥ T2 → oculta preventivamente (quarentena) até revisão; categoria H2/S2 → prioridade máxima sempre.
4. Revisão (LLM ou humana) decide: mantém / remove / remove + sanção.
5. **Feedback aos dois lados:** denunciante recebe "analisamos e removemos" ou "analisamos e não viola as regras"; autor punido recebe notificação com a regra violada, o trecho e botão **[Contestar]**.
6. Contestação → sempre revisão humana (nunca IA revisa a própria decisão) → resposta em até 72h.
7. Métricas de qualidade: precisão de denúncias por categoria, tempo médio de fila, taxa de reversão em contestação (>10% de reversão = classificador precisa de ajuste).

### 1.6 Revisão manual (operação)

- Time interno pequeno + ferramenta de review: fila única priorizada por `severidade × alcance × recência`, com contexto (thread, histórico de sanções, scores da IA e trecho destacado).
- Decisões em 1 clique com taxonomia fixa (consistência entre revisores; dupla revisão amostral para medir concordância inter-revisor).
- **Saúde do revisor:** rotação de categorias pesadas, limite diário de conteúdo H2/S2, apoio psicológico — moderação humana é trabalho de risco.
- Escala: ~1 revisor por 100–200 mil MAU como ordem de grandeza inicial (a prevenção estrutural do ECOA — sem mídia, sem links, sem DM — reduz muito o volume vs. redes tradicionais).
- Playbook legal: S2 e ameaças críveis → preservação de evidência + acionamento das autoridades conforme lei.

### 1.7 Níveis de punição (escada de sanções)

| Nível | Gatilho | Sanção |
|---|---|---|
| 0 | Fricção | Aviso no composer ("quer reformular?") — não registra |
| 1 | 1ª violação leve (SP1, P1, V1 leve) | Remoção do conteúdo + notificação educativa |
| 2 | Reincidência leve ou violação média | Remoção + **mute 24h** (só leitura) |
| 3 | Reincidência média (3+ em 30 dias) | Suspensão 7 dias |
| 4 | Violação grave (H1, H3, D1, A2) | Suspensão 30 dias na 1ª, ban na 2ª |
| 5 | Gravíssima (H2 crível, S2, C1, P2) | **Ban permanente imediato** de conta + dispositivo |

- Sanções expiram do "histórico ativo" após 6 meses de bom comportamento (níveis 1–2) — direito a recomeçar.
- Ban de dispositivo = bloqueio por device attestation + fingerprint (ver §2), dificultando recriação de conta.
- Shadow-throttle para spam: spammers detectados têm alcance zerado sem notificação (não aprendem a burlar).
- Todas as sanções são contestáveis (1.5.6), exceto S2.

---

## 2. Segurança anti-abuso

### 2.1 Bots e criação infinita de contas

O desafio central: **cadastro sem dados pessoais** (anonimato) vs. **custo de criar conta deve ser alto para atacantes**. Estratégia em camadas — nenhuma sozinha basta:

1. **Device attestation (principal):** Play Integrity (Android) e App Attest/DeviceCheck (iOS) no cadastro e periodicamente. Garante "app genuíno em dispositivo real não-rooteado". Emulador/farm de VMs falha. É a barreira mais forte que não coleta dado pessoal.
2. **1 conta por dispositivo:** chave criptográfica gerada no secure enclave/keystore do aparelho identifica o dispositivo sem identificar a pessoa. Recriar conta exige apagar a anterior (com cooldown de 7 dias).
3. **Proof-of-Work invisível no cadastro e em ações sensíveis:** desafio computacional de ~1–3s (imperceptível para 1 usuário, caríssimo para 10 mil bots).
4. **Rate limits por múltiplas chaves:** por conta, por dispositivo, por IP e por sub-rede /24 (ver 2.2).
5. **Trust score progressivo:** conta nova nasce com limites baixos (ex.: 3 posts/dia, 10 comentários/dia) que crescem com idade + comportamento limpo. Ataques de contas novas têm alcance naturalmente limitado.
6. **Web (fase 2):** Turnstile/desafio invisível + limites mais duros, ou web somente-leitura no início.
7. **Escalada com fricção sob suspeita** (nunca por padrão): desafio adicional, cooldown, ou — último recurso, para reincidência grave — verificação por SMS com número armazenado apenas como hash com salt (não reversível, serve só para "este número já criou 5 contas banidas").

### 2.2 Spam e flood

- **Rate limits (valores iniciais, ajustáveis):** 5 posts/h e 15/dia; 20 comentários/h; 60 reações/h; 10 denúncias/dia. Sliding window em Redis; excedente responde 429 com retry-after amigável.
- **Detecção de duplicata:** SimHash/MinHash do texto; mesmo conteúdo (ou quase) repetido por 1 conta ou por N contas → spam automático.
- **Sem links + sem mídia** já elimina 90% do incentivo econômico do spam.
- **Honeypots:** endpoints/campos invisíveis para humanos; quem os toca é bot → shadow-ban.
- Filas de "primeiro post": os primeiros conteúdos de toda conta nova passam pelo Estágio 2 (LLM) obrigatoriamente.

### 2.3 Ataques coordenados (brigading, manipulação, review-bombing de denúncias)

- Denúncias ponderadas por trust do denunciante + detecção de burst de denúncias contra o mesmo alvo vindo de cluster correlacionado → cluster é ignorado e investigado.
- Reações em bloco (mesmo cluster reagindo junto) não movem os rankings de "Mais apoiados" — o score usa contas com trust ≥ X e cap por sub-rede.
- Grafo de coordenação (mesmo pipeline de P2, §1.4b).
- **Manipulação do feed é estruturalmente pouco atrativa:** sem trending, sem viralização, com cap de impressões por post — o "prêmio" por manipular é baixo por design.

### 2.4 Segurança de aplicação (baseline)

- OWASP ASVS como checklist; TLS 1.3 obrigatório; certificate pinning no app.
- Tokens de sessão: JWT curtos (15 min) + refresh token rotativo com detecção de reuso (roubo de token derruba a família inteira de tokens).
- Sanitização de texto (Unicode normalization — ataques de homóglifos para burlar filtros são normalizados antes da moderação).
- Proteção de API: WAF + rate limit no edge (Cloudflare), schema validation estrita (zod/JSON Schema), sem campos extras aceitos.
- Segredos em vault (não em env de CI); dependabot/renovate + SCA; revisão de segurança em todo endpoint novo.
- Pentest externo anual + programa de disclosure responsável.
- Logs de segurança imutáveis (WORM) com retenção separada dos logs de produto.

---

## 3. Privacidade e LGPD

### 3.1 Princípio: minimização radical

Se não coletamos, não vaza, não intima, não custa. Inventário completo de dados pessoais:

| Dado | Onde | Por quê | Retenção |
|---|---|---|---|
| UUID interno da conta | DB | Operação | Vida da conta |
| Número público | DB | Exibição | Vida da conta |
| Chave pública do dispositivo | DB | Autenticação/anti-abuso | Vida da conta |
| Hash do e-mail de recuperação (opcional) | DB, criptografado | Recuperar conta | Até desvincular |
| IP de acesso | Logs segregados | **Obrigação legal** (Marco Civil, art. 15: guarda de logs de acesso a aplicações por 6 meses) + anti-abuso | 6 meses, depois destruição automática |
| Textos publicados | DB | O produto | Até exclusão pelo autor |
| Fingerprint técnico degradado (ASN, modelo/OS agregado) | Anti-abuso | Detecção de farm | 90 dias |
| Token de push (FCM/APNs) | DB | Notificações | Até logout |

**Não coletamos:** nome, CPF, telefone (exceto hash em escalada anti-abuso, §2.1.7), localização, contatos, IDFA/AAID, analytics de terceiros com identificador, comportamento de leitura individual persistente.

### 3.2 Enquadramento LGPD

- **Bases legais:** execução de contrato (operar o serviço), obrigação legal (logs do Marco Civil), legítimo interesse (anti-fraude/moderação — com LIA documentado), consentimento (e-mail de recuperação, notificações).
- **Dados sensíveis:** textos sobre saúde mental, orientação sexual, religião etc. são dados sensíveis fornecidos espontaneamente. Tratamento: criptografia, acesso restrito por função, **proibição contratual e técnica de uso para publicidade ou perfilamento**, e política clara de que o conteúdo é do usuário.
- **Direitos do titular (todos automatizados no app):** acesso e portabilidade ("Baixar meus dados" → JSON), correção (edição), eliminação ("Excluir conta" → hard delete de conteúdo + anonimização irreversível de resíduos operacionais em até 30 dias), informação sobre tratamento (política legível por humanos).
- **Governança:** DPO nomeado; RIPD (relatório de impacto) antes do launch; contratos de operador com todos os fornecedores de nuvem; data residency preferencial no Brasil (região sa-east-1 / GCP southamerica-east1); plano de resposta a incidentes com notificação à ANPD e aos titulares quando aplicável.
- **Menores:** mínimo declarado de 16 anos; sem tratamento direcionado a crianças; moderação S2 com tolerância zero.

### 3.3 Criptografia e proteção

- **Em trânsito:** TLS 1.3 em tudo (inclusive tráfego interno service-to-service via mTLS).
- **Em repouso:** criptografia de disco (KMS) em DB, backups e logs; colunas de alto risco (hash de e-mail, hash de telefone) com criptografia adicional em nível de aplicação (envelope encryption) — DBA não lê.
- **Posts não são E2E-cifrados** (são públicos e precisam de moderação) — dizer isso com honestidade na política.
- **Segregação:** o vínculo `número público ↔ UUID ↔ chave de dispositivo ↔ IP` fica em stores separados com acesso auditado; nenhum funcionário tem acesso casual à correlação completa. Consulta de correlação exige ticket com justificativa e fica logada (auditável).
- Backups cifrados, testados, com a mesma política de retenção/exclusão (delete propaga para backup em até 35 dias).
- Anonimização em analytics: métricas agregadas (k-anonimato ≥ 20), sem eventos por usuário identificável; ferramentas self-hosted (ex.: Plausible/PostHog self-hosted) — zero Google Analytics/Meta Pixel.

### 3.4 Transparência

- Política de privacidade em dois níveis: resumo humano (10 linhas) + documento completo.
- Relatório de transparência semestral: nº de remoções por categoria, contestações, taxa de reversão, requisições judiciais atendidas.
- Changelog público de regras de comunidade.
