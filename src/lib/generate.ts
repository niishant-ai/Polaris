import { contentTokens } from "@/lib/embeddings";

/* ------------------------------------------------------------------ *
 * Citation-locked content generation
 * ------------------------------------------------------------------ *
 * The adapter receives ONLY the user-selected passage. There is no
 * code path that hands it the wider document, so the model cannot
 * import context the user has not explicitly chosen.
 *
 * Adapters: mock (deterministic, offline, default) · openai · ollama
 * Every adapter output passes through `verifyGrounding()`, which is
 * model-agnostic — so swapping in a real LLM does not change the
 * integrity guarantee.
 * ------------------------------------------------------------------ */

export type GenerationFormat = "web" | "social" | "explainer" | "newsletter";
export type GenerationAudience = "public" | "student" | "researcher";

export type SourcePassage = {
  id: string;
  assetPublicId: string;
  assetTitle: string;
  expeditionName: string;
  heading: string;
  page: number;
  text: string;
  tags: string[];
};

export type GeneratedBlock = {
  id: string;
  type: "paragraph" | "quote" | "stat" | "bullets";
  text: string;
  items?: string[];
  citationIds: string[];
};

export type GeneratedCitation = {
  id: string;
  label: string;
  passageId: string;
  assetPublicId: string;
  assetTitle: string;
  page: number;
  heading: string;
  snippet: string;
};

export type GeneratedDraft = {
  headline: string;
  dek: string;
  blocks: GeneratedBlock[];
  citations: GeneratedCitation[];
  hashtags: string[];
  groundingScore: number;
  adapter: string;
  sourceExcerpt: string;
  unsupported: string[];
};

export type GenerationRequest = {
  source: SourcePassage;
  format: GenerationFormat;
  audience: GenerationAudience;
};

export type GenerationAdapter = {
  readonly id: string;
  generate(request: GenerationRequest): Promise<Omit<GeneratedDraft, "groundingScore" | "unsupported">>;
};

/* ----------------------------- utilities ----------------------------- */

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

function titleCase(input: string): string {
  return input
    .split(" ")
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const GLOSSARY: Record<string, string> = {
  "mass balance": "whether a glacier gains or loses ice over a year",
  grounding: "where the ice lifts off the land and starts to float",
  krill: "shrimp-like creatures that feed almost everything in the Southern Ocean",
  aragonite: "the mineral shell-building material made from carbonate",
  "black carbon": "soot from burning fuel",
  "fast ice": "sea ice locked to the coast",
  albedo: "how much sunlight a surface reflects",
  lithosphere: "the rigid outer shell of the Earth",
  glaciology: "the study of ice",
  permafrost: "ground that stays frozen all year",
  "active layer": "the top layer of soil that thaws each summer",
  euphausiid: "a krill-like crustacean",
  aethalometer: "an instrument that measures soot in air",
  telemedicine: "treating patients over a video link",
  "ice core": "a cylinder of ice drilled out of a glacier, read like a tree ring",
};

function glossFor(term: string): string | null {
  const hit = Object.keys(GLOSSARY).find((key) => term.toLowerCase().includes(key));
  return hit ? GLOSSARY[hit] : null;
}

function simplify(sentence: string, audience: GenerationAudience): string {
  if (audience === "researcher") return sentence;
  const gloss = glossFor(sentence);
  if (gloss && sentence.includes(".")) {
    const trimmed = sentence.replace(/\.$/, "");
    return `${trimmed} (In plain words: ${gloss}.)`;
  }
  return sentence;
}

function keyStat(sentences: string[]): string | null {
  let best: { sentence: string; count: number } | null = null;
  for (const sentence of sentences) {
    const numbers = sentence.match(/\d[\d.,]*/g);
    const count = numbers ? numbers.length : 0;
    if (!best || count > best.count) best = { sentence, count };
  }
  return best && best.count > 0 ? best.sentence : null;
}

/** Prefer a number that carries a unit ("4.1 million tonnes") over a coordinate or an ID. */
function meaningfulNumber(sentences: string[]): string {
  const stat = keyStat(sentences);
  if (!stat) return "";
  const matches = [
    ...stat.matchAll(
      /(\d[\d.]*)\s*(?:million\s+)?(per cent|percent|%|tonnes?|metres?|meters?|degrees|°C|°|millimetres|millimeters|mm|centimetres|cm|kilograms|kg|litres?|days|years|knots|kilometres|km)\b/gi,
    ),
  ];
  const withUnit = matches.map((match) => match[1]);
  const decimal = withUnit.find((value) => value.includes("."));
  if (decimal) return decimal;
  if (withUnit.length > 0) return withUnit[0];
  const plainDecimals = [...stat.matchAll(/\b\d+\.\d+\b/g)];
  if (plainDecimals.length > 0) return plainDecimals[0][0];
  // years, coordinates and transect IDs are not quantities — never lead with them
  const shortNumbers = [...stat.matchAll(/\b\d{1,3}\b/g)];
  if (shortNumbers.length > 0) return shortNumbers[0][0];
  return "";
}

function headlineFrom(request: GenerationRequest, sentences: string[]): string {
  const subject = titleCase(request.source.expeditionName.replace(/,.*$/, ""));
  const number = meaningfulNumber(sentences);
  switch (request.audience) {
    case "researcher":
      return `${subject}: ${request.source.heading} — reported findings`;
    case "student":
      return number
        ? `What ${number} tells us about ${request.source.heading.toLowerCase()}`
        : `${request.source.heading}, explained for students`;
    default:
      return number
        ? `${subject}: ${request.source.heading.toLowerCase()} in one number — ${number}`
        : `${subject}: ${request.source.heading.toLowerCase()}`;
  }
}

function dekFrom(request: GenerationRequest, sentences: string[]): string {
  const lead = sentences[0] ?? request.source.text.slice(0, 160);
  switch (request.audience) {
    case "student":
      return `A class-ready summary of one paragraph from the ${request.source.expeditionName}. ${lead}`;
    case "researcher":
      return `Extracted from ${request.source.assetTitle}, page ${request.source.page}. ${lead}`;
    default:
      return `India's polar researchers measured something real. Here is what they found. ${lead}`;
  }
}

function hashtagsFrom(request: GenerationRequest): string[] {
  const base = ["PolarScience", "MoES", "AntarcticResearch"];
  const topical = request.source.tags
    .map((tag) => tag.replace(/[^a-z0-9]/gi, ""))
    .filter((tag) => tag.length > 3)
    .slice(0, 3)
    .map((tag) => titleCase(tag).replace(/\s/g, ""));
  return [...new Set([...topical, ...base])].slice(0, 6);
}

/* ----------------------------- mock adapter ----------------------------- */

export const mockAdapter: GenerationAdapter = {
  id: "mock",
  async generate(request) {
    const sentences = splitSentences(request.source.text);
    const { format, audience, source } = request;
    const citation: GeneratedCitation = {
      id: "c1",
      label: "1",
      passageId: source.id,
      assetPublicId: source.assetPublicId,
      assetTitle: source.assetTitle,
      page: source.page,
      heading: source.heading,
      snippet: (source.text.match(/^.{0,140}/)?.[0] ?? source.text).trim(),
    };
    const blocks: GeneratedBlock[] = [];

    const lead = sentences[0] ?? source.text;
    const middle = sentences[1] ?? sentences[0] ?? source.text;
    const stat = keyStat(sentences);

    if (format === "social") {
      blocks.push({
        id: "b1",
        type: "paragraph",
        text: simplify(stat ?? lead, audience),
        citationIds: ["c1"],
      });
      if (sentences[1]) {
        blocks.push({
          id: "b2",
          type: "quote",
          text: sentences[1],
          citationIds: ["c1"],
        });
      }
    } else if (format === "explainer") {
      blocks.push({
        id: "b1",
        type: "paragraph",
        text: simplify(lead, audience),
        citationIds: ["c1"],
      });
      if (audience === "student") {
        blocks.push({
          id: "b2",
          type: "bullets",
          text: "What the data says",
          items: sentences.slice(1, 4).map((s) => simplify(s, "public")),
          citationIds: ["c1"],
        });
      } else {
        blocks.push({
          id: "b2",
          type: "paragraph",
          text: simplify(middle, audience),
          citationIds: ["c1"],
        });
      }
      if (stat) {
        blocks.push({
          id: "b3",
          type: "stat",
          text: stat,
          citationIds: ["c1"],
        });
      }
    } else {
      blocks.push({
        id: "b1",
        type: "paragraph",
        text: simplify(lead, audience),
        citationIds: ["c1"],
      });
      blocks.push({
        id: "b2",
        type: "quote",
        text: middle,
        citationIds: ["c1"],
      });
      if (stat && stat !== middle && stat !== lead) {
        blocks.push({ id: "b3", type: "stat", text: stat, citationIds: ["c1"] });
      }
      if (sentences.length > 2) {
        blocks.push({
          id: "b4",
          type: "paragraph",
          text: simplify(sentences[sentences.length - 1], audience),
          citationIds: ["c1"],
        });
      }
    }

    const headline = headlineFrom(request, sentences);
    return {
      headline: headline.slice(0, 120),
      dek: dekFrom(request, sentences).slice(0, 260),
      blocks,
      citations: [citation],
      hashtags: format === "social" || format === "explainer" ? hashtagsFrom(request) : [],
      sourceExcerpt: source.text,
      adapter: "mock",
    };
  },
};

/* ----------------------------- OpenAI adapter ----------------------------- */

const OPENAI_SYSTEM = `You are POLARIS, an outreach writer for the Ministry of Earth Sciences, India.
You will receive ONE source passage. You may only use facts contained in that passage.
Never invent numbers, places, dates or findings. Every content block must carry citation id "c1".
Reply with strict JSON: {"headline":string,"dek":string,"blocks":[{"type":"paragraph|quote|stat|bullets","text":string,"items"?:string[],"citationIds":string[]}],"hashtags":string[],"sourceExcerpt":string}.`;

export const openaiAdapter: GenerationAdapter = {
  id: "openai",
  async generate(request) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY missing");
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: OPENAI_SYSTEM },
          {
            role: "user",
            content: `Source passage (from "${request.source.assetTitle}", page ${request.source.page}, section "${request.source.heading}"):\n\n${request.source.text}\n\nFormat: ${request.format}\nAudience: ${request.audience}`,
          },
        ],
      }),
    });
    if (!response.ok) throw new Error(`openai ${response.status}`);
    const json: unknown = await response.json();
    const content = (json as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content;
    if (!content) throw new Error("openai empty response");
    const parsed = JSON.parse(content) as Partial<GeneratedDraft>;
    if (!parsed.headline || !Array.isArray(parsed.blocks)) throw new Error("openai malformed response");
    const citations: GeneratedCitation[] = [
      {
        id: "c1",
        label: "1",
        passageId: request.source.id,
        assetPublicId: request.source.assetPublicId,
        assetTitle: request.source.assetTitle,
        page: request.source.page,
        heading: request.source.heading,
        snippet: (request.source.text.match(/^.{0,140}/)?.[0] ?? request.source.text).trim(),
      },
    ];
    return {
      headline: parsed.headline,
      dek: parsed.dek ?? "",
      blocks: parsed.blocks.map((block, index) => ({
        id: block.id ?? `b${index + 1}`,
        type: block.type ?? "paragraph",
        text: block.text ?? "",
        items: block.items,
        citationIds: block.citationIds?.length ? block.citationIds : ["c1"],
      })),
      citations,
      hashtags: parsed.hashtags ?? [],
      sourceExcerpt: request.source.text,
      adapter: "openai",
    };
  },
};

/* ----------------------------- Ollama adapter ----------------------------- */

export const ollamaAdapter: GenerationAdapter = {
  id: "ollama",
  async generate(request) {
    const baseUrl = process.env.OLLAMA_BASE_URL;
    if (!baseUrl) throw new Error("OLLAMA_BASE_URL missing");
    const model = process.env.OLLAMA_MODEL ?? "llama3.1";
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        messages: [
          { role: "system", content: OPENAI_SYSTEM },
          {
            role: "user",
            content: `Source passage: ${request.source.text}\nFormat: ${request.format}\nAudience: ${request.audience}`,
          },
        ],
      }),
    });
    if (!response.ok) throw new Error(`ollama ${response.status}`);
    const json: unknown = await response.json();
    const content = (json as { message?: { content?: string } })?.message?.content;
    if (!content) throw new Error("ollama empty response");
    const parsed = JSON.parse(content) as Partial<GeneratedDraft>;
    if (!parsed.headline || !Array.isArray(parsed.blocks)) throw new Error("ollama malformed response");
    return {
      headline: parsed.headline,
      dek: parsed.dek ?? "",
      blocks: parsed.blocks.map((block, index) => ({
        id: block.id ?? `b${index + 1}`,
        type: block.type ?? "paragraph",
        text: block.text ?? "",
        items: block.items,
        citationIds: block.citationIds?.length ? block.citationIds : ["c1"],
      })),
      citations: [
        {
          id: "c1",
          label: "1",
          passageId: request.source.id,
          assetPublicId: request.source.assetPublicId,
          assetTitle: request.source.assetTitle,
          page: request.source.page,
          heading: request.source.heading,
          snippet: request.source.text.slice(0, 140),
        },
      ],
      hashtags: parsed.hashtags ?? [],
      sourceExcerpt: request.source.text,
      adapter: "ollama",
    };
  },
};

/* ----------------------------- grounding verifier ----------------------------- */

export type GroundingReport = {
  score: number;
  unsupported: string[];
  perBlock: { id: string; recall: number; numericOk: boolean; supported: boolean }[];
};

function stripGlosses(text: string): string {
  return text.replace(/\([^)]*(plain words|In other words|i\.e\.)[^)]*\)/gi, "");
}

export function verifyGrounding(
  blocks: GeneratedBlock[],
  citations: GeneratedCitation[],
  sourceText: string,
): GroundingReport {
  const sourceTokens = new Set(contentTokens(sourceText));
  const sourceNumbers = new Set((sourceText.match(/\d[\d.,]*/g) ?? []).map((n) => n.replace(/[.,]$/, "")));
  const validCitationIds = new Set(citations.map((c) => c.id));

  const perBlock = blocks.map((block) => {
    const text = [stripGlosses(block.text), ...(block.items ?? []).map(stripGlosses)].join(" ");
    const tokens = contentTokens(text);
    if (tokens.length === 0) {
      return { id: block.id, recall: 0, numericOk: true, supported: false };
    }
    let hits = 0;
    for (const token of tokens) {
      if (sourceTokens.has(token)) hits += 1;
      else if (token.length > 5) {
        for (const candidate of sourceTokens) {
          if (candidate.length > 5 && candidate.slice(0, 5) === token.slice(0, 5)) {
            hits += 1;
            break;
          }
        }
      }
    }
    const recall = hits / tokens.length;
    const blockNumbers = (text.match(/\d[\d.,]*/g) ?? []).map((n) => n.replace(/[.,]$/, ""));
    const numericOk = blockNumbers.length === 0 || blockNumbers.every((n) => sourceNumbers.has(n));
    const hasCitation = block.citationIds.some((id) => validCitationIds.has(id));
    const supported = hasCitation && recall >= 0.42 && numericOk;
    return { id: block.id, recall, numericOk, supported };
  });

  const supportedCount = perBlock.filter((b) => b.supported).length;
  const meanRecall = perBlock.reduce((sum, b) => sum + b.recall, 0) / Math.max(1, perBlock.length);
  const score = perBlock.length === 0 ? 0 : supportedCount / perBlock.length * 0.7 + Math.min(1, meanRecall / 0.8) * 0.3;
  return {
    score: Number(Math.min(1, score).toFixed(3)),
    unsupported: perBlock.filter((b) => !b.supported).map((b) => b.id),
    perBlock,
  };
}

/* ----------------------------- public API ----------------------------- */

function resolveAdapter(): GenerationAdapter {
  if (process.env.OPENAI_API_KEY) return openaiAdapter;
  if (process.env.OLLAMA_BASE_URL) return ollamaAdapter;
  return mockAdapter;
}

export async function generateContent(request: GenerationRequest): Promise<GeneratedDraft> {
  const primary = resolveAdapter();
  try {
    const result = await primary.generate(request);
    const grounding = verifyGrounding(result.blocks, result.citations, request.source.text);
    return { ...result, groundingScore: grounding.score, unsupported: grounding.unsupported };
  } catch {
    const fallback = await mockAdapter.generate(request);
    const grounding = verifyGrounding(fallback.blocks, fallback.citations, request.source.text);
    return { ...fallback, groundingScore: grounding.score, unsupported: grounding.unsupported };
  }
}

export const FORMAT_LABELS: Record<GenerationFormat, string> = {
  web: "Website story",
  social: "Social post",
  explainer: "Explainer card",
  newsletter: "Newsletter blurb",
};

export const AUDIENCE_LABELS: Record<GenerationAudience, string> = {
  public: "General public",
  student: "Student (Class 9–12)",
  researcher: "Researcher",
};
