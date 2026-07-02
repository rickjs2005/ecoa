# ECOA — Parte 2: Experiência do Usuário, Design e Telas

---

## 1. Identidade visual

### 1.1 Direção de design

Inspirações e o que tiramos de cada uma (sem copiar nenhuma):

| Referência | O que aproveitamos | O que rejeitamos |
|---|---|---|
| Reddit | Simplicidade estrutural, foco em thread | Karma, upvote público, subcultura agressiva |
| X/Twitter | Densidade de leitura, ritmo do feed | Viralização, quote-tweet (máquina de pile-on), trending |
| Threads | Suavidade da interface, espaçamento | Integração com identidade/Instagram |
| Medium | Tipografia serifada para leitura longa, respiro | Paywall na cara, claps infinitos |

**Personalidade da marca:** um caderno à meia-luz. Silencioso, quente, digno. Nunca infantil, nunca clínico/hospitalar, nunca corporativo.

### 1.2 Sistema visual

- **Cor:** base neutra quente (off-white `#FAF8F5` no claro; grafite azulado `#14161A` no escuro). Uma única cor de acento: **azul-profundo suave** (`#4A6FA5` aprox.) usada com parcimônia (botão primário, links internos). Reações usam cores próprias dessaturadas. Sem vermelho de alerta em notificações (vermelho só para ações destrutivas).
- **Tipografia:** serifada humanista para o corpo dos posts (ex.: Source Serif 4 / Literata — sensação de "texto que importa") + sans neutra para UI (Inter). Corpo ≥ 17px mobile, line-height 1.6. Controle de tamanho de fonte no app (acessibilidade).
- **Espaçamento:** generoso. Cards sem bordas pesadas — separação por espaço em branco e hairlines de 0.5px.
- **Movimento:** transições de 150–200ms, easing suave, **zero** animações de recompensa (nada de confete, corações voando, contadores rolando).
- **Ícones:** linha fina, 1.5px, cantos arredondados. Emoji apenas nas reações.
- **Dark mode:** primeiro cidadão (muita gente desabafa à noite).
- **Som:** nenhum. O app é mudo por padrão.

### 1.3 Voz e microcopy

- Português humano, direto, caloroso sem ser meloso. Trata por "você".
- Exemplos: "Publicado. Alguém vai te ler. 💙" · "Nada por aqui ainda. Que tal ser a primeira pessoa a escrever hoje?" · "Você leu bastante. O ECOA continua aqui mais tarde."
- Erros nunca culpam o usuário: "Não conseguimos publicar agora. Seu texto está salvo, tente de novo."

---

## 2. Telas (wireframes em texto)

Notação: `[botão]` · `(campo)` · `{componente}` · `⋯` menu.

### 2.1 Splash

```
┌──────────────────────────────┐
│                              │
│                              │
│            ecoa              │   ← logotipo em minúsculas, serifada
│     sua voz, sem rosto       │   ← tagline, fade-in suave
│                              │
│                              │
└──────────────────────────────┘
```
- Duração máxima 1.5s (carrega sessão + feed em background). Sem versão, sem loading bar.

### 2.2 Boas-vindas (só no primeiro acesso — 3 cartões deslizáveis)

```
Cartão 1/3                     Cartão 2/3                    Cartão 3/3
┌────────────────────┐         ┌────────────────────┐        ┌────────────────────┐
│  Aqui, só palavras │         │  Regras da casa    │        │  Você é um número  │
│                    │         │                    │        │                    │
│  Sem fotos, sem    │         │  • Acolha, não     │        │  Sem nome. Sem     │
│  seguidores, sem   │         │    ataque          │        │  foto. Sem fama.   │
│  fama. Um lugar    │         │  • Ódio é banido   │        │  Ninguém sabe quem │
│  para dizer o que  │         │  • Política fica   │        │  você é — nem      │
│  você sente.       │         │    do lado de fora │        │  precisa saber.    │
│                    │         │  • Fale de você    │        │                    │
│      ● ○ ○         │         │      ○ ● ○         │        │      ○ ○ ●         │
│  [Continuar]       │         │  [Continuar]       │        │  [Começar]         │
└────────────────────┘         └────────────────────┘        └────────────────────┘
```
- Rodapé do cartão 3: link "Termos e Política de Conteúdo" + checkbox "Tenho 16 anos ou mais e aceito".

### 2.3 Primeiro acesso — revelação do número

```
┌──────────────────────────────┐
│                              │
│     Você agora é o           │
│                              │
│      Usuário #48291          │   ← número grande, serifada
│                              │
│  Só você sabe quem está      │
│  por trás dele.              │
│                              │
│  [Entrar no ECOA]            │
│                              │
│  Proteja sua conta:          │
│  [Salvar frase de acesso]    │   ← flow opcional: 6 palavras p/ recuperar
│  [Agora não]                 │
└──────────────────────────────┘
```

### 2.4 Feed (tela principal)

```
┌──────────────────────────────┐
│ ecoa            {Recentes ▾} │  ← seletor de ordenação explícito
│ ─────────────────────────────│
│ Usuário #19302 · há 12 min   │
│ Desabafo                     │  ← tag de tema, discreta
│                              │
│ Hoje foi um dia difícil.     │
│ Acordei sem vontade de nada, │
│ mas fui trabalhar mesmo      │
│ assim. Pequenas vitórias.    │
│                              │
│ 🤝 8 acolhimentos · 3 respostas   ⋯ │
│ ─────────────────────────────│
│ Usuário #78120 · há 25 min   │
│ Conquista                    │
│                              │
│ PASSEI NA ENTREVISTA!!!      │
│                              │
│ 😊 24 acolhimentos · 12 respostas ⋯ │
│ ─────────────────────────────│
│           (⋯ mais posts ⋯)   │
│                              │
│  ~ a cada 50 posts ~         │
│ ┌──────────────────────────┐ │
│ │ Você leu bastante. 💙    │ │
│ │ O ECOA continua aqui.    │ │
│ │ [Fazer uma pausa]        │ │
│ │ [Continuar lendo]        │ │
│ └──────────────────────────┘ │
│ ─────────────────────────────│
│  {🏠 Início} {🔍} {✍️} {🔔} {☰} │  ← tab bar: Feed, Busca, Escrever, Notificações, Você
└──────────────────────────────┘
```
- Seletor `{Recentes ▾}`: Recentes · Mais apoiados (24h) · Mais conversados (24h) · Comunidade · por Tema.
- `⋯` no post: Denunciar · Silenciar este tema · Copiar texto (sem link de compartilhamento no MVP — viralização externa contradiz o produto).
- Sem contador vermelho na aba 🔔 — apenas um ponto discreto.

### 2.5 Nova publicação (composer)

```
┌──────────────────────────────┐
│ [Cancelar]        [Publicar] │
│ ─────────────────────────────│
│                              │
│ (O que você está sentindo    │
│  agora?                    ) │   ← textarea tela cheia, serifada
│                              │
│                              │
│ ─────────────────────────────│
│ Tema: {Cotidiano ▾}          │
│ Respostas: {ativadas ▾}      │
│                    1.240/2000│
└──────────────────────────────┘
```
- Placeholder rotativo e gentil: "O que você está sentindo agora?" / "Como foi seu dia?" / "O que você gostaria de contar para alguém?"
- Ao tocar Publicar: checagem de política. Estados: publicado · aviso de PII ("Seu texto parece conter um telefone/nome completo — quer revisar?") · recusa com motivo claro e botão [Pedir revisão humana].
- Rascunho salvo localmente ao cancelar.

### 2.6 Detalhe do post + comentários

```
┌──────────────────────────────┐
│ ← Voltar                   ⋯ │
│ ─────────────────────────────│
│ Usuário #19302 · 02/07 14:32 │
│ Desabafo                     │
│                              │
│ Hoje foi um dia difícil...   │
│ (texto completo)             │
│                              │
│ {❤️ 3}{🤝 5}{🙏 2}{💙 4}  [Acolher] │
│ ─────────────────────────────│
│ Respostas (3)                │
│                              │
│  Usuário #58421 · há 8 min   │
│  Eu passei por algo parecido │
│  semana passada. Melhora.    │
│  🤝 2 · [Responder]          │
│    └ Usuário #19302 · Autor  │
│      Obrigado de verdade.    │
│                              │
│  Usuário #84291 · há 2 min   │
│  Força! Um dia de cada vez.  │
│  🤝 1 · [Responder]          │
│ ─────────────────────────────│
│ (Escreva uma resposta      ) │
└──────────────────────────────┘
```
- Se autor desligou respostas: em vez da caixa, "O autor pediu só para ser ouvido. Você ainda pode acolher. 💙".

### 2.7 Sheet de reações ("Acolher")

```
┌──────────────────────────────┐
│        Como você acolhe?     │
│                              │
│  ❤️ Eu entendo               │
│  🤝 Estou com você           │
│  🙏 Força                    │
│  😊 Fico feliz por você      │
│  💙 Você não está sozinho    │
│  🌱 Isso vai passar          │
│                              │
└──────────────────────────────┘
```

### 2.8 Perfil anônimo ("Você")

```
┌──────────────────────────────┐
│         Usuário #48291       │
│    no ECOA desde jun/2026    │
│ ─────────────────────────────│
│ {Meus posts} {Minhas respostas} │
│ ─────────────────────────────│
│ há 2 dias · Gratidão         │
│ Finalmente consegui...       │
│ ❤️12 🤝3 · 5 respostas   [🗑] │
│ ─────────────────────────────│
│ há 5 dias · Desabafo         │
│ ...                          │
│ ─────────────────────────────│
│ 💙 Nesta semana, 27 pessoas  │
│    acolheram o que você      │
│    escreveu.                 │  ← única "métrica", privada e semanal
│ ─────────────────────────────│
│ [⚙ Configurações]  [? Ajuda] │
└──────────────────────────────┘
```
- Visível **apenas para o próprio usuário**. Não existe página pública de perfil.

### 2.9 Configurações

```
┌──────────────────────────────┐
│ ← Configurações              │
│ ─────────────────────────────│
│ CONTA                        │
│  Frase de recuperação      › │
│  Vincular e-mail (opcional)› │
│  Sair                        │
│  Excluir minha conta       › │  ← LGPD: exclusão real, explicada
│                              │
│ EXPERIÊNCIA                  │
│  Tema: claro/escuro/sistema  │
│  Tamanho do texto          › │
│  Ordenação padrão do feed  › │
│  Temas silenciados         › │  ← ex.: silenciar "Luto" se estiver sensível
│                              │
│ BEM-ESTAR                    │
│  Lembrete de pausa: 20min ▾  │
│  Horário de silêncio: 22–8h  │
│  Resumo diário em vez de     │
│  notificações: [on]          │
│                              │
│ NOTIFICAÇÕES                 │
│  Respostas aos meus posts ✓  │
│  Digest de acolhimentos   ✓  │
│                              │
│ PRIVACIDADE                  │
│  Baixar meus dados         › │  ← LGPD portabilidade
│  Política de privacidade   › │
│  Política de conteúdo      › │
└──────────────────────────────┘
```

### 2.10 Notificações

```
┌──────────────────────────────┐
│ Notificações                 │
│ ─────────────────────────────│
│ • Usuário #58421 respondeu   │
│   ao seu post "Hoje foi..."  │
│   há 20 min                  │
│ • 5 pessoas acolheram seu    │
│   post de ontem 💙           │
│ • Sua denúncia foi analisada:│
│   o conteúdo foi removido.   │  ← feedback fecha o ciclo de confiança
│ ─────────────────────────────│
│ (sem badge numérico, sem     │
│  vermelho, ordenado por data)│
└──────────────────────────────┘
```

### 2.11 Busca

```
┌──────────────────────────────┐
│ (🔍 Buscar sentimentos,      │
│     palavras, temas...     ) │
│ ─────────────────────────────│
│ TEMAS                        │
│ {Desabafo}{Gratidão}         │
│ {Conquista}{Trabalho}{Luto}… │
│ ─────────────────────────────│
│ Resultados (texto integral)  │
│ ...                          │
└──────────────────────────────┘
```
- Busca full-text em posts. **Não** busca por número de usuário (anti-stalking). Sem "termos em alta" (trending é vetor de manipulação e ansiedade).

### 2.12 Denúncia

```
┌──────────────────────────────┐
│ Denunciar este conteúdo      │
│ ─────────────────────────────│
│ ( ) Discurso de ódio         │
│ ( ) Assédio ou ameaça        │
│ ( ) Conteúdo sexual          │
│ ( ) Spam ou golpe            │
│ ( ) Propaganda política      │
│ ( ) Incentivo a autolesão    │
│ ( ) Expõe dados de alguém    │
│ ( ) Outro                    │
│                              │
│ (Detalhes — opcional       ) │
│                              │
│ [Enviar denúncia]            │
│                              │
│ Este conteúdo vai sumir do   │
│ seu feed imediatamente.      │
└──────────────────────────────┘
```

### 2.13 Ajuda

```
┌──────────────────────────────┐
│ Ajuda                        │
│ ─────────────────────────────│
│ 🆘 PRECISA DE APOIO AGORA?   │
│  CVV — ligue 188 (24h, grátis)│
│  Chat: cvv.org.br            │  ← sempre no topo, 1 toque
│ ─────────────────────────────│
│ Como funciona o anonimato  › │
│ Regras da comunidade       › │
│ Como funciona a moderação  › │
│ Recuperar minha conta      › │
│ Falar com a equipe         › │
│ Contestar uma punição      › │
└──────────────────────────────┘
```

---

## 3. Feed — algoritmos de ordenação

Princípio: **o usuário sempre sabe e escolhe como o feed está ordenado.** Nenhum modo mistura conteúdo por engajamento previsto, nenhum usa histórico de leitura individual para "personalizar" (personalização de engajamento = porta do vício).

### 3.1 Recentes (padrão)
Cronológico global puro (posts públicos aprovados, mais novos primeiro). Barato, transparente, sem manipulação. Keyset pagination por `(created_at, id)`.

### 3.2 Mais apoiados (24h)
```
score = (reações_ponderadas) / (idade_em_horas + 2)^1.4
```
- Janela móvel de 24h; decaimento tipo Hacker News evita que um post "campeão" domine o dia.
- Reações valem pesos iguais (não criamos hierarquia emocional).
- **Cap de exposição:** um post sai da lista após X mil impressões — anti-viralização deliberada: aqui ninguém "bomba".

### 3.3 Mais conversados (24h)
Mesma fórmula usando nº de comentaristas únicos (não nº de comentários — evita valorizar brigas de duas pessoas). Threads com moderação ativa (denúncias em análise) são despriorizadas.

### 3.4 Comunidade (o modo com alma)
Mistura determinística, sem ML de engajamento:
- 60% cronológico recente;
- 25% **"ainda sem resposta"**: posts de desabafo/dor com 0 comentários há mais de 1h — distribui acolhimento para quem ainda não foi ouvido (é o anti-algoritmo: promove quem tem MENOS engajamento);
- 15% posts bons de temas que o usuário segue.

### 3.5 Por tema
Cronológico filtrado pela tag escolhida.

### 3.6 O que deliberadamente NÃO existe
Trending topics · ranking de usuários · "posts que você perdeu" · recomendação por semelhança de leitura · infinite scroll sem marcos de pausa · notificação de "post bombando".

---

## 4. Sistema de reações — proposta final

Conjunto curado (6 no MVP), pensado para cobrir dor, companhia, torcida e alegria:

| Reação | Rótulo | Quando usar |
|---|---|---|
| ❤️ | **Eu entendo** | Empatia com dor ou dilema |
| 🤝 | **Estou com você** | Companhia, solidariedade |
| 🙏 | **Força** | Encorajamento em luta/luto |
| 😊 | **Fico feliz por você** | Celebrar conquista alheia |
| 💙 | **Você não está sozinho** | Acolhimento em solidão/ansiedade |
| 🌱 | **Isso vai passar** | Esperança, perspectiva |

Ideias adicionais (para testes futuros, mantendo no máx. 6–8 visíveis):
- 🫂 "Um abraço" · ✨ "Que bonito isso" (para reflexões) · ☕ "Respira, estou aqui" · 🕯️ "Meus sentimentos" (luto) · 💪 "Você consegue" · 👂 "Eu te ouço".

Regras anti-gamificação: sem contagem total agregada tipo "score do usuário"; sem ranking; autor vê detalhe, público vê número suave ("24 acolhimentos"); reações não geram push em tempo real (digest diário).

---

## 5. UX de acolhimento, saúde e antivício (respostas diretas ao briefing)

### 5.1 Acolhedora sem ser infantil
- Tipografia serifada adulta, paleta sóbria, zero mascotes, zero linguagem fofa forçada.
- Calor vem da **microcopy** (frases humanas curtas) e do **comportamento** (feed "Comunidade", digest gentil), não de estética de app de criança.

### 5.2 Incentivar conversas saudáveis
- Prompt de empatia no composer de comentário quando o post é de dor: placeholder "Responda como responderia a um amigo."
- **Fricção positiva:** se o classificador detectar hostilidade no comentário sendo escrito, exibe "Sua resposta pode machucar quem já está fragilizado. Quer reformular?" antes de enviar (o Twitter mediu ~30% de reformulação com esse padrão).
- Destaque estrutural para a primeira resposta acolhedora, não para a mais "engajada".
- Reações rotuladas com frases (não símbolos abstratos) ensinam o tom da casa.

### 5.3 Reduzir conflitos
- Sem menções, sem quote-post, sem compartilhamento interno → impossível convocar pile-on.
- Threads rasas (2 níveis) → discussões não escalam.
- Autor fecha/oculta respostas → dono do desabafo controla o espaço.
- Temas polêmicos estruturalmente ausentes (sem tag de política).
- Cooldown de thread: em threads com denúncias em análise, novos comentários entram em fila de revisão.

### 5.4 Evitar vício
- Feed com marcos de respiro; sem trending; sem badges vermelhos; digest em vez de push instantâneo; sem streaks; sem métricas públicas para "farmar".
- Nenhum modelo de ML otimizado para retenção/tempo de sessão — política de engenharia escrita, não só intenção.

### 5.5 Incentivar pausas
- Lembrete configurável ("Você está aqui há 20 min").
- Quiet hours padrão 22h–8h.
- Tela de pausa com respiro real: "Tudo bem fechar o app. Seus sentimentos continuam válidos lá fora."
- Modo "escrever e fechar": publicar direto da notificação de lembrete diário (modo diário) sem entrar no feed.

### 5.6 Sensação de comunidade
- Modo Comunidade do feed (acolher quem não foi ouvido).
- "Mural do dia" (futuro): um prompt coletivo diário ("Pelo que você é grato hoje?") — todos respondem à mesma pergunta, criando ritual compartilhado sem competição.
- Feedback do ciclo de denúncia ("sua denúncia protegeu a comunidade") — senso de corresponsabilidade.
- Aniversário no app: "Você ecoa há 1 ano. 💙" (privado).
