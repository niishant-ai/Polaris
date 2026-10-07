import { slugify } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Automatic metadata extraction (mock OCR / parser)
 * Deterministic, offline. Production swaps in PDFBox / Document AI
 * behind the same function signature.
 * ------------------------------------------------------------------ */

export type ExtractionCandidate = {
  title: string;
  year: number;
  kind: "report" | "image" | "video" | "dataset";
  tags: string[];
  language: string;
  suggestedExpeditionCode: string | null;
  confidence: number;
  pageCount: number | null;
  durationSeconds: number | null;
  description: string;
};

const TAXONOMY: { tag: string; terms: string[] }[] = [
  { tag: "glaciology", terms: ["glacier", "icesheet", "ice", "massbalance", "glacial", "accumulation"] },
  { tag: "sea ice", terms: ["seaice", "floe", "fastice", "packice"] },
  { tag: "krill", terms: ["krill", "euphausiid", "zooplankton"] },
  { tag: "climate", terms: ["climate", "warming", "temperature", "paleoclimate", "palaeoclimate"] },
  { tag: "ice core", terms: ["icecore", "borehole", "drilling", "isotope"] },
  { tag: "oceanography", terms: ["ocean", "ctd", "salinity", "current", "hydrography", "swell"] },
  { tag: "carbonate chemistry", terms: ["acidification", "carbonate", "co2", "ph", "alkalinity"] },
  { tag: "biodiversity", terms: ["penguin", "seabird", "biodiversity", "species", "census"] },
  { tag: "remote sensing", terms: ["satellite", "sar", "imagery", "orbit", "risat", "sentinel"] },
  { tag: "aerosols", terms: ["blackcarbon", "aerosol", "soot", "pm25"] },
  { tag: "logistics", terms: ["logistics", "resupply", "cargo", "drake", "ration"] },
  { tag: "energy", terms: ["power", "solar", "wind", "diesel", "renewable"] },
  { tag: "space weather", terms: ["aurora", "magnetosphere", "ionosphere", "airglow"] },
  { tag: "station life", terms: ["station", "maitri", "bharati", "himadri", "himansh", "kitchen"] },
  { tag: "policy", terms: ["treaty", "ats", "compliance", "protocol", "governance"] },
  { tag: "outreach", terms: ["outreach", "education", "media", "public"] },
];

const EXTENSION_KIND: Record<string, ExtractionCandidate["kind"]> = {
  pdf: "report",
  doc: "report",
  docx: "report",
  txt: "report",
  md: "report",
  png: "image",
  jpg: "image",
  jpeg: "image",
  webp: "image",
  tif: "image",
  tiff: "image",
  mp4: "video",
  mov: "video",
  webm: "video",
  avi: "video",
  csv: "dataset",
  tsv: "dataset",
  nc: "dataset",
  hdf: "dataset",
  xlsx: "dataset",
  zip: "dataset",
};

const YEARS = /(19|20)\d{2}/;

function titleFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.[a-z0-9]+$/i, "");
  const spaced = withoutExt
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  const cleaned = spaced
    .replace(/\bfinal\b|\bdraft\b|\bv\d+\b|\bcopy\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const cased = cleaned
    .split(" ")
    .map((word) => {
      if (/^\d+(st|nd|rd|th)$/i.test(word)) return word.replace(/(st|nd|rd|th)$/i, (m) => m.toLowerCase());
      if (word.length > 3) return word[0].toUpperCase() + word.slice(1);
      return word.toUpperCase();
    })
    .join(" ");
  return cased || withoutExt;
}

export function extractMetadata(
  filename: string,
  mimeType: string,
  sizeBytes: number,
  sampleText = "",
): ExtractionCandidate {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const kind = EXTENSION_KIND[ext] ?? (mimeType.startsWith("image/") ? "image" : mimeType.startsWith("video/") ? "video" : "report");

  const haystack = `${filename} ${sampleText}`.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokenHay = haystack.split(/\s+/);

  const yearMatch = haystack.match(YEARS);
  const year = yearMatch ? Number(yearMatch[0]) : new Date().getFullYear();

  const scored = TAXONOMY.map((entry) => {
    let score = 0;
    for (const term of entry.terms) {
      for (const token of tokenHay) {
        if (token === term) score += 1;
        else if (token.startsWith(term)) score += 0.6;
      }
    }
    return { tag: entry.tag, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((entry) => entry.tag);

  const expeditionMatch =
    haystack.match(/iae[-\s]?(\d{1,2})/) ??
    haystack.match(/(\d{1,2})(st|nd|rd|th)[\s-]*indian[\s-]*antarctic/) ??
    (haystack.includes("himadri") ? ["himadri"] : null) ??
    (haystack.includes("himansh") ? ["himansh"] : null) ??
    (haystack.includes("southern ocean") || haystack.includes("so-cruise") ? ["SO"] : null);

  const suggestedExpeditionCode = expeditionMatch
    ? expeditionMatch[0].toLowerCase().includes("himadri")
      ? "HIMADRI-2024"
      : expeditionMatch[0].toLowerCase().includes("himansh")
        ? "HIMANSH-2025"
        : expeditionMatch[0] === "SO"
          ? "SO-CRUISE-12"
          : `IAE-${expeditionMatch[1]}`
    : null;

  const pageCount =
    kind === "report" ? Math.max(4, Math.min(320, Math.round(sizeBytes / 42000) + 8)) : null;
  const durationSeconds =
    kind === "video" ? Math.max(20, Math.min(3600, Math.round(sizeBytes / 900000) + 15)) : null;

  const title = titleFromFilename(filename);
  const confidence = Math.min(
    0.97,
    0.44 + (scored.length ? 0.12 : 0) + (yearMatch ? 0.16 : 0) + (suggestedExpeditionCode ? 0.15 : 0),
  );

  const description =
    sampleText.slice(0, 240).replace(/\s+/g, " ").trim() ||
    `Auto-catalogued ${kind} ingested from ${filename}. Metadata extracted by the POLARIS parser.`;

  return {
    title,
    year,
    kind,
    tags: scored.length ? scored : ["uncatalogued"],
    language: "en",
    suggestedExpeditionCode,
    confidence: Number(confidence.toFixed(2)),
    pageCount,
    durationSeconds,
    description,
  };
}

export function mintPublicId(title: string, kind: string): string {
  const base = slugify(title);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || kind}-${suffix}`;
}

export const ACCEPTED_MIME = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/tiff",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "text/csv",
  "application/vnd.ms-excel",
  "application/zip",
  "application/x-netcdf",
];

export function isAccepted(filename: string, mimeType: string): boolean {
  if (ACCEPTED_MIME.includes(mimeType)) return true;
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return Object.keys(EXTENSION_KIND).includes(ext);
}
