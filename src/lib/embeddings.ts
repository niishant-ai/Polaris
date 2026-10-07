/**
 * POLARIS embedding model — `polar-hash-256-v1`
 * ------------------------------------------------------------------
 * A deterministic, dependency-free, offline semantic embedding.
 *
 *   1. NFKC normalise, lowercase, strip punctuation.
 *   2. Tokenise + remove stop-words.
 *   3. Expand each token against a polar-science synonym thesaurus
 *      (this is what makes it semantic rather than purely lexical).
 *   4. Hash every token and bigram into 256 signed buckets with
 *      sublinear term-frequency weighting.
 *   5. L2-normalise so cosine similarity is a plain dot product.
 *
 * Swap point for production: `bge-m3` / CLIP behind an inference URL.
 * See docs/04-architecture.md §4 and §7.
 */

export const EMBEDDING_DIM = 256;
export const EMBEDDING_MODEL = "polar-hash-256-v1";

const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","but","by","do","does","for","from","how","i","in","into","is","it",
  "its","of","on","or","that","the","their","there","these","this","to","was","were","what","when","where",
  "which","who","why","will","with","would","you","your","can","could","should","has","have","had","been",
  "about","after","all","also","any","because","between","both","each","few","more","most","other","some",
  "such","than","then","them","they","up","we","our","out","over","under","again","further","once","here",
]);

const SYNONYM_GROUPS: string[][] = [
  ["krill", "crustacean", "zooplankton", "euphausiid", "euphausiacea"],
  ["icesheet", "glacier", "cryosphere", "icemass", "glacial"],
  ["melt", "melting", "ablation", "thaw", "retreat"],
  ["climate", "climatic", "climatechange", "warming"],
  ["icecore", "paleoclimate", "palaeoclimate", "proxy", "core"],
  ["ocean", "marine", "seawater"],
  ["acidification", "carbonate", "co2", "carbondioxide", "ph"],
  ["penguin", "seabird", "colony", "census", "avian"],
  ["aurora", "airglow", "magnetosphere", "ionosphere", "optical"],
  ["station", "base", "outpost", "habitat", "infrastructure"],
  ["power", "energy", "solar", "wind", "renewable", "diesel", "generator"],
  ["food", "ration", "provisioning", "logistics", "supply", "kitchen", "meal", "eat", "eating", "diet", "calorie", "nutrition", "cook", "catering"],
  ["scientist", "researcher", "expeditioner", "crew", "team", "winterover", "participant", "personnel"],
  ["logistics", "cargo", "resupply", "shipping", "drake", "passage"],
  ["satellite", "remote", "sensing", "orbit", "risat", "imagery", "sar"],
  ["blackcarbon", "aerosol", "soot", "pollution", "emission"],
  ["massbalance", "accumulation", "snowfall", "precipitation"],
  ["biodiversity", "ecosystem", "species", "habitat", "flora", "fauna"],
  ["treaty", "governance", "policy", "compliance", "law", "ats"],
  ["himalaya", "himalayan", "himansh", "gangotri", "satopanth", "siachen"],
  ["arctic", "himadri", "svalbard", "nyalesund", "fjord"],
  ["bharati", "maitri", "larsemann", "schirmacher", "antarctic"],
  ["expedition", "cruise", "campaign", "voyage", "traverse"],
  ["drilling", "borehole", "sediment", "core", "sample"],
  ["temperature", "thermal", "heat", "warm", "cold"],
  ["salinity", "freshwater", "runoff", "discharge"],
  ["permafrost", "frozen", "frost", "cryoturbation"],
  ["algae", "bloom", "phytoplankton", "chlorophyll", "primary", "production"],
  ["gear", "instrument", "sensor", "mooring", "ctd", "buoy"],
  ["safety", "medical", "emergency", "rescue", "training"],
  ["outreach", "communication", "public", "media", "dissemination", "education"],
];

const SYNONYM_INDEX = new Map<string, number>();
SYNONYM_GROUPS.forEach((group, i) => {
  group.forEach((word) => {
    if (!SYNONYM_INDEX.has(word)) SYNONYM_INDEX.set(word, i);
  });
});

/** FNV-1a 32-bit hash. */
function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function tokenize(input: string): string[] {
  const normalized = input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (!normalized) return [];
  const raw = normalized.split(/\s+/).filter((t) => t.length > 1 && !STOP_WORDS.has(t));
  const tokens: string[] = [];
  for (const token of raw) {
    // collapse common hyphen/spacing variants so "ice sheet" == "icesheet"
    tokens.push(token.replace(/[\s-]+/g, ""));
    const group = SYNONYM_INDEX.get(token);
    if (group !== undefined) {
      for (const related of SYNONYM_GROUPS[group]) {
        if (related !== token) tokens.push(related);
      }
    }
  }
  return tokens;
}

/** Content tokens (no synonym expansion) — used for keyword scoring + highlighting. */
export function contentTokens(input: string): string[] {
  const normalized = input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (!normalized) return [];
  return normalized.split(/\s+/).filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function tokenWeight(count: number): number {
  return 1 + Math.log(count);
}

export function embed(input: string): number[] {
  const tokens = tokenize(input);
  const counts = new Map<string, number>();
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];
    counts.set(t, (counts.get(t) ?? 0) + 1);
    if (i + 1 < tokens.length) {
      const bigram = `${t}_${tokens[i + 1]}`;
      counts.set(bigram, (counts.get(bigram) ?? 0) + 1);
    }
  }
  const vector = new Array<number>(EMBEDDING_DIM).fill(0);
  for (const [token, count] of counts) {
    const isBigram = token.includes("_");
    const weight = tokenWeight(count) * (isBigram ? 1.35 : 1);
    const h = fnv1a(token);
    const bucket = h % EMBEDDING_DIM;
    const sign = (h >>> 16) & 1 ? 1 : -1;
    vector[bucket] += sign * weight;
  }
  let norm = 0;
  for (const v of vector) norm += v * v;
  norm = Math.sqrt(norm);
  if (norm === 0) return vector;
  return vector.map((v) => v / norm);
}

export function cosine(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < len; i += 1) dot += a[i] * b[i];
  return dot;
}

export function cosineWithNorm(a: number[], b: number[]): number {
  let na = 0;
  let nb = 0;
  let dot = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    dot += a[i] * b[i];
  }
  for (const v of a) na += v * v;
  for (const v of b) nb += v * v;
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
