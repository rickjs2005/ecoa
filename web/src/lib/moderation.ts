import Anthropic from "@anthropic-ai/sdk";

// ============================================================
// Moderação ECOA — pipeline em camadas (ver docs/03)
// Estágio 0: regras determinísticas (links, PII, blocklist) — ~0ms
// Estágio 2: Claude Haiku classifica contra a política — só roda
//            se ANTHROPIC_API_KEY estiver configurada (fail-open)
// ============================================================

export type Stage0Result = {
  verdict: "ok" | "blocked";
  reason?: string;
  pii: boolean;
  crisis: boolean;
};

// bare-domain só com TLDs que não colidem com palavras PT após ponto sem espaço
// (ex.: "não aguento.me sinto só" não pode ser bloqueado como link)
const URL_RE =
  /(https?:\/\/|www\.)\S+|\b[a-z0-9-]{2,}(\.[a-z0-9-]{2,})*\.(com(\.br)?|net|org|io|gg|xyz|shop|store|ly)(\/\S*)?(?![a-z])/i;
const EMAIL_RE = /\b[\w.+-]+@[\w-]+\.[\w.-]{2,}\b/;
// telefone BR: sequência de 10-13 dígitos com separadores comuns
const PHONE_RE = /(?<!\d)(\+?55[\s.-]?)?\(?\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}(?!\d)/;

// sinais de crise (pessoa em sofrimento) — NUNCA bloqueia; dispara acolhimento (CVV 188)
const CRISIS_RE =
  /\b(me matar|suic[ií]dio|suicidar|tirar (a )?minha (pr[oó]pria )?vida|acabar com (a minha vida|tudo de vez)|n[aã]o aguento mais viver|quero morrer|sumir de vez|me cortar|me machucar de prop[oó]sito)\b/i;

// blocklist mínima do Estágio 0 — apenas termos inequívocos de ódio/slur em PT-BR.
// O Estágio 2 (Claude) cobre ódio contextual, ironia e variações.
const BLOCKLIST: RegExp[] = [
  /\bmacac[oa] de (favela|senzala)\b/i,
  /\bcrioul[oa]\b/i,
  /\bviad[oa]o? (nojent|imund)/i,
  /\bsapat[aã]o nojent/i,
  /\btraveco\b/i,
  /\bretardad[oa] mental\b/i,
  /\bvolta pra senzala\b/i,
];

export function stage0(text: string): Stage0Result {
  // normaliza unicode para dificultar bypass por homóglifos
  const normalized = text.normalize("NFKC");

  // pii/crise são avaliados sempre — mesmo em texto bloqueado, quem está em
  // crise precisa ver o CVV junto com a recusa
  const pii = EMAIL_RE.test(normalized) || PHONE_RE.test(normalized);
  const crisis = CRISIS_RE.test(normalized);

  if (URL_RE.test(normalized)) {
    return {
      verdict: "blocked",
      reason:
        "Links não são permitidos no ECOA — isso nos protege de spam e golpes. Remova o link e tente de novo.",
      pii,
      crisis,
    };
  }

  for (const re of BLOCKLIST) {
    if (re.test(normalized)) {
      return {
        verdict: "blocked",
        reason:
          "Seu texto contém um termo que viola as regras da comunidade (discurso de ódio). Aqui, todo mundo merece respeito.",
        pii,
        crisis,
      };
    }
  }

  return { verdict: "ok", pii, crisis };
}

// ---------- Estágio 2 — Claude Haiku ----------

export type Stage2Result = {
  violates: boolean;
  category?: string;
  reason?: string;
  skipped?: boolean;
};

const POLICY_PROMPT = `Você é o classificador de moderação do ECOA, uma rede social brasileira 100% texto e anônima para expressão emocional saudável (desabafos, sentimentos, gratidão, conquistas, medos).

Classifique o texto do usuário contra a política. Categorias de VIOLAÇÃO:
- H1: discurso de ódio (raça, etnia, orientação sexual, gênero, religião, origem, deficiência), incluindo ódio velado ou "piada"
- H2: ameaça ou incitação à violência contra pessoas
- H3: assédio direcionado a alguém
- S1: conteúdo sexual explícito ou pornografia textual
- S2: qualquer sexualização de menores
- C1: atividade criminosa (venda de drogas, golpes, armas)
- P1: propaganda político-partidária, campanha eleitoral, convocação para atos ou mobilização política (o ECOA é off-topic para política por design)
- A2: incentivo ou instrução para que OUTRA pessoa se machuque ou tire a própria vida
- D1: exposição de dados pessoais de terceiros (doxxing)
- SP1: spam, corrente, divulgação comercial
- M1: desinformação médica perigosa (ex.: mandar alguém parar remédio controlado)

NÃO são violações (permitido e acolhido):
- Desabafos, tristeza, raiva da própria vida, luto, medo, ansiedade
- Pessoa em sofrimento falando da PRÓPRIA ideação suicida ou autolesão (A1 — deve ser acolhida, nunca punida)
- Opiniões pessoais sobre a própria vida, sentimentos sobre "o país/o mundo" SEM advogar por partido/candidato/ato
- Palavrões e linguagem forte sem alvo de ódio

Na dúvida entre desabafo legítimo e violação, prefira NÃO violar (falso positivo silencia quem sofre).`;

const MODERATION_SCHEMA = {
  type: "object",
  properties: {
    violates: { type: "boolean" },
    category: {
      type: "string",
      enum: ["H1", "H2", "H3", "S1", "S2", "C1", "P1", "A2", "D1", "SP1", "M1", "none"],
    },
    reason: { type: "string", description: "Explicação curta em pt-BR, dirigida ao usuário, sem repetir o conteúdo ofensivo" },
  },
  required: ["violates", "category", "reason"],
  additionalProperties: false,
} as const;

export async function stage2(text: string): Promise<Stage2Result> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { violates: false, skipped: true };
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create(
      {
        model: "claude-haiku-4-5",
        max_tokens: 300,
        system: POLICY_PROMPT,
        messages: [
          {
            role: "user",
            content: `Classifique este texto:\n\n<texto>\n${text}\n</texto>`,
          },
        ],
        output_config: {
          format: {
            type: "json_schema",
            schema: MODERATION_SCHEMA,
          },
        },
      },
      { timeout: 8_000, maxRetries: 1 }
    );

    if (response.stop_reason === "refusal") {
      // o classificador recusou processar — trata como suspeito
      return { violates: true, category: "none", reason: "Conteúdo sinalizado para revisão." };
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { violates: false, skipped: true };
    }
    const parsed = JSON.parse(textBlock.text) as {
      violates: boolean;
      category: string;
      reason: string;
    };
    return { violates: parsed.violates, category: parsed.category, reason: parsed.reason };
  } catch {
    // fail-open: indisponibilidade da API não pode impedir desabafos
    return { violates: false, skipped: true };
  }
}
