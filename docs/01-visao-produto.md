# ECOA — Parte 1: Visão de Produto e Regras de Negócio

> Rede social 100% texto, 100% anônima, focada em expressão emocional saudável.
> Nome de trabalho: **ECOA** (de "ecoar" — sua voz ecoa, sua identidade não aparece). Alternativas: Âmago, Sussurro, Painel, Voz.

---

## 1. Visão do produto

### 1.1 Declaração de visão

> "Um lugar onde qualquer pessoa pode dizer o que está sentindo, ser ouvida e acolhida — sem fama, sem aparência, sem julgamento de identidade."

### 1.2 O problema que resolvemos

As redes sociais atuais transformaram expressão pessoal em performance:

| Problema nas redes atuais | Consequência | Resposta do ECOA |
|---|---|---|
| Identidade pública + histórico permanente | Autocensura, medo de julgamento | Anonimato total por número |
| Métricas públicas (likes, seguidores) | Competição por atenção, ansiedade | Zero métricas públicas de popularidade |
| Algoritmo de engajamento | Vício, radicalização, doomscrolling | Feed cronológico/comunitário, sem otimização de tempo de tela |
| Mídia visual (foto/vídeo) | Culto à aparência, comparação social | Só texto |
| Política e guerra cultural | Ódio, polarização | Fora do escopo por política de conteúdo + moderação |

### 1.3 Proposta de valor

- **Para quem escreve:** desabafar, celebrar, registrar o dia — sem construir "persona".
- **Para quem lê:** empatia real; ver que outras pessoas sentem o mesmo.
- **Para ambos:** um espaço calmo. O produto compete com o diário, não com o TikTok.

### 1.4 Anti-objetivos (o que o ECOA NUNCA será)

1. Plataforma de influência, fama ou monetização de criadores.
2. Arena política ou de debate ideológico.
3. Produto otimizado para tempo de tela.
4. Vendedor de dados ou de publicidade comportamental.
5. App de mensagens privadas (DM abre porta para assédio e grooming — fora do MVP e provavelmente fora do produto para sempre).

### 1.5 Métricas de sucesso (North Star)

Como não otimizamos engajamento, as métricas precisam refletir **saúde**, não volume:

- **North Star:** % de usuários que publicam ou reagem com empatia pelo menos 1x/semana ("expressão semanal ativa").
- Taxa de retorno em 30 dias (retenção saudável, não sessões/dia).
- % de posts com pelo menos 1 reação de apoio em 24h ("ninguém fala no vazio").
- Taxa de conteúdo removido / mil posts (qualidade da comunidade — deve cair com o tempo).
- Tempo até primeira resposta de acolhimento em posts de dor.
- NPS emocional: pesquisa in-app "Você se sentiu acolhido aqui esta semana?"

**Métrica que NÃO usamos como meta:** tempo médio de sessão, sessões por dia, DAU/MAU stickiness. Se subirem demais, é sinal de alerta, não de sucesso.

---

## 2. Conceito e identidade anônima

### 2.1 Modelo de identidade

- Cada pessoa recebe um **identificador público numérico** gerado aleatoriamente no primeiro acesso: `Usuário #48291`.
- Internamente o sistema usa um **UUID** (nunca exposto). O número público é apenas um "apelido matemático".
- Números têm 5–7 dígitos, não sequenciais (gerados por permutação pseudoaleatória — ver Parte 4), para não revelar ordem de cadastro nem tamanho da base.

### 2.2 O que NÃO existe no perfil

Nome, foto, avatar, bio, idade, gênero, localização, seguidores, seguidos, contagem de curtidas, verificado, status online, "visto por último". **Nada.**

### 2.3 O que existe no "perfil anônimo" (visível só para o próprio usuário)

- Seu número.
- Seus posts e comentários (com opção de excluir).
- Reações recebidas (agregadas, privadas).
- Preferências (temas silenciados, notificações, tema claro/escuro).

**Decisão de design importante:** o perfil de OUTRO usuário não é navegável no MVP. Tocar no `#48291` de um post não abre o histórico dele. Motivos: (a) impede perseguição/stalking por número; (b) impede desanonimização por análise do histórico (estilo de escrita + detalhes pessoais acumulados identificam pessoas); (c) reforça que o foco é o texto, não o autor.

### 2.4 Risco de desanonimização e mitigação

Mesmo sem perfil, um número estável permite correlacionar posts de uma mesma pessoa. Mitigações:

1. Histórico público por número indisponível (2.3).
2. Busca não permite filtrar por número de usuário.
3. **Modo efêmero (futuro):** opção de publicar com número rotativo de uso único ("Usuário anônimo") para desabafos sensíveis.
4. Educação no onboarding: "Evite incluir dados que identifiquem você (nome, cidade, empresa)". Detector de PII (ver Parte 3) sugere remoção antes de publicar.

---

## 3. Regras de negócio

### 3.1 Publicações

| Regra | Valor | Justificativa |
|---|---|---|
| Conteúdo | Somente texto puro (Unicode, com emoji) | Conceito do produto |
| Tamanho | 1 a 2.000 caracteres | Suficiente para desabafo, curto o bastante para leitura |
| Mídia | Proibida (imagem, vídeo, GIF, áudio, arquivo) | Conceito |
| Links | Bloqueados no MVP (URLs detectadas e recusadas) | Corta spam, phishing, mobilização externa e SEO abuse na raiz |
| Menções `@`/`#numero` | Não existem | Evita pile-on/assédio direcionado |
| Edição | Até 15 min após publicar, marcada como "editado" | Corrigir erros sem permitir revisionismo após respostas |
| Exclusão | A qualquer momento, pelo autor | Direito LGPD + controle emocional |
| Metadados exibidos | Texto, data, hora, `Usuário #NNNNN`, tag de tema (opcional) | Especificação |
| Rascunhos | 1 rascunho local (no dispositivo) | Simplicidade |

### 3.2 Comentários

- Somente texto, 1 a 1.000 caracteres.
- Identificados por número (`Usuário #58421`).
- **Um nível de profundidade** (comentário → resposta ao comentário, e para). Threads profundas viram briga; 2 níveis bastam para diálogo.
- O autor do post pode **fechar comentários** ("só quero desabafar, não quero conselhos") — no composer existe o toggle "Permitir respostas".
- O autor do post pode ocultar um comentário específico no seu post (fica invisível para todos; o comentarista não é notificado — evita retaliação).
- Autor do post aparece marcado como `Autor` nos próprios comentários (sem revelar mais nada).

### 3.3 Reações (substituem curtidas)

Conjunto fechado, curado, sem contadores públicos de "popularidade" — ver detalhes na Parte 2. Regras:

- 1 reação por usuário por post (pode trocar).
- Contagem por tipo é visível no post de forma **discreta** (ex.: "12 pessoas acolheram") — o autor vê o detalhamento; o público vê agregado suave. Sem ranking, sem "top posts do dia" público.
- Reações em comentários: apenas "🤝 Apoio" (uma só, para não gamificar a thread).

### 3.4 Temas (tags controladas)

Ao publicar, o usuário pode escolher **um tema** de uma lista curada (não é hashtag livre — hashtag livre vira campanha coordenada):

`Desabafo · Gratidão · Conquista · Trabalho · Estudos · Família · Amor & Relacionamentos · Saúde · Luto · Medos & Ansiedade · Cotidiano · Reflexões · Pergunta para a comunidade`

- Sem tema = "Cotidiano".
- Temas alimentam filtros do feed e o roteamento de moderação (ex.: "Luto" e "Saúde" têm tratamento mais cuidadoso).
- **Não existe tema de política, religião organizada ou times/torcidas** — por design.

### 3.5 Política de conteúdo (resumo — detalhada na Parte 3)

Proibido: pornografia e conteúdo sexual explícito; racismo, xenofobia, homofobia e qualquer discurso de ódio; ameaças; assédio; doxxing; spam; violência explícita; conteúdo criminoso; automutilação instrutiva; **propaganda político-partidária, campanhas e mobilização política organizada**; desinformação médica perigosa; venda de qualquer coisa.

Permitido e acolhido: sentimentos, experiências, opiniões pessoais sobre a própria vida, pedidos de apoio, celebrações, perguntas à comunidade.

Zona cinzenta tratada com cuidado (não punição): menção a ideação suicida/autolesão → fluxo de acolhimento (CVV 188, recursos de ajuda), nunca banimento do usuário em sofrimento.

### 3.6 Contas e acesso

- **Cadastro sem dados pessoais**: o app cria uma conta anônima vinculada ao dispositivo (device-bound key) no primeiro acesso. Zero fricção.
- **Recuperação opcional**: usuário pode vincular um e-mail (armazenado como hash + criptografado, usado só para recuperar a conta) ou salvar uma **frase de recuperação** (estilo carteira cripto — 100% anônimo). Recomendado exibir: "Sem isso, se você trocar de celular, sua conta some para sempre."
- 1 conta ativa por dispositivo (controle anti-abuso na Parte 3; múltiplas contas detectadas = trust score baixo).
- Idade mínima declarada: 16 anos (LGPD/adequação de conteúdo emocional). Checkbox + política; sem verificação documental (seria anti-anonimato) — mitigação por moderação de conteúdo.

### 3.7 Notificações (regras anti-vício)

- Notificamos apenas: respostas ao SEU post/comentário, reações agregadas em digest ("5 pessoas acolheram seu post" — 1x/dia, não em tempo real), avisos de moderação e lembretes de pausa (opt-in).
- **Nunca**: "fulano postou", "você está perdendo", streaks, "volte para ver", trending.
- Agrupamento agressivo: máximo 3 pushes/dia por padrão.
- Quiet hours por padrão: 22h–8h sem push (configurável).

### 3.8 Regras do feed (resumo — algoritmos na Parte 2)

- Ordenação padrão: **Recentes (cronológico)**. Alternativas explícitas escolhidas pelo usuário: "Mais apoiados (24h)", "Mais conversados (24h)", "Comunidade" (mix cronológico com posts sem resposta).
- Sem feed infinito irrestrito: a cada ~50 posts, um "marco de respiro" ("Você leu bastante por hoje 💙 Que tal uma pausa?") com botão de continuar — sem culpa, sem bloqueio.
- Sem autoplay, sem pull-to-refresh com animação de cassino (refresh é botão sóbrio), sem badges vermelhos numéricos (indicador de novidade é um ponto discreto).

---

## 4. Fluxos principais (visão de produto)

### 4.1 Primeiro acesso (time-to-first-value < 60s)

```
Splash → Boas-vindas (3 cartões: o que é / regras da casa / anonimato)
      → Aceite dos Termos + Política de Conteúdo (resumo em linguagem humana)
      → Geração do número ("Você é o Usuário #48291. Só você sabe quem você é.")
      → Sugestão de salvar frase de recuperação (pode pular)
      → Feed (já lendo, sem cadastro, sem e-mail, sem permissões)
```

### 4.2 Publicar

```
Feed → botão "Escrever" → composer em tela cheia (foco total no texto)
    → (opcional) escolher tema → (opcional) desligar respostas
    → "Publicar" → checagem síncrona de política (<150ms)
        ├── ok → post no ar + microcopy "Publicado. Alguém vai te ler. 💙"
        ├── PII detectada → aviso gentil com sugestão de edição (pode publicar mesmo assim, exceto PII de terceiros)
        └── violação clara → recusa com explicação da regra + link para revisão humana
```

### 4.3 Acolher (reagir/comentar)

```
Post no feed → toque longo ou botão "Acolher" → sheet com as 6 reações
Post → "Responder" → composer de comentário → mesmas checagens de política
```

### 4.4 Denunciar

```
Post/comentário → menu "⋯" → "Denunciar" → categoria (lista) → (opcional) detalhe
→ confirmação "Obrigado. Nossa equipe vai revisar." → conteúdo some do SEU feed imediatamente
→ pipeline de moderação (Parte 3)
```

### 4.5 Crise (autolesão/suicídio detectado no texto de quem escreve)

```
Composer detecta sinais → intervenção NÃO bloqueante:
"Percebemos que você pode estar passando por um momento muito difícil.
 Você não está sozinho. CVV — 188 (24h, gratuito) | chat cvv.org.br"
→ usuário pode publicar mesmo assim (desabafar salva vidas; censurar dor é o oposto da missão)
→ post é marcado internamente para prioridade de acolhimento e monitorado contra respostas cruéis
```

---

## 5. Princípios de decisão (para todo o time, para sempre)

1. **O texto é o protagonista.** Qualquer feature que desloque atenção do texto para o autor é recusada.
2. **Calma > engajamento.** Em qualquer trade-off, escolhemos a opção que gera menos compulsão.
3. **Anonimato não é impunidade.** Identidade oculta do público ≠ oculta da moderação. Abuso tem consequência.
4. **Acolher primeiro, punir depois** — exceto ódio e ameaça, que são punidos primeiro.
5. **Coletar o mínimo.** Se um dado não é indispensável, não existe no banco.
6. **Política partidária é off-topic estrutural**, como futebol num fórum de culinária — não é censura de opinião, é escopo de produto.
