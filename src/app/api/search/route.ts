import { fail, ok, readJson } from "@/lib/api";
import { searchAssets, suggestQueries } from "@/lib/repositories";

export const dynamic = "force-dynamic";

type SearchBody = {
  query?: string;
  mode?: "keyword" | "semantic" | "hybrid";
  kinds?: string[];
  region?: string;
  yearFrom?: number;
  yearTo?: number;
  limit?: number;
};

const VALID_MODES = new Set(["keyword", "semantic", "hybrid"]);

export async function POST(request: Request) {
  const body = await readJson<SearchBody>(request);
  if (!body) return fail("bad_request", "A JSON body is required.", 400);

  const query = (body.query ?? "").trim();
  const mode = body.mode && VALID_MODES.has(body.mode) ? body.mode : "hybrid";
  if (query.length > 400) return fail("bad_request", "Query too long (max 400 characters).", 400);

  const response = await searchAssets({
    query,
    mode,
    kinds: body.kinds?.filter(Boolean),
    region: body.region || undefined,
    yearFrom: body.yearFrom,
    yearTo: body.yearTo,
    limit: Math.min(body.limit ?? 30, 60),
  });

  return ok({ ...response, suggestions: query.length === 0 ? await suggestQueries() : [] });
}

export async function GET() {
  return ok({ suggestions: await suggestQueries() });
}
