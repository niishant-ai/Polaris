import { contentTokens, cosine, embed } from "@/lib/embeddings";

export type SearchMode = "keyword" | "semantic" | "hybrid";

export type SearchDocument = {
  assetId: string;
  publicId: string;
  kind: string;
  title: string;
  tags: string[];
  description: string;
  /** passage text, concatenated for reports */
  passageText: string;
  vector: number[];
  passages: { text: string; vector: number[] }[];
  /** Semantic score computed in Postgres via pgvector cosine distance.
   *  When present it takes precedence over the local cosine fallback. */
  sqlSemantic?: { score: number; passageIndex: number };
};

export type SearchHit = {
  assetId: string;
  publicId: string;
  score: number;
  keywordScore: number;
  semanticScore: number;
  rank: number;
  matchedPassageIndex: number;
  snippet: string;
  highlights: string[];
};

const FIELD_WEIGHTS = { title: 3.2, tags: 2.6, description: 1.6, body: 1 } as const;

function keywordScore(queryTokens: string[], doc: SearchDocument): number {
  if (queryTokens.length === 0) return 0;
  const title = contentTokens(doc.title);
  const description = contentTokens(doc.description);
  const body = doc.passageText ? contentTokens(doc.passageText) : [];
  const tags = doc.tags.flatMap((tag) => contentTokens(tag));

  const countMatches = (haystack: string[]): number => {
    let matched = 0;
    for (const token of queryTokens) {
      let hits = 0;
      for (const candidate of haystack) {
        if (candidate === token) hits += 1;
        else if (token.length > 4 && candidate.startsWith(token.slice(0, Math.max(4, token.length - 2))))
          hits += 0.5;
      }
      if (hits > 0) matched += 1;
    }
    return matched;
  };

  const score =
    (countMatches(title) / queryTokens.length) * FIELD_WEIGHTS.title +
    (countMatches(tags) / queryTokens.length) * FIELD_WEIGHTS.tags +
    (countMatches(description) / queryTokens.length) * FIELD_WEIGHTS.description +
    (countMatches(body) / queryTokens.length) * FIELD_WEIGHTS.body;
  return Math.min(score / (FIELD_WEIGHTS.title + FIELD_WEIGHTS.tags), 1);
}

function semanticScore(
  queryVector: number[],
  doc: SearchDocument,
): { score: number; passageIndex: number } {
  if (doc.sqlSemantic) return doc.sqlSemantic;
  let best = Math.max(0, cosine(queryVector, doc.vector));
  let passageIndex = -1;
  doc.passages.forEach((passage, index) => {
    const value = Math.max(0, cosine(queryVector, passage.vector));
    if (value > best) {
      best = value;
      passageIndex = index;
    }
  });
  return { score: best, passageIndex };
}

/** Reciprocal Rank Fusion, k = 60. */
export function reciprocalRankFuse(
  rankings: string[][],
  k = 60,
): Map<string, number> {
  const fused = new Map<string, number>();
  for (const ranking of rankings) {
    ranking.forEach((id, index) => {
      const current = fused.get(id) ?? 0;
      fused.set(id, current + 1 / (k + index + 1));
    });
  }
  return fused;
}

const SNIPPET_RADIUS = 110;

export function buildSnippet(text: string, queryTokens: string[]): { snippet: string; highlights: string[] } {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return { snippet: "", highlights: [] };
  if (queryTokens.length === 0) return { snippet: clean.slice(0, 220), highlights: [] };

  const lower = clean.toLowerCase();
  let bestIndex = -1;
  let bestDensity = -1;
  const window = SNIPPET_RADIUS * 2;
  for (let i = 0; i < Math.max(1, clean.length - window); i += 24) {
    const slice = lower.slice(i, i + window);
    let density = 0;
    for (const token of queryTokens) {
      if (slice.includes(token)) density += 1;
    }
    if (density > bestDensity) {
      bestDensity = density;
      bestIndex = i;
    }
    if (i + window >= clean.length) break;
  }
  if (bestIndex < 0) bestIndex = 0;
  let start = Math.max(0, bestIndex - 30);
  let end = Math.min(clean.length, start + window);
  if (end - start < 60) {
    start = Math.max(0, clean.length - window);
    end = clean.length;
  }
  const prefix = start > 0 ? "… " : "";
  const suffix = end < clean.length ? " …" : "";
  return { snippet: `${prefix}${clean.slice(start, end)}${suffix}`, highlights: [...queryTokens] };
}

export type RankedResult = SearchHit & { doc: SearchDocument };

export function rankDocuments(
  query: string,
  docs: SearchDocument[],
  mode: SearchMode = "hybrid",
  limit = 24,
): { results: RankedResult[]; tookMs: number; parsed: { tokens: string[]; expansion: string[] } } {
  const started = Date.now();
  const queryTokens = contentTokens(query);
  const queryVector = embed(query);

  const keywordRanking: string[] = [];
  const semanticRanking: string[] = [];
  const scores = new Map<string, { keyword: number; semantic: number; passageIndex: number }>();

  for (const doc of docs) {
    const kw = keywordScore(queryTokens, doc);
    const sem = semanticScore(queryVector, doc);
    scores.set(doc.assetId, { keyword: kw, semantic: sem.score, passageIndex: sem.passageIndex });
    if (kw > 0.02) keywordRanking.push(doc.assetId);
    if (sem.score > 0.05) semanticRanking.push(doc.assetId);
  }

  keywordRanking.sort((a, b) => (scores.get(b)?.keyword ?? 0) - (scores.get(a)?.keyword ?? 0));
  semanticRanking.sort((a, b) => (scores.get(b)?.semantic ?? 0) - (scores.get(a)?.semantic ?? 0));

  const fused = reciprocalRankFuse([
    mode === "semantic" ? [] : keywordRanking,
    mode === "keyword" ? [] : semanticRanking,
  ]);

  const maxFused = Math.max(...[...fused.values(), 0.0001]);

  const results: RankedResult[] = [];
  for (const doc of docs) {
    const s = scores.get(doc.assetId);
    if (!s) continue;
    if (mode === "keyword" && s.keyword <= 0.02) continue;
    if (mode === "semantic" && s.semantic <= 0.05) continue;
    if (mode === "hybrid" && s.keyword <= 0.02 && s.semantic <= 0.05) continue;

    const fusedScore = fused.get(doc.assetId) ?? 0;
    const normalised = fusedScore / maxFused;
    // blend a little direct signal so exact keyword hits still win ties
    const blended = mode === "hybrid" ? normalised * 0.7 + s.keyword * 0.2 + s.semantic * 0.1 : normalised;

    const passageIndex = Math.max(0, s.passageIndex);
    const source = (doc.passages[passageIndex]?.text ?? doc.passageText) || doc.description;
    const { snippet, highlights } = buildSnippet(source, queryTokens);
    results.push({
      assetId: doc.assetId,
      publicId: doc.publicId,
      score: Math.min(1, blended),
      keywordScore: Number(s.keyword.toFixed(3)),
      semanticScore: Number(s.semantic.toFixed(3)),
      rank: 0,
      matchedPassageIndex: passageIndex,
      snippet,
      highlights,
      doc,
    });
  }

  results.sort((a, b) => b.score - a.score);
  const limited = results.slice(0, limit).map((r, i) => ({ ...r, rank: i + 1 }));

  return {
    results: limited,
    tookMs: Date.now() - started,
    parsed: { tokens: queryTokens, expansion: [] },
  };
}
