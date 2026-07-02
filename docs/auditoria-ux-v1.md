# Auditoria UX/UI — ECOA (v1, MVP em produção)

> Auditor: análise sênior de UX/UI, psicologia do produto, design emocional, acessibilidade, front-end e growth.
> Objeto: https://ecoa-teal.vercel.app (Next.js 16 + Supabase, build de 02/07/2026, pós-correções da revisão de código).
> Método: inspeção completa do código-fonte, do HTML renderizado e dos fluxos reais em produção; cálculo matemático dos contrastes WCAG da paleta.
> **Nenhuma alteração foi feita no produto.** Este documento é 100% diagnóstico.

---

## 1. Primeira impressão (3 segundos) — **Nota: 7,0/10**

O que um visitante novo vê: logotipo `ecoa` em serifada minúscula, tagline "sua voz, sem rosto", um cartão único "Aqui, só palavras" com 2 frases, um botão azul "Continuar" e o rodapé "Nenhum dado pessoal é pedido. Nenhum mesmo."

**O que funciona nos 3 segundos:**
- A proposta fica clara quase imediatamente — "sua voz, sem rosto" é uma das melhores taglines possíveis para este produto: 4 palavras que comunicam expressão + anonimato.
- Zero excesso de informação. Uma ideia por tela. Nada pisca, nada se move, nada pede e-mail.
- O rodapé "Nenhum dado pessoal é pedido. Nenhum mesmo." é o momento de maior construção de confiança da tela — a repetição enfática soa humana, não jurídica.

**O que falha nos 3 segundos:**
- **A aba do navegador entrega um favicon alheio.** O site usa o `favicon.ico` padrão do scaffold do Next.js. Antes de qualquer palavra sua, o navegador diz "isto é um template". Para um produto cujo ativo central é confiança, é a primeira mancha — e está no primeiro pixel.
- **O domínio `ecoa-teal.vercel.app`** grita "projeto de teste". Pessoas emocionalmente fragilizadas são *mais* sensíveis a sinais de amadorismo, não menos: "vou contar meu segredo para um site que nem domínio tem?"
- O visitante não consegue **ver o produto antes de aceitar**. Não há nenhum vislumbre do feed, nenhum desabafo de exemplo, nenhuma prova social de que "alguém vai te ler". A promessa pede fé cega.
- Não há como ler a tal "política de privacidade" citada no checkbox — o texto não é link (ver §13/§14, é o problema mais grave da auditoria).

**Assusta ou gera ansiedade?** Não — a tela é calma. Mas confiança é diferente de calma: a tela acalma sem *provar* nada.

---

## 2. Hero (tela de boas-vindas)

- **Headline** (`Aqui, só palavras` / cartões seguintes): boa. Curta, concreta, diferenciadora. O trio de cartões (proposta → regras → anonimato) tem arco narrativo correto: o que é → como se comporta → por que é seguro.
- **Subheadline** ("Sem fotos, sem seguidores, sem fama..."): eficaz por negação — define o produto pelo que ele *não* é, que é exatamente o posicionamento. Ponto forte real.
- **CTA**: "Continuar" ×2 e depois "Começar". Funcional, mas emocionalmente neutro. "Começar" é verbo de app de produtividade. Para quem está mal, o convite poderia ser o próprio ato: algo na família de "Quero ser ouvido" ou "Entrar em silêncio" teria mais tração emocional (sugestão de relatório, não implementada).
- **Hierarquia visual**: correta — logotipo pequeno, cartão dominante, indicador de progresso (3 pontos), CTA isolado. O olho percorre na ordem certa.
- **Espaçamento**: generoso (`gap-8`, `p-8`), consistente com a promessa de calma.
- **Tipografia**: a dupla Literata (serifada, para conteúdo emocional) + Inter (UI) é uma decisão acima da média para MVP — cria a sensação "caderno, não dashboard". Títulos dos cartões em serifada 2xl: bom.
- **Legibilidade**: alta. Corpo em `text-muted` com line-height folgado.
- **Emoção transmitida**: sobriedade calma. Não infantil, não clínica. Falta um grau de *calor* — a tela é digna, mas não abraça.
- **Clareza**: 9/10. Ninguém termina os 3 cartões sem entender o produto.

**"Se eu estivesse emocionalmente mal, esse Hero me faria querer escrever?"**
Ele não me impediria — e isso já é mais do que a maioria dos sites consegue. Mas também não me *puxaria*: faltam (a) prova de que existe gente do outro lado ("Hoje, N pessoas escreveram / foram acolhidas"), (b) um exemplo real de desabafo + resposta acolhedora, que é o argumento de venda mais poderoso que este produto pode ter, e (c) fricção zero de leitura — hoje é obrigatório criar conta até para *ler*, e quem está mal costuma querer espiar antes de falar. Este é o maior atrito de aquisição do produto (ver §5).

---

## 3. Identidade visual

**Paleta**: off-white quente `#FAF8F5` / grafite `#26282D` no claro; `#14161A` / `#E8E6E3` no escuro; um único acento azul-sereno (`#4A6FA5` / `#7C9CC9`). Avaliação: **excelente escolha estratégica**. O azul dessaturado é a cor certa para "confiança + calma" sem cair no azul-banco. O off-white quente evita o branco hospitalar. O modo escuro nativo respeita quem desabafa de madrugada.

**Contraste** (calculado): texto principal 14,0:1 (claro) e 14,8:1 (escuro) — AAA com folga. Acento sobre branco 5,1:1 — AA. `muted` sobre fundo claro **4,8:1 — passa AA por pouco**, e é usado extensivamente em `text-xs` (12px): tecnicamente aprovado, na prática cansativo para baixa visão (ver §11).

**Consistência**: alta — tokens CSS únicos (`--background`, `--card`, `--accent`, `--hairline`), raios de borda em duas escalas (xl/2xl), hairlines de 1px em vez de sombras. Nada destoa.

**Peso visual**: leve, correto. Separação por espaço em branco e hairline, não por caixas pesadas. **Sombras**: praticamente ausentes (só `shadow-sm` no cartão do onboarding) — coerente.

**Ícones**: SVGs de linha 1.5px desenhados à mão (casa, pena, sino, pessoa) — coesos entre si e com a tipografia. Emojis aparecem apenas nas reações e em microcopy — no contexto certo, humanizam; o risco de infantilizar foi evitado.

**Transmite paz/acolhimento/confiança/anonimato/respeito?** Paz: sim. Respeito: sim. Anonimato: sim (a estética "sem rosto" é percebida). Confiança: parcialmente (design sim, sinais institucionais não — §14). Acolhimento: 70% — a base é serena, mas serenidade sem calor humano tende ao neutro; o calor hoje vem quase todo da microcopy, não do visual.

**Parece fria/corporativa/tecnológica demais?** Não. Parece um caderno à meia-luz — que era a intenção declarada do blueprint. É a maior vitória estética do MVP.

---

## 4. Experiência emocional

Por persona:

- **Ansiosa**: bem servida. Sem contadores em tempo real, sem badge vermelho, sem trending, sem autoplay. O "marco de respiro" no feed ("Você leu bastante 💙") é raro de se ver e emocionalmente correto. **Porém**: o aviso na tela do número — "se você limpar os dados do site, ela não poderá ser recuperada" — planta uma ansiedade permanente ("posso perder tudo a qualquer momento") sem oferecer solução. Necessário, mas hoje é uma ferida aberta.
- **Triste/solitária**: o feed cronológico com desabafos reais é o acolhimento em si. As 6 reações rotuladas ("Você não está sozinho", "Eu entendo") são o melhor componente emocional do produto — transformam o "like" em frase dita.
- **Em sofrimento agudo**: o fluxo de crise é **exemplar**: detecta sinais, mostra CVV 188 *sem bloquear a publicação*, e repete o recurso no topo da Ajuda. Nenhuma rede grande faz melhor que isso no momento da escrita.
- **Frustrada/estressada**: risco moderado — erros do banco em ações destrutivas agora *lançam* erro (tela de erro genérica do Next), que é abrupta para este público.
- **Feliz querendo compartilhar**: atendida (temas Conquista/Gratidão, reação "Fico feliz por você"), mas o app inteiro *cheira* a desabafo triste; a pessoa feliz pode se sentir deslocada. O placeholder rotativo ajuda ("Como foi seu dia?").

**Excesso de estímulos?** Não — é dos apps mais silenciosos que já auditei. **O que aumenta ansiedade:** (1) medo de perder a conta; (2) "Carregar mais" que joga a pessoa de volta ao topo com posts diferentes — desorientação no meio de uma leitura emocional (§6); (3) `confirm()` nativo do navegador em exclusões — caixa cinza de sistema no meio de um ambiente cuidadosamente acolhedor é uma quebra brutal de clima.

---

## 5. Fluxo do usuário

Tempos medidos no fluxo real:

| Tarefa | Passos | Tempo estimado | Veredito |
|---|---|---|---|
| Entender o site | 3 cartões | 20–40s | Ótimo |
| Criar conta | 1 checkbox + 1 toque | 5s | Excepcional — talvez o cadastro mais rápido da categoria |
| Ler desabafos | após conta | imediato | Bom, **mas exige conta** |
| Publicar | 2 toques (tab Escrever → Publicar) | 30s–2min | Ótimo |
| Reagir | 2 toques (abrir post → reação) | 5s | Bom, mas **não dá para reagir do feed** |
| Responder | 2 toques + texto | rápido | Bom |
| Denunciar | 3 toques | rápido | Bom |

**Atritos identificados, por gravidade:**
1. **Leitura atrás de cadastro.** O custo é baixíssimo (1 toque), mas o custo *percebido* por um visitante desconfiado é alto: ele ainda não confia e já precisa "criar algo". Um feed público somente-leitura (ou 3 posts de amostra no onboarding) mudaria a curva de conversão.
2. **Reagir exige entrar no post.** O gesto emocional mais frequente do produto tem um hop a mais que o necessário. O card do feed mostra "🤝 Acolher" mas o toque leva à página — promessa de botão, comportamento de link.
3. **Perda de texto do composer.** Não há rascunho persistente: um toque acidental em outra aba do nav e o desabafo digitado morre. Para *este* produto, perder um desabafo escrito com esforço emocional é o pior acidente possível de UX. (O texto sobrevive a erros de moderação — bom — mas não à navegação.)
4. **"Carregar mais" é paginação disfarçada**: substitui a lista e resetа o scroll em vez de estender (§6).
5. Complexidade desnecessária: nenhuma encontrada — o produto é admiravelmente enxuto.

---

## 6. Feed de desabafos

- **Organização**: cronológica, um post por linha, chips de tema horizontais no topo. Correta e honesta (o usuário sabe *por que* está vendo o que vê — transparência algorítmica rara).
- **Espaçamento**: `py-5` entre posts com hairline — o ritmo respira sem desperdiçar tela.
- **Hierarquia dentro do card**: autor/tempo (sm) → tema (xs, muted) → **corpo em Literata 17px** → rodapé de ações (sm, muted). O corpo domina visualmente — exatamente como deve ser num produto onde "o texto é o protagonista".
- **Legibilidade/conforto**: serifada 17px com `leading-relaxed` em coluna `max-w-xl` (~576px, ~65–75 caracteres por linha) — dentro da faixa tipograficamente ideal. `whitespace-pre-wrap` respeita as quebras do autor: detalhe que preserva a "respiração" do desabafo. **Convida à leitura, não cansa.**
- **Problemas reais**:
  1. **Posts longos aparecem inteiros no feed** (sem line-clamp). Um desabafo de 2.000 caracteres vira uma parede que empurra os demais; três desses seguidos e o feed cansa. O convite à leitura se perderia num feed cheio.
  2. **"Carregar mais" quebra a experiência**: é um link que navega para `/?cursor=...` — a página recarrega **apenas com os posts seguintes** e o scroll volta ao topo. Quem estava imerso perde tudo o que estava na tela. Num app de leitura emocional, isso é desorientador. (O marco de respiro a cada ~3 páginas é ótimo — mas montado sobre uma paginação que já interrompe.)
  3. Os chips de tema rolam horizontalmente sem indicação de que há mais além da borda (sem fade/gradiente).
  4. O seletor "recentes" no cabeçalho parece interativo (par com o padrão de dropdown) mas é texto morto — promessa não cumprida.

---

## 7. Cards (análise minuciosa)

**Card de post (feed):** não é um "card" fechado — é um bloco separado por hairline. Decisão certa para leitura contínua (caixas geram claustrofobia visual em série).
- Bordas: `border-b` 1px translúcida — ✔.
- Sombra: nenhuma — ✔ coerente.
- Padding: vertical `py-5` ✔; horizontal herdado do container `px-4` — em telas muito estreitas (<360px) fica justo mas aceitável.
- Alinhamento: `justify-between` no cabeçalho autor/tempo — ✔ padrão consolidado.
- Tipografia: mistura Inter (metadados) + Literata (corpo) — hierarquia por *família* além de tamanho, sofisticado.
- Botões/ações: "🤝 N acolhimentos" e "N respostas" são **links estilizados como texto** (sm, muted) — área de toque pequena (~20px de altura) e affordance fraca: parecem informação, não ação. Funciona, mas não convida.
- **Falha de affordance**: o corpo inteiro é clicável (Link) sem nenhum sinal disso — nem cursor diferenciado do resto, nem hover visível no card todo.

**Cartão de destaque (onboarding, respiro, crise, PII):** `rounded-2xl` + `bg-card` + hairline (e `border-accent/40` nos de atenção) — família visual clara e reconhecível: "cartão = momento de pausa/atenção". Consistente nos 5 lugares onde aparece.

**Sheet de reações (detalhe do post):** 6 chips `rounded-full` com emoji + rótulo + contagem. Estado ativo (accent/10 + borda accent) legível. **Problemas**: (a) em mobile os 6 chips com rótulos longos ("Fico feliz por você") quebram em 3+ linhas — a área de reação fica maior que muitos posts, invertendo a hierarquia; (b) contornos de toque ok (~34px), mas abaixo dos 44px recomendados.

**Responsividade geral dos cards**: coluna única fluida até `max-w-xl`, sem breakpoints intermediários — simples e sem bugs; nada quebra de 320px a 4K.

---

## 8. Microinterações

- **Hover**: presente e discreto (links mudam para accent, botões `opacity-90`). ✔
- **Animações**: praticamente nenhuma — sem entrada de cards, sem confete, sem contadores animados. **No contexto deste produto, a ausência é uma decisão de design correta**, não preguiça: recompensas animadas são gramática de rede social dopaminérgica.
- **Transições**: `transition-colors/opacity` de ~150ms nos interativos. ✔
- **Loading/feedback**: aqui está o déficit. (a) Botões de formulário têm estado pending ("Publicando…", "Criando sua conta…") ✔; (b) **reações têm optimistic update** — toque responde instantâneo ✔ (o melhor feedback do app); (c) **mas navegações não têm nenhum indicador**: tocar num post, num tema ou em "Carregar mais" não dá resposta visual até o servidor responder — em 4G lento o app parece morto por 1–2s. Não há `loading.tsx`, skeleton ou barra de progresso em rota alguma.
- **Estados vazios**: os dois que existem são ótimos ("Nada por aqui ainda. Que tal ser a primeira pessoa a escrever hoje?" / "Quando alguém responder ao que você escreveu, você fica sabendo. 💙") — acolhedores, orientam a próxima ação.
- **Mensagens**: sucesso de publicação ("Publicado. Alguém vai te ler. 💙") é a melhor microinteração do produto — fecha o ciclo emocional da escrita. **Mas some silenciosamente**: fica preso na URL (`?publicado=1`) e persiste em reloads — comportamento estranho de toast que não é toast.
- **Quebras de clima**: `confirm()` nativo em excluir/ocultar (3 lugares) — visual de sistema operacional dentro de um produto que construiu atmosfera própria.

**Veredito**: as microinterações que existem ajudam; o problema é o que *falta* (loading de navegação), não o que sobra.

---

## 9. Mobile — **Nota: 7,5/10**

- **Conforto de leitura**: excelente (17px serifada, coluna correta, dark mode).
- **Escrever**: textarea de 9 linhas em tela cheia com contador — bom; `resize-y` é inútil em mobile mas inofensivo. O teclado empurra o conteúdo normalmente (sem hacks de viewport — correto).
- **Botões**: CTAs principais com `py-3.5` (~48px) ✔. **Ações secundárias falham**: "Denunciar", "Excluir", "Ocultar", "Responder" são `text-xs` (~26–30px de alvo) — abaixo do mínimo confortável, e são justamente ações sensíveis.
- **Navegação**: tab bar inferior fixa com blur, 4 destinos, rótulos + ícones, zona do polegar ✔. `pb-24` no conteúdo evita sobreposição ✔. Falta respeito à *safe area* do iPhone (sem `env(safe-area-inset-bottom)`) — em aparelhos com barra gestual a nav encosta no limite.
- **Áreas clicáveis**: nav ✔, chips de tema razoáveis (~30px), reações ~34px, links de rodapé do card pequenos.
- **Scroll**: natural, sem hijacking ✔; chips horizontais com `scrollbar-none`... referenciado como classe mas **não definida no CSS** — em mobile não aparece scrollbar de todo modo; em desktop aparece (bug cosmético).
- **Ergonomia**: publicar exige alcançar o botão no fim do formulário — ok; "Voltar" no detalhe do post fica no topo esquerdo (fora do polegar), mas o back nativo cobre.

O que impede nota maior: alvos de toque das ações secundárias, ausência de safe-area, nenhum feedback de navegação (pior percebido justamente em mobile/4G) e o reset de scroll do "Carregar mais".

---

## 10. Desktop — **Nota: 6,5/10**

- **Aproveitamento do espaço**: o app é um app mobile centralizado (`max-w-xl`). Em 1440p+, ~60% da tela é vazio simétrico. Para leitura, coluna única estreita é *defensável* (Medium provou); mas aqui até a **tab bar continua fixa no rodapé em desktop**, um padrão declaradamente mobile que em tela grande parece deslocado — navegação lateral ou topo seria o esperado.
- **Largura do conteúdo**: ideal para o corpo do texto; apertada para o composer (escrever num campo de 576px numa tela de 27" é ok, mas o vazio ao redor não trabalha a favor — poderia carregar as regras da casa, o CVV, os temas).
- **Alinhamentos/equilíbrio**: impecáveis dentro da coluna; inexistentes fora dela.
- **Distribuição**: oportunidade clara de layout de 2 colunas ≥1024px (feed + rail com propósito/regras/apoio) sem trair a estética.
- Hover states existem e funcionam; foco de teclado é o problema (ver §11).

---

## 11. Acessibilidade (WCAG 2.1)

**Graves:**
1. **Foco invisível em campos de texto** — `outline-none` no textarea do composer, no de comentário e nos inputs de denúncia/confirmação, substituído apenas por mudança de cor de borda hairline→accent (Δ sutil). Navegação por teclado perde o rastro exatamente onde o usuário mais permanece. (WCAG 2.4.7)
2. **Erros de formulário sem anúncio** — mensagens de erro/aviso (composer, comentário, denúncia) aparecem visualmente mas sem `role="alert"`/`aria-live`; leitores de tela não sabem que a publicação falhou ou que há um aviso de crise. Num produto para pessoas fragilizadas, o aviso do CVV ser inaudível para quem usa leitor de tela é sério. (WCAG 4.1.3)

**Moderados:**
3. **Indicador de não-lida apenas por cor** (ponto azul nas notificações) — sem alternativa textual. (WCAG 1.4.1)
4. **Alvos de toque pequenos** nas ações secundárias (`text-xs`: denunciar/excluir/ocultar/marcar lidas). (WCAG 2.5.8)
5. **`title` como único rótulo acessível-extra nas reações** — os chips têm texto visível ✔, mas a contagem "5" solta dentro do botão é lida sem contexto ("Estou com você, cinco" — aceitável, não ideal).
6. **Sem link "pular para o conteúdo"**; a cada página o teclado atravessa o cabeçalho/chips.
7. **`confirm()` nativo**: acessível por padrão (ironicamente), mas com texto fora do controle de idioma/estilo.

**Leves:**
8. Contraste do `muted` (4,8:1) usado em 12px — legal, porém fatigante; qualquer redução futura de contraste quebra AA.
9. Semântica geral **boa**: `lang="pt-BR"` ✔, headings hierárquicos ✔, `<details>/<summary>` para responder ✔, landmarks `<main>/<nav>` ✔, formulários com `<label>` nos checkboxes ✔ — acima da média de MVPs.
10. Fontes escalam com zoom do navegador ✔ (unidades relativas); não há controle de tamanho in-app (previsto no blueprint, ausente no MVP).

---

## 12. Performance percebida

- **Sensação de velocidade**: alta em banda boa. Páginas server-rendered minúsculas (texto puro, zero imagens de conteúdo), fontes self-hosted via `next/font` (sem FOUT), sem JS pesado de terceiros, sem analytics. O TTFB da Vercel + Supabase sa-east-1 favorece o Brasil.
- **Carregamento**: o custo real são 3–5 queries sequenciais... não — já paralelizadas (`Promise.all`) ✔.
- **Fluidez**: sem jank; nada anima o suficiente para travar.
- **A lacuna é de *percepção*, não de velocidade**: sem `loading.tsx`/skeletons/indicador de rota, qualquer latência vira "cliquei e nada aconteceu" — o app é rápido mas não *comunica* que está trabalhando. Em conexões móveis médias brasileiras, isso define a percepção.
- Otimizações aparentes: contadores agregados no banco (nada de COUNT por card), view única para o feed, edge da Vercel. Sólido para a escala atual.

---

## 13. Segurança percebida

**O usuário sente que está anônimo?** Em parte. Os sinais positivos são fortes: nenhum campo de dado pessoal jamais aparece; o número é entregue com cerimônia ("Só você sabe quem está por trás desse número"); tocar no número de outra pessoa não abre perfil (anti-stalking percebido).

**Mas a confiança percebida desmorona em três pontos:**
1. **A "política de privacidade" citada no checkbox de aceite NÃO EXISTE como página.** O texto não é clicável. Para o usuário atento — exatamente o usuário que este produto quer — isso lê como "prometem privacidade mas não põem por escrito". É o problema de confiança mais grave do produto, e é jurídico além de UX (LGPD exige a política acessível).
2. **Não há explicação pré-cadastro de *como* o anonimato funciona.** A explicação boa existe — mas dentro da Ajuda, atrás do cadastro. Quem mais precisa dela é quem ainda não entrou.
3. **Domínio de teste + favicon de template** (já citados) contaminam tudo: "se não cuidaram do domínio, cuidaram dos meus dados?"

**Pode escrever sem medo?** O medo residual não é de exposição — é de *perda* ("conta vive neste navegador") e de moderação opaca (o usuário não é informado de que textos passam por checagem automática **antes** de publicar; a transparência existe só na Ajuda).

---

## 14. Confiança

Elementos que constroem: design sóbrio e coeso; microcopy humana; CVV em destaque; promessa "nenhum dado pessoal" cumprida de fato; ausência total de dark patterns (raro).

Elementos que corroem, em ordem de dano:
1. Política de privacidade/termos inexistentes como página (checkbox aponta para o nada).
2. Domínio `vercel.app`.
3. Favicon padrão do Next.js.
4. Nenhuma identidade institucional: quem faz o ECOA? Não há "sobre", contato, nada. Anonimato é para os usuários; a *plataforma* anônima demais vira suspeita.
5. Mensagem de erro crua em inglês no onboarding em caso de falha de auth (o `error.message` do Supabase é exibido literalmente — ex.: "Anonymous sign-ins are disabled") — quebra o idioma e o encanto no momento mais crítico.
6. Sem página 404 própria (padrão do Next).

---

## 15. Comparação com plataformas conhecidas

| Critério | ECOA | X/Twitter | Reddit | Threads | Medium | Apps de desabafo (Vent etc.) |
|---|---|---|---|---|---|---|
| Simplicidade | **9** | 4 | 3 | 6 | 7 | 6 |
| Conforto de leitura | **8,5** | 5 | 5 | 7 | **9** | 6 |
| Facilidade de uso | 8 | 6 | 4 | 7 | 7 | 7 |
| Sensação de comunidade | 5 *(depende de massa)* | 6 | **9** | 6 | 4 | 7 |
| Identidade própria | **8** | — | — | — | — | 5 |

Leituras: o ECOA já vence *todas* em calma e pressão social zero — nenhuma das grandes consegue não ser ansiogênica. Perde de todas em prova de vida: comunidade percebida exige ver gente, e o cold start é o desafio existencial (previsto no blueprint como risco nº 1). Do Medium, falta absorver o respeito ao leitor em desktop; do Reddit, nada — a ausência de karma/threads profundas aqui é vantagem deliberada. Contra apps de desabafo existentes, o diferencial real do ECOA é o trio reações-com-frase + fluxo de crise + zero gamificação — nenhum concorrente combina os três.

---

## 16. Heurísticas de Nielsen

1. **Visibilidade do status do sistema — VIOLADA (principal).** Sem indicador de navegação/carregamento; "publicado" preso na URL; nenhuma pista de que a moderação está analisando ("Publicando…" cobre, mas se stage2 demorar 8s o usuário fica sem explicação).
2. **Correspondência sistema/mundo real — ATENDIDA.** Linguagem 100% do usuário ("desabafo", "acolher", "só quero ser ouvido"). Exceção: erro de auth em inglês.
3. **Controle e liberdade — PARCIAL.** Excluir post/conta ✔, fechar respostas ✔, trocar reação ✔. Falta: desfazer (exclusões são confirmadas por `confirm()`, não reversíveis), editar post (existe janela de 15min no banco, **sem UI**), rascunho.
4. **Consistência e padrões — ATENDIDA em geral.** Deslizes: "Avisos" na nav vs. rota "notificacoes"; seletor "recentes" que parece dropdown; "🤝 Acolher" no feed que é link e não ação.
5. **Prevenção de erros — BOA.** Contador de caracteres, `maxLength`, checkbox obrigatório, confirmação digitada "EXCLUIR" para conta (excelente), avisos de PII/crise antes de publicar.
6. **Reconhecimento em vez de memorização — ATENDIDA.** Tudo visível; zero jargão; temas por chips nomeados.
7. **Flexibilidade e eficiência — FRACA (aceitável em MVP).** Nenhum atalho, nenhuma personalização (tema manual, tamanho de fonte, silenciar temas — todos no blueprint, nenhum no MVP).
8. **Estética e design minimalista — EXEMPLAR.** A melhor heurística do produto.
9. **Ajudar a reconhecer/recuperar erros — PARCIAL.** Erros de formulário são claros e em PT ✔; erros de ações destrutivas viram tela de erro genérica; erro de auth em inglês cru.
10. **Ajuda e documentação — BOA.** Página de Ajuda curta, humana, com CVV no topo e explicação da moderação. Falta: acessível *antes* do cadastro, e política de privacidade real.

---

## 17. Design System

- **Tokens**: 6 cores semânticas em CSS vars com par claro/escuro — mínimo certo, bem executado.
- **Componentes**: reutilização real (PostCard, chips, cartões de aviso, formulários com o mesmo padrão `useActionState`); botões primário/destrutivo/fantasma consistentes **por repetição de classes, não por componente** — com o crescimento, vão divergir (já há 3 variações de botão primário com paddings ligeiramente diferentes).
- **Espaçamentos**: escala Tailwind respeitada (2/3/4/5/6/8); ritmo vertical uniforme.
- **Tipografia**: escala usada: xs/sm/[15px]/[17px]/lg/2xl/3xl/4xl/5xl — os tamanhos arbitrários `[15px]`/`[17px]` funcionam mas furam a escala; o corpo do post (17px) e do comentário (15px) merecem tokens nomeados.
- **Cores fora do sistema**: `red-500` para destrutivo/erro usado direto da paleta Tailwind, sem variável — o único momento em que a paleta "sai do personagem" (e um vermelho dessaturado combinaria mais com o tom do produto).
- **Padrões**: consistentes. Nota geral do sistema: 7/10 — coeso hoje, frágil para escalar sem extração de componentes de botão/campo.

---

## 18. UX Writing

**Nível geral: o ponto mais forte do produto.** "Publicado. Alguém vai te ler. 💙" / "O autor pediu só para ser ouvido. Você ainda pode acolher." / "Sem pressa. 🌱" / "Responda como responderia a um amigo." — são frases de gente, com calor real, sem melação. Os rótulos das reações são conceito de produto, não só copy.

**Onde melhorar (sugestões de relatório, não implementadas):**
- "Começar" → algo com promessa emocional ("Quero ser ouvido").
- "Avisos" → "Respostas" (é literalmente o que a aba contém — e evita a semântica de advertência).
- Aviso de perda de conta: hoje ameaça sem saída; reformular para dar ação ("Sua conta vive neste navegador — em breve você poderá salvar uma frase de recuperação").
- Erro de auth: nunca exibir `error.message` cru; traduzir para "Não conseguimos criar sua conta agora. Tente de novo em instantes."
- "Alterações de salvamento"/textos do `confirm()` nativos fogem do tom (limitação técnica do confirm).
- Checkbox de aceite promete documentos que precisam existir e ser linkados.
- O contador "1.240/2000" pode assustar minimalistas — considerar exibi-lo só a partir de ~80% do limite.

---

## 19. Gamificação

**Existente**: nenhuma — e o blueprint proíbe a gamificação clássica (streaks, rankings, karma) por design. A auditoria **endossa** a proibição: qualquer placar público destruiria o posicionamento.

**Oportunidades compatíveis com anonimato e antivício (apenas citadas):**
1. **Retorno emocional privado**: o digest já previsto ("Nesta semana, 27 pessoas acolheram o que você escreveu") — visível só ao dono, sem comparação com ninguém.
2. **Mural do dia** (pergunta coletiva diária) — ritual de retorno sem notificação insistente.
3. **Aniversário no app** ("Você ecoa há 1 ano 💙") — privado.
4. **"Cartas ao futuro"** — retorno agendado com propósito emocional, não behaviorista.
5. **Selo interno invisível de acolhedor** (prioridade no feed Comunidade para quem responde bem) — recompensa por bondade que ninguém vê, o oposto exato do karma.

---

## 20. Pontos fortes

1. Posicionamento visual "caderno, não rede social" executado de verdade (tipografia serifada no conteúdo, paleta, silêncio visual).
2. Reações com frase — melhor ideia do produto, bem executada.
3. Fluxo de crise (CVV) no composer e na Ajuda, acolhedor e não punitivo — acima do padrão da indústria.
4. Cadastro de 5 segundos sem nenhum dado pessoal — promessa cumprida literalmente.
5. Microcopy consistentemente humana em PT-BR.
6. Marco de respiro no feed + digest em vez de push — antivício de verdade, não de discurso.
7. "Só quero ser ouvido" (fechar respostas) — controle emocional fino que nenhuma rede grande oferece.
8. Estados vazios que orientam com carinho.
9. Optimistic update nas reações — o gesto mais frequente é o mais responsivo.
10. Dark mode nativo de qualidade (quem desabafa de madrugada agradece).
11. Semântica HTML e contraste do texto principal acima da média (AAA no corpo).
12. Zero dark patterns, zero terceiros rastreando, zero anúncio — a estrutura de confiança é real, ainda que os sinais externos não a comuniquem.

## 21. Pontos fracos (por impacto)

**Crítico**
- C1. Política de privacidade/termos citados no aceite **não existem como página** (confiança + LGPD).
- C2. Favicon padrão do Next + domínio `vercel.app` — traem amadorismo no primeiro segundo.
- C3. "Carregar mais" substitui a página e reseta o scroll — quebra a leitura contínua, principal atividade do produto.
- C4. Perda de rascunho: texto do composer morre em qualquer navegação acidental.

**Alto**
- A1. Nenhum feedback visual de navegação (sem loading.tsx/skeleton/indicador) — app parece travado em rede lenta.
- A2. Foco de teclado invisível nos campos de texto (`outline-none`).
- A3. Erro de auth exibido cru em inglês no onboarding.
- A4. Leitura exige cadastro; nenhum vislumbre do produto antes do aceite (conversão + confiança).
- A5. `confirm()` nativo em ações sensíveis — quebra de clima e de idioma.
- A6. Medo de perda de conta sem mecanismo de recuperação (frase de recuperação prevista no blueprint, ausente).
- A7. Erros de exclusão/reação agora lançam exceção → tela de erro genérica do Next (sem error.tsx amigável).

**Médio**
- M1. Posts longos sem clamp no feed.
- M2. Reagir só dentro do post (afeta o gesto principal).
- M3. Alvos de toque pequenos nas ações secundárias.
- M4. Erros/avisos sem `aria-live` (leitores de tela).
- M5. Desktop subaproveitado + tab bar mobile em tela grande.
- M6. Sem edição de post (janela de 15min existe no banco, sem UI).
- M7. Toast "publicado" preso na URL.
- M8. Ponto de não-lida só por cor.
- M9. Vermelho `red-500` fora da paleta emocional.
- M10. Sem safe-area em iPhones gestuais.

**Baixo**
- B1. Seletor "recentes" parece dropdown e não é.
- B2. Classe `scrollbar-none` referenciada e não definida.
- B3. Chips sem indicação de overflow.
- B4. 404 padrão; sem OG image.
- B5. "Avisos" como rótulo da aba de respostas.
- B6. Contador de caracteres sempre visível.

## 22. Roadmap de melhorias

**Imediatas (dias — confiança e integridade básica):**
1. Página de política de privacidade + regras da comunidade, linkadas no aceite (C1) — desbloqueia confiança e conformidade; custo mínimo.
2. Favicon próprio + OG image (C2-parcial) — 1 hora de trabalho, impacto no primeiro segundo de todos os visitantes.
3. Traduzir/humanizar o erro de auth (A3) — 15 minutos, protege o momento mais frágil do funil.
4. Rascunho do composer em `localStorage` (C4) — pequeno, evita a pior perda possível.
5. `error.tsx` acolhedor global (A7).

**Curto prazo (1–2 semanas — fluidez do núcleo):**
6. "Carregar mais" que *acrescenta* posts (client-side append) em vez de substituir a página (C3) — é a correção de maior impacto na experiência de leitura.
7. `loading.tsx` por rota + indicador fino de navegação (A1).
8. Focus-visible generoso nos campos; `aria-live` nos erros/avisos (A2, M4).
9. Domínio próprio (C2) — ecoa.app/ecoa.com.br ou equivalente.
10. Reação rápida no card do feed (M2) e clamp de posts longos com "continuar lendo" (M1).

**Médio prazo (3–6 semanas — retenção e maturidade):**
11. Frase de recuperação de conta (A6) — remove a ansiedade estrutural; já desenhada no blueprint.
12. Modal de confirmação próprio no lugar de `confirm()` (A5); edição de post na janela de 15min (M6).
13. Layout desktop de 2 colunas + navegação adequada (M5).
14. Amostra de leitura pré-cadastro — 3 desabafos exemplares no onboarding ou feed público read-only (A4).
15. Alvos de toque ≥44px nas ações; safe-area; toast real para "publicado".

**Futuras (do blueprint, na ordem certa):**
16. Digest semanal privado + mural do dia (retorno saudável).
17. Ordenações "Comunidade"/"Mais apoiados" com transparência.
18. Configurações de bem-estar (lembrete de pausa, silenciar temas, fonte).
19. Busca; modo efêmero; captcha invisível no cadastro (recomendado pelo próprio Supabase).

## 23. Notas finais

| Dimensão | Nota | Justificativa resumida |
|---|---|---|
| UX | **7,0** | Fluxos centrais curtos e sem atrito; derrubam a nota a paginação que reseta leitura, ausência de rascunho e de feedback de navegação. |
| UI | **7,5** | Sistema visual coeso, tipografia excelente, hierarquia certa; perde por botões-texto sem affordance, confirm() nativo e detalhes (chips, seletor morto). |
| Design (conceito) | **8,0** | A tradução do conceito "caderno anônimo acolhedor" para forma é a maior conquista; falta calor visual além da copy. |
| Acessibilidade | **6,0** | Base semântica e contraste principal fortes; foco invisível em inputs e erros sem aria-live são falhas reais para os públicos mais vulneráveis. |
| Performance percebida | **7,5** | Rápido de fato (payload mínimo, zero terceiros), mas sem comunicar progresso — em 4G a percepção cai. |
| Clareza | **8,5** | Proposta compreendida em segundos; linguagem impecável; só o "recentes" morto e "Avisos" confundem. |
| Confiança | **5,5** | O produto *é* confiável, mas não *prova*: política inexistente, domínio de teste, favicon alheio, nenhuma identidade institucional. |
| Segurança percebida | **6,5** | Anonimato bem comunicado no fluxo; corroído pelos sinais externos e pelo medo de perda de conta sem saída. |
| Experiência emocional | **8,0** | Reações com frase, fluxo de crise, respiro, "só quero ser ouvido" — o coração do produto bate; confirm() e ansiedade de perda de conta tiram pontos. |
| Mobile | **7,5** | Leitura e escrita confortáveis, nav correta; alvos pequenos nas ações e sem safe-area/feedback de rota. |
| Desktop | **6,5** | Correto porém omisso: layout mobile centralizado com tab bar de celular em monitor. |
| **Qualidade geral** | **7,3** | MVP muito acima da média em conceito e execução emocional; abaixo do próprio potencial em sinais de confiança e polish de fluidez. |

## 24. Conclusão

- **Eu usaria?** Sim — e voltaria, o que é mais raro. A combinação silêncio visual + reações com frase + CVV não-punitivo não existe pronta no mercado brasileiro.
- **Eu recomendaria?** Para alguém precisando desabafar hoje: sim, com a ressalva "é novo, está começando". Para um usuário cético de privacidade: ainda não — ele clicaria no checkbox, procuraria a política, não encontraria, e fecharia a aba.
- **O design transmite acolhimento?** A *escrita* acolhe profundamente; o *visual* acalma e respeita. O abraço completo virá quando os dois se encontrarem (calor visual + provas de vida da comunidade).
- **O anonimato é convincente?** Tecnicamente é real (verificado em código: nem a API expõe o vínculo conta↔conteúdo). Perceptualmente, 70% — falta a explicação pré-cadastro e os documentos que provem o compromisso.
- **Potencial de crescimento?** Sim, e grande — o posicionamento anti-rede-social tem demanda reprimida real. O gargalo não é produto: é cold start (feed vazio não retém) e distribuição. O blueprint já prevê a resposta certa (beta com comunidades-semente).
- **O que impediria de virar referência?** Nesta ordem: (1) feed vazio no lançamento; (2) confiança não comprovada por sinais externos; (3) moderação que precisa se manter impecável quando escalar (o Estágio 2 com IA está desligado por falta de créditos — ligar antes de crescer); (4) ausência de recuperação de conta corroendo retenção de longo prazo.

**As 10 melhorias de maior impacto (ordem de execução recomendada):**
1. Política de privacidade + regras publicadas e linkadas no aceite.
2. Favicon/OG próprios + domínio próprio.
3. "Carregar mais" aditivo (sem reset de leitura).
4. Rascunho persistente do composer.
5. Feedback de navegação (loading por rota).
6. Foco visível + aria-live (acessibilidade dos vulneráveis).
7. Erro de auth humanizado em PT.
8. Amostra de desabafos antes do cadastro.
9. Frase de recuperação de conta.
10. Reação direta no feed + clamp de posts longos.

*Fim do relatório. Nenhum arquivo do produto foi modificado.*
