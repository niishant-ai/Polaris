import { fail, ok, readJson } from "@/lib/api";
import type { DraftBlock, DraftCitation } from "@/db/schema";
import { createDraft, listDrafts } from "@/lib/repositories";
import { getActingRole } from "@/lib/role";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  const drafts = await listDrafts(status && status !== "all" ? status : undefined);
  return ok({ drafts });
}

type CreateDraftBody = {
  assetId?: string;
  passageIds?: string[];
  format?: string;
  audience?: string;
  headline?: string;
  dek?: string;
  blocks?: DraftBlock[];
  citations?: DraftCitation[];
  hashtags?: string[];
  groundingScore?: number;
  sourceExcerpt?: string;
  adapter?: string;
  status?: string;
};

export async function POST(request: Request) {
  const role = await getActingRole();
  if (role === "public") {
    return fail("role_forbidden", "Saving drafts requires the Editor or Admin role.", 403);
  }

  const body = await readJson<CreateDraftBody>(request);
  if (!body?.assetId || !body.headline || !body.blocks?.length) {
    return fail("bad_request", "assetId, headline and at least one content block are required.", 400);
  }
  if (body.citations?.length === 0) {
    return fail("citation_source_required", "A draft must carry at least one citation.", 422);
  }

  const draft = await createDraft({
    assetId: body.assetId,
    passageIds: body.passageIds ?? [],
    format: body.format ?? "web",
    audience: body.audience ?? "public",
    headline: body.headline,
    dek: body.dek ?? "",
    blocks: body.blocks,
    citations: body.citations ?? [],
    hashtags: body.hashtags ?? [],
    groundingScore: body.groundingScore ?? 0,
    sourceExcerpt: body.sourceExcerpt ?? "",
    adapter: body.adapter ?? "mock",
    status: body.status === "draft" ? "draft" : "in_review",
    createdBy: "Vikram Mehta",
    createdByRole: role,
  });

  return ok({ draft }, { status: 201 });
}
