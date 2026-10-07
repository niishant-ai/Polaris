import { eq } from "drizzle-orm";

import { db } from "@/db";
import { assets, expeditions, passages } from "@/db/schema";
import { fail, ok, readJson } from "@/lib/api";
import { generateContent, type GenerationAudience, type GenerationFormat } from "@/lib/generate";
import { getActingRole } from "@/lib/role";

export const dynamic = "force-dynamic";

const VALID_FORMATS = new Set<GenerationFormat>(["web", "social", "explainer", "newsletter"]);
const VALID_AUDIENCES = new Set<GenerationAudience>(["public", "student", "researcher"]);

type GenerateBody = {
  passageId?: string;
  format?: GenerationFormat;
  audience?: GenerationAudience;
};

/**
 * CITATION LOCK — the entire product promise.
 * No passage id, no generation. The adapter can never see document text
 * that the user has not explicitly selected.
 */
export async function POST(request: Request) {
  const role = await getActingRole();
  if (role === "public") {
    return fail("role_forbidden", "Generating outreach content requires the Editor or Admin role.", 403);
  }

  const body = await readJson<GenerateBody>(request);
  if (!body?.passageId) {
    return fail(
      "citation_source_required",
      "A passageId is required. POLARIS only generates from a passage the user explicitly selected.",
      422,
    );
  }
  const format = body.format && VALID_FORMATS.has(body.format) ? body.format : "web";
  const audience = body.audience && VALID_AUDIENCES.has(body.audience) ? body.audience : "public";

  const [row] = await db
    .select({
      passage: passages,
      asset: assets,
      expeditionName: expeditions.name,
    })
    .from(passages)
    .innerJoin(assets, eq(passages.assetId, assets.id))
    .leftJoin(expeditions, eq(assets.expeditionId, expeditions.id))
    .where(eq(passages.id, body.passageId))
    .limit(1);

  if (!row) return fail("not_found", "That passage no longer exists in the repository.", 404);

  const draft = await generateContent({
    source: {
      id: row.passage.id,
      assetPublicId: row.asset.publicId,
      assetTitle: row.asset.title,
      expeditionName: row.expeditionName ?? row.asset.title,
      heading: row.passage.heading,
      page: row.passage.page,
      text: row.passage.text,
      tags: row.asset.tags,
    },
    format,
    audience,
  });

  return ok({
    draft,
    asset: { id: row.asset.id, publicId: row.asset.publicId, title: row.asset.title },
    passage: { id: row.passage.id, heading: row.passage.heading, page: row.passage.page, text: row.passage.text },
  });
}
