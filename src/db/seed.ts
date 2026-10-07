import { sql } from "drizzle-orm";

import { db } from "@/db";
import {
  activities,
  assetEmbeddings,
  assets,
  drafts,
  expeditions,
  passages,
  scheduleItems,
  type DraftAuditEntry,
} from "@/db/schema";
import { REPORTS_A, type SeedReport } from "@/data/reports-a";
import { REPORTS_B } from "@/data/reports-b";
import {
  SEED_ACTIVITY,
  SEED_DATASETS,
  SEED_DRAFT_SPECS,
  SEED_IMAGES,
  SEED_VIDEOS,
  type SeedMedia,
} from "@/data/media";
import { SEED_EXPEDITIONS } from "@/data/expeditions";
import { EMBEDDING_DIM, EMBEDDING_MODEL, embed } from "@/lib/embeddings";
import { generateContent } from "@/lib/generate";

const ALL_REPORTS: SeedReport[] = [...REPORTS_A, ...REPORTS_B];

function assetVector(title: string, tags: string[], description: string): number[] {
  const padded = embed(`${title}. ${tags.join(", ")}. ${description}`);
  while (padded.length < EMBEDDING_DIM) padded.push(0);
  return padded;
}

async function insertSeedData(): Promise<void> {
  /* ---------------- expeditions ---------------- */
  const expeditionRows = await db
    .insert(expeditions)
    .values(
      SEED_EXPEDITIONS.map((e) => ({
        slug: e.slug,
        code: e.code,
        name: e.name,
        region: e.region,
        station: e.station,
        season: e.season,
        startDate: e.startDate,
        endDate: e.endDate,
        lat: e.lat,
        lng: e.lng,
        leadScientist: e.leadScientist,
        institutions: e.institutions,
        summary: e.summary,
        tags: e.tags,
      })),
    )
    .returning({ id: expeditions.id, slug: expeditions.slug });
  const expeditionIdBySlug = new Map(expeditionRows.map((row) => [row.slug, row.id]));

  /* ---------------- assets, passages, embeddings ---------------- */
  type AssetInsert = typeof assets.$inferInsert;
  const assetInserts: AssetInsert[] = [];

  for (const report of ALL_REPORTS) {
    assetInserts.push({
      publicId: report.publicId,
      expeditionId: expeditionIdBySlug.get(report.expeditionSlug) ?? null,
      kind: "report",
      title: report.title,
      description: report.description,
      mimeType: "application/pdf",
      sizeBytes: report.sizeBytes,
      fileUrl: `/archive/${report.publicId}`,
      year: report.year,
      author: report.author,
      licence: report.licence,
      tags: report.tags,
      pageCount: report.pageCount,
      status: "catalogued",
      extractionConfidence: 0.91,
    });
  }

  const media: SeedMedia[] = [...SEED_IMAGES, ...SEED_VIDEOS, ...SEED_DATASETS];
  for (const item of media) {
    const mimeByKind: Record<SeedMedia["kind"], string> = {
      image: "image/jpeg",
      video: "video/mp4",
      dataset: "application/x-netcdf",
    };
    assetInserts.push({
      publicId: item.publicId,
      expeditionId: expeditionIdBySlug.get(item.expeditionSlug) ?? null,
      kind: item.kind,
      title: item.title,
      description: item.description,
      mimeType: item.format === "CSV" ? "text/csv" : mimeByKind[item.kind],
      sizeBytes: item.sizeBytes,
      fileUrl: `/archive/${item.publicId}`,
      year: item.year,
      author: item.author,
      licence: item.licence,
      tags: item.tags,
      pageCount: undefined,
      durationSeconds: item.durationSeconds,
      status: "catalogued",
      extractionConfidence: 0.84,
    });
  }

  const assetRows = await db
    .insert(assets)
    .values(assetInserts)
    .returning({ id: assets.id, publicId: assets.publicId, kind: assets.kind, title: assets.title, tags: assets.tags, description: assets.description });
  const assetByPublicId = new Map(assetRows.map((row) => [row.publicId, row]));

  /* passages for reports */
  type PassageInsert = typeof passages.$inferInsert;
  const passageInserts: PassageInsert[] = [];
  for (const report of ALL_REPORTS) {
    const asset = assetByPublicId.get(report.publicId);
    if (!asset) continue;
    report.passages.forEach((passage, index) => {
      passageInserts.push({
        assetId: asset.id,
        ordinal: index + 1,
        heading: passage.heading,
        page: passage.page,
        text: passage.text,
      });
    });
  }
  const passageRows = await db
    .insert(passages)
    .values(passageInserts)
    .returning({ id: passages.id, assetId: passages.assetId, ordinal: passages.ordinal, text: passages.text });

  const passagesByAsset = new Map<string, typeof passageRows>();
  for (const row of passageRows) {
    const list = passagesByAsset.get(row.assetId) ?? [];
    list.push(row);
    passagesByAsset.set(row.assetId, list);
  }

  /* embeddings */
  type EmbeddingInsert = typeof assetEmbeddings.$inferInsert;
  const embeddingInserts: EmbeddingInsert[] = [];
  for (const asset of assetRows) {
    embeddingInserts.push({
      assetId: asset.id,
      passageId: null,
      model: EMBEDDING_MODEL,
      dim: EMBEDDING_DIM,
      vector: assetVector(asset.title, asset.tags, asset.description),
    });
    for (const passage of passagesByAsset.get(asset.id) ?? []) {
      embeddingInserts.push({
        assetId: asset.id,
        passageId: passage.id,
        model: EMBEDDING_MODEL,
        dim: EMBEDDING_DIM,
        vector: embed(passage.text),
      });
    }
  }
  await db.insert(assetEmbeddings).values(embeddingInserts);

  /* ---------------- drafts (generated at seed time by the real engine) ---------------- */
  const expeditionNameBySlug = new Map(SEED_EXPEDITIONS.map((e) => [e.slug, e.name]));
  for (const spec of SEED_DRAFT_SPECS) {
    const asset = assetByPublicId.get(spec.reportPublicId);
    const report = ALL_REPORTS.find((r) => r.publicId === spec.reportPublicId);
    if (!asset || !report) continue;
    const passageList = (passagesByAsset.get(asset.id) ?? []).sort((a, b) => a.ordinal - b.ordinal);
    const passage = passageList[spec.passageIndex];
    if (!passage) continue;

    const generated = await generateContent({
      source: {
        id: passage.id,
        assetPublicId: asset.publicId,
        assetTitle: asset.title,
        expeditionName: expeditionNameBySlug.get(report.expeditionSlug) ?? report.expeditionSlug,
        heading: report.passages[spec.passageIndex].heading,
        page: report.passages[spec.passageIndex].page,
        text: passage.text,
        tags: report.tags,
      },
      format: spec.format,
      audience: spec.audience,
    });

    const audit: DraftAuditEntry[] = [
      {
        at: new Date(Date.now() - 96 * 3600_000).toISOString(),
        actor: spec.createdBy,
        role: spec.createdByRole,
        action: "generated",
      },
    ];
    if (spec.status !== "draft") {
      audit.push({
        at: new Date(Date.now() - 72 * 3600_000).toISOString(),
        actor: spec.createdBy,
        role: spec.createdByRole,
        action: "submitted for review",
      });
    }
    if (spec.status === "approved" || spec.status === "published") {
      audit.push({
        at: new Date(Date.now() - 48 * 3600_000).toISOString(),
        actor: "S. Krishnan",
        role: "admin",
        action: "approved",
      });
    }
    if (spec.status === "published") {
      audit.push({
        at: new Date(Date.now() - 40 * 3600_000).toISOString(),
        actor: "S. Krishnan",
        role: "admin",
        action: "published",
      });
    }
    if (spec.status === "rejected") {
      audit.push({
        at: new Date(Date.now() - 54 * 3600_000).toISOString(),
        actor: "S. Krishnan",
        role: "admin",
        action: "rejected",
        note: spec.note,
      });
    }

    const [draft] = await db
      .insert(drafts)
      .values({
        assetId: asset.id,
        passageIds: [passage.id],
        format: spec.format,
        audience: spec.audience,
        headline: generated.headline,
        dek: generated.dek,
        blocks: generated.blocks,
        citations: generated.citations,
        hashtags: generated.hashtags,
        groundingScore: generated.groundingScore,
        sourceExcerpt: generated.sourceExcerpt,
        adapter: generated.adapter,
        status: spec.status,
        createdBy: spec.createdBy,
        createdByRole: spec.createdByRole,
        audit,
        createdAt: new Date(Date.now() - 96 * 3600_000),
        updatedAt: new Date(Date.now() - (spec.status === "draft" ? 90 : 40) * 3600_000),
      })
      .returning({ id: drafts.id });

    if (draft && spec.channel && spec.scheduledFor) {
      await db.insert(scheduleItems).values({
        draftId: draft.id,
        channel: spec.channel,
        scheduledFor: new Date(spec.scheduledFor),
        status: spec.status === "published" ? "published" : "planned",
        note: "",
      });
    }
  }

  /* ---------------- activity feed ---------------- */
  await db.insert(activities).values(
    SEED_ACTIVITY.map((entry) => ({
      actor: entry.actor,
      role: entry.role,
      action: entry.action,
      entityType: entry.entityType,
      entityId: "",
      entityLabel: entry.entityLabel,
      meta: {},
      createdAt: new Date(Date.now() - entry.hoursAgo * 3600_000),
    })),
  );
}

let seedPromise: Promise<void> | null = null;

/** Idempotent lazy seed — a fresh Postgres bootstraps itself on first read. */
export async function ensureSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    try {
      const [{ count }] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(expeditions);
      if (Number(count) > 0) return;
      await insertSeedData();
    } catch (error) {
      seedPromise = null;
      throw error;
    }
  })();
  return seedPromise;
}
