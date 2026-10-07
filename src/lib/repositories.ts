import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";

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
  type DraftBlock,
  type DraftCitation,
} from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { EMBEDDING_DIM, EMBEDDING_MODEL, embed } from "@/lib/embeddings";
import { rankDocuments, type SearchMode } from "@/lib/search";

/* ------------------------------ serialized shapes ------------------------------ */

export type ExpeditionSummary = {
  id: string;
  slug: string;
  code: string;
  name: string;
  region: string;
  station: string;
  season: string;
  startDate: string;
  endDate: string;
  lat: number;
  lng: number;
  leadScientist: string;
  institutions: string[];
  summary: string;
  tags: string[];
  assetCount: number;
};

export type AssetSummary = {
  id: string;
  publicId: string;
  kind: string;
  title: string;
  description: string;
  mimeType: string;
  sizeBytes: number;
  fileUrl: string;
  year: number;
  author: string;
  licence: string;
  tags: string[];
  pageCount: number | null;
  durationSeconds: number | null;
  status: string;
  extractionConfidence: number;
  createdAt: string;
  expeditionSlug: string | null;
  expeditionCode: string | null;
  expeditionName: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
};

export type PassageSummary = {
  id: string;
  ordinal: number;
  heading: string;
  page: number;
  text: string;
};

export type AssetDetail = {
  asset: AssetSummary;
  passages: PassageSummary[];
  related: AssetSummary[];
};

export type DraftSummary = {
  id: string;
  assetId: string;
  assetPublicId: string;
  assetTitle: string;
  expeditionName: string | null;
  format: string;
  audience: string;
  headline: string;
  dek: string;
  blocks: DraftBlock[];
  citations: DraftCitation[];
  hashtags: string[];
  groundingScore: number;
  sourceExcerpt: string;
  adapter: string;
  status: string;
  createdBy: string;
  createdByRole: string;
  audit: DraftAuditEntry[];
  createdAt: string;
  updatedAt: string;
};

export type ScheduleSummary = {
  id: string;
  draftId: string;
  channel: string;
  scheduledFor: string;
  status: string;
  note: string;
  headline: string;
  assetTitle: string;
  audience: string;
  format: string;
};

export type ActivitySummary = {
  id: string;
  actor: string;
  role: string;
  action: string;
  entityType: string;
  entityLabel: string;
  createdAt: string;
};

export type SearchResponse = {
  results: {
    asset: AssetSummary;
    score: number;
    keywordScore: number;
    semanticScore: number;
    rank: number;
    snippet: string;
    highlights: string[];
  }[];
  tookMs: number;
  mode: SearchMode;
  total: number;
};

/* ------------------------------ helpers ------------------------------ */

type AssetJoinRow = {
  asset: typeof assets.$inferSelect;
  expeditionSlug: string | null;
  expeditionCode: string | null;
  expeditionName: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
};

function toAssetSummary(row: AssetJoinRow): AssetSummary {
  const a = row.asset;
  return {
    id: a.id,
    publicId: a.publicId,
    kind: a.kind,
    title: a.title,
    description: a.description,
    mimeType: a.mimeType,
    sizeBytes: a.sizeBytes,
    fileUrl: a.fileUrl,
    year: a.year,
    author: a.author,
    licence: a.licence,
    tags: a.tags,
    pageCount: a.pageCount,
    durationSeconds: a.durationSeconds,
    status: a.status,
    extractionConfidence: a.extractionConfidence,
    createdAt: a.createdAt.toISOString(),
    expeditionSlug: row.expeditionSlug,
    expeditionCode: row.expeditionCode,
    expeditionName: row.expeditionName,
    region: row.region,
    lat: row.lat,
    lng: row.lng,
  };
}

const assetSelection = {
  asset: assets,
  expeditionSlug: expeditions.slug,
  expeditionCode: expeditions.code,
  expeditionName: expeditions.name,
  region: expeditions.region,
  lat: expeditions.lat,
  lng: expeditions.lng,
};

async function loadAssets(filters?: {
  kinds?: string[];
  region?: string;
  yearFrom?: number;
  yearTo?: number;
  expeditionSlug?: string;
  tag?: string;
  limit?: number;
}): Promise<AssetSummary[]> {
  const conditions = [];
  if (filters?.kinds?.length) conditions.push(inArray(assets.kind, filters.kinds));
  if (filters?.region) conditions.push(eq(expeditions.region, filters.region));
  if (filters?.yearFrom) conditions.push(gte(assets.year, filters.yearFrom));
  if (filters?.yearTo) conditions.push(lte(assets.year, filters.yearTo));
  if (filters?.expeditionSlug) conditions.push(eq(expeditions.slug, filters.expeditionSlug));
  if (filters?.tag) conditions.push(sql`${assets.tags} @> ${JSON.stringify([filters.tag])}::jsonb`);

  const query = db
    .select(assetSelection)
    .from(assets)
    .leftJoin(expeditions, eq(assets.expeditionId, expeditions.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(assets.year), asc(assets.title));

  const rows = filters?.limit ? await query.limit(filters.limit) : await query;
  return rows.map(toAssetSummary);
}

/* ------------------------------ expeditions ------------------------------ */

export async function getExpeditions(): Promise<ExpeditionSummary[]> {
  await ensureSeeded();
  const rows = await db
    .select({
      expedition: expeditions,
      assetCount: sql<number>`cast(count(${assets.id}) as int)`,
    })
    .from(expeditions)
    .leftJoin(assets, eq(assets.expeditionId, expeditions.id))
    .groupBy(expeditions.id)
    .orderBy(desc(expeditions.startDate));

  return rows.map(({ expedition, assetCount }) => ({
    id: expedition.id,
    slug: expedition.slug,
    code: expedition.code,
    name: expedition.name,
    region: expedition.region,
    station: expedition.station,
    season: expedition.season,
    startDate: expedition.startDate,
    endDate: expedition.endDate,
    lat: expedition.lat,
    lng: expedition.lng,
    leadScientist: expedition.leadScientist,
    institutions: expedition.institutions,
    summary: expedition.summary,
    tags: expedition.tags,
    assetCount: Number(assetCount),
  }));
}

export async function getTimelineExpeditions(): Promise<ExpeditionSummary[]> {
  const all = await getExpeditions();
  return all.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/* ------------------------------ assets ------------------------------ */

export async function listAssets(filters?: Parameters<typeof loadAssets>[0]): Promise<AssetSummary[]> {
  await ensureSeeded();
  return loadAssets(filters);
}

export async function getAssetDetail(publicId: string): Promise<AssetDetail | null> {
  await ensureSeeded();
  const [row] = await db
    .select(assetSelection)
    .from(assets)
    .leftJoin(expeditions, eq(assets.expeditionId, expeditions.id))
    .where(eq(assets.publicId, publicId))
    .limit(1);
  if (!row) return null;

  const passageRows = await db
    .select()
    .from(passages)
    .where(eq(passages.assetId, row.asset.id))
    .orderBy(asc(passages.ordinal));

  const assetSummaries = await loadAssets();
  const ownTags = new Set(row.asset.tags);
  const related = assetSummaries
    .filter((candidate) => candidate.id !== row.asset.id)
    .map((candidate) => ({
      candidate,
      overlap: candidate.tags.filter((tag) => ownTags.has(tag)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap || b.candidate.year - a.candidate.year)
    .slice(0, 4)
    .map((entry) => entry.candidate);

  return {
    asset: toAssetSummary(row),
    passages: passageRows.map((p) => ({
      id: p.id,
      ordinal: p.ordinal,
      heading: p.heading,
      page: p.page,
      text: p.text,
    })),
    related,
  };
}

/* ------------------------------ search ------------------------------ */

export async function searchAssets(params: {
  query: string;
  mode?: SearchMode;
  kinds?: string[];
  region?: string;
  yearFrom?: number;
  yearTo?: number;
  limit?: number;
}): Promise<SearchResponse> {
  await ensureSeeded();
  const mode: SearchMode = params.mode ?? "hybrid";

  const pool = await loadAssets({
    kinds: params.kinds,
    region: params.region,
    yearFrom: params.yearFrom,
    yearTo: params.yearTo,
  });
  if (pool.length === 0) {
    return { results: [], tookMs: 0, mode, total: 0 };
  }

  const ids = pool.map((a) => a.id);
  const passageRows = await db
    .select()
    .from(passages)
    .where(inArray(passages.assetId, ids))
    .orderBy(asc(passages.ordinal));

  // pgvector: compute cosine similarity in Postgres (1 - distance).
  const queryVector = embed(params.query);
  const vectorLiteral = `[${queryVector.join(",")}]`;
  const distanceRows = await db
    .select({
      assetId: assetEmbeddings.assetId,
      passageId: assetEmbeddings.passageId,
      distance: sql<number>`(${assetEmbeddings.vector} <=> ${vectorLiteral}::vector)`,
    })
    .from(assetEmbeddings)
    .where(inArray(assetEmbeddings.assetId, ids));

  const ordinalByPassageId = new Map(passageRows.map((p) => [p.id, p.ordinal]));
  const assetBest = new Map<string, { score: number; passageIndex: number }>();
  for (const row of distanceRows) {
    const similarity = Math.max(0, 1 - Number(row.distance));
    const passageIndex = row.passageId
      ? Math.max(0, (ordinalByPassageId.get(row.passageId) ?? 1) - 1)
      : -1;
    const current = assetBest.get(row.assetId);
    if (!current || similarity > current.score) {
      assetBest.set(row.assetId, { score: similarity, passageIndex });
    }
  }

  const passagesByAsset = new Map<string, { text: string; vector: number[] }[]>();
  for (const row of passageRows) {
    const list = passagesByAsset.get(row.assetId) ?? [];
    list.push({ text: row.text, vector: [] });
    passagesByAsset.set(row.assetId, list);
  }

  const docs = pool.map((asset) => {
    const passageList = passagesByAsset.get(asset.id) ?? [];
    const sem = assetBest.get(asset.id);
    return {
      assetId: asset.id,
      publicId: asset.publicId,
      kind: asset.kind,
      title: asset.title,
      tags: asset.tags,
      description: asset.description,
      passageText: passageList.map((p) => p.text).join(" "),
      vector: new Array<number>(EMBEDDING_DIM).fill(0),
      passages: passageList,
      sqlSemantic: sem ? { score: sem.score, passageIndex: sem.passageIndex } : undefined,
    };
  });

  const { results, tookMs } = rankDocuments(params.query, docs, mode, params.limit ?? 30);
  const byId = new Map(pool.map((a) => [a.id, a]));

  return {
    results: results
      .map((result) => {
        const asset = byId.get(result.assetId);
        if (!asset) return null;
        return {
          asset,
          score: Number(result.score.toFixed(3)),
          keywordScore: result.keywordScore,
          semanticScore: result.semanticScore,
          rank: result.rank,
          snippet: result.snippet,
          highlights: result.highlights,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    tookMs,
    mode,
    total: pool.length,
  };
}

export async function suggestQueries(): Promise<string[]> {
  return [
    "how does melting sea ice affect krill",
    "black carbon on Himalayan snow",
    "what do expeditioners eat during polar winter",
    "is the Southern Ocean acidifying",
    "aurora observations at Bharati",
    "Antarctic Treaty obligations for India",
  ];
}

/* ------------------------------ ingestion ------------------------------ */

export type CreateAssetInput = {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  kind: string;
  title: string;
  description: string;
  expeditionSlug: string | null;
  tags: string[];
  year: number;
  author: string;
  licence: string;
  pageCount: number | null;
  durationSeconds: number | null;
  sampleText: string;
  createdBy: string;
  createdByRole: string;
  /** Storage-backed location (e.g. `supabase:assets/<path>`). Falls back to
   *  the in-app viewer route when the asset is catalogued without a binary. */
  fileUrl?: string;
};

export async function createAsset(input: CreateAssetInput): Promise<AssetSummary> {
  await ensureSeeded();
  let expeditionId: string | null = null;
  if (input.expeditionSlug) {
    const [row] = await db
      .select({ id: expeditions.id })
      .from(expeditions)
      .where(eq(expeditions.slug, input.expeditionSlug))
      .limit(1);
    expeditionId = row?.id ?? null;
  }

  const publicId = `${input.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60)}-${Math.random().toString(36).slice(2, 6)}`;

  const [asset] = await db
    .insert(assets)
    .values({
      publicId,
      expeditionId,
      kind: input.kind,
      title: input.title,
      description: input.description,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      fileUrl: input.fileUrl ?? `/archive/${publicId}`,
      year: input.year,
      author: input.author,
      licence: input.licence,
      tags: input.tags,
      pageCount: input.pageCount,
      durationSeconds: input.durationSeconds,
      status: "catalogued",
      extractionConfidence: 0.87,
    })
    .returning();

  const passageTexts =
    input.kind === "report" && input.sampleText.trim().length > 80
      ? input.sampleText
          .replace(/\s+/g, " ")
          .split(/(?<=[.!?])\s+/)
          .filter((sentence) => sentence.trim().length > 40)
      : [];

  let insertedPassageId: string | null = null;
  if (passageTexts.length > 0) {
    const [first] = await db
      .insert(passages)
      .values({
        assetId: asset.id,
        ordinal: 1,
        heading: "Extracted text",
        page: 1,
        text: passageTexts.join(" ").slice(0, 1600),
      })
      .returning({ id: passages.id });
    insertedPassageId = first?.id ?? null;
  }

  const vector = embed(`${asset.title}. ${asset.tags.join(", ")}. ${asset.description} ${passageTexts.join(" ")}`);
  await db.insert(assetEmbeddings).values({
    assetId: asset.id,
    passageId: null,
    model: EMBEDDING_MODEL,
    dim: EMBEDDING_DIM,
    vector,
  });
  if (insertedPassageId) {
    await db.insert(assetEmbeddings).values({
      assetId: asset.id,
      passageId: insertedPassageId,
      model: EMBEDDING_MODEL,
      dim: EMBEDDING_DIM,
      vector: embed(passageTexts.join(" ")),
    });
  }

  await logActivity({
    actor: input.createdBy,
    role: input.createdByRole,
    action: "ingested and catalogued asset",
    entityType: "asset",
    entityId: asset.id,
    entityLabel: asset.title,
    meta: { kind: asset.kind, year: asset.year },
  });

  const summary = await loadAssets();
  return summary.find((a) => a.id === asset.id) ?? toAssetSummary({ asset, expeditionSlug: null, expeditionCode: null, expeditionName: null, region: null, lat: null, lng: null });
}

/* ------------------------------ activity ------------------------------ */

export async function logActivity(entry: {
  actor: string;
  role: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityLabel: string;
  meta?: Record<string, string | number>;
}): Promise<void> {
  await db.insert(activities).values({
    actor: entry.actor,
    role: entry.role,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId ?? "",
    entityLabel: entry.entityLabel,
    meta: entry.meta ?? {},
  });
}

export async function listActivity(limit = 12): Promise<ActivitySummary[]> {
  await ensureSeeded();
  const rows = await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit);
  return rows.map((row) => ({
    id: row.id,
    actor: row.actor,
    role: row.role,
    action: row.action,
    entityType: row.entityType,
    entityLabel: row.entityLabel,
    createdAt: row.createdAt.toISOString(),
  }));
}

/* ------------------------------ drafts ------------------------------ */

async function draftQuery(status?: string) {
  const rows = await db
    .select({
      draft: drafts,
      assetPublicId: assets.publicId,
      assetTitle: assets.title,
      expeditionName: expeditions.name,
    })
    .from(drafts)
    .leftJoin(assets, eq(drafts.assetId, assets.id))
    .leftJoin(expeditions, eq(assets.expeditionId, expeditions.id))
    .where(status ? eq(drafts.status, status) : undefined)
    .orderBy(desc(drafts.updatedAt));
  return rows;
}

function toDraftSummary(row: Awaited<ReturnType<typeof draftQuery>>[number]): DraftSummary {
  const d = row.draft;
  return {
    id: d.id,
    assetId: d.assetId,
    assetPublicId: row.assetPublicId ?? "",
    assetTitle: row.assetTitle ?? "Unknown asset",
    expeditionName: row.expeditionName ?? null,
    format: d.format,
    audience: d.audience,
    headline: d.headline,
    dek: d.dek,
    blocks: d.blocks,
    citations: d.citations,
    hashtags: d.hashtags,
    groundingScore: d.groundingScore,
    sourceExcerpt: d.sourceExcerpt,
    adapter: d.adapter,
    status: d.status,
    createdBy: d.createdBy,
    createdByRole: d.createdByRole,
    audit: d.audit,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

export async function listDrafts(status?: string): Promise<DraftSummary[]> {
  await ensureSeeded();
  const rows = await draftQuery(status);
  return rows.map(toDraftSummary);
}

export async function getDraftById(id: string): Promise<DraftSummary | null> {
  await ensureSeeded();
  const rows = await db
    .select({
      draft: drafts,
      assetPublicId: assets.publicId,
      assetTitle: assets.title,
      expeditionName: expeditions.name,
    })
    .from(drafts)
    .leftJoin(assets, eq(drafts.assetId, assets.id))
    .leftJoin(expeditions, eq(assets.expeditionId, expeditions.id))
    .where(eq(drafts.id, id))
    .limit(1);
  if (rows.length === 0) return null;
  return toDraftSummary(rows[0]);
}

export type CreateDraftInput = {
  assetId: string;
  passageIds: string[];
  format: string;
  audience: string;
  headline: string;
  dek: string;
  blocks: DraftBlock[];
  citations: DraftCitation[];
  hashtags: string[];
  groundingScore: number;
  sourceExcerpt: string;
  adapter: string;
  status: string;
  createdBy: string;
  createdByRole: string;
};

export async function createDraft(input: CreateDraftInput): Promise<DraftSummary> {
  await ensureSeeded();
  const now = new Date();
  const [row] = await db
    .insert(drafts)
    .values({
      assetId: input.assetId,
      passageIds: input.passageIds,
      format: input.format,
      audience: input.audience,
      headline: input.headline,
      dek: input.dek,
      blocks: input.blocks,
      citations: input.citations,
      hashtags: input.hashtags,
      groundingScore: input.groundingScore,
      sourceExcerpt: input.sourceExcerpt,
      adapter: input.adapter,
      status: input.status,
      createdBy: input.createdBy,
      createdByRole: input.createdByRole,
      audit: [
        {
          at: now.toISOString(),
          actor: input.createdBy,
          role: input.createdByRole,
          action: "generated",
        },
        ...(input.status !== "draft"
          ? [
              {
                at: now.toISOString(),
                actor: input.createdBy,
                role: input.createdByRole,
                action: "submitted for review",
              },
            ]
          : []),
      ],
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: drafts.id });

  const assetTitleRow = await db
    .select({ title: assets.title })
    .from(assets)
    .where(eq(assets.id, input.assetId))
    .limit(1);

  await logActivity({
    actor: input.createdBy,
    role: input.createdByRole,
    action: input.status === "draft" ? "generated draft" : "submitted draft for review",
    entityType: "draft",
    entityId: row.id,
    entityLabel: input.headline,
    meta: { grounding: input.groundingScore },
  });

  const created = await getDraftById(row.id);
  if (!created) throw new Error("draft creation failed");
  void assetTitleRow;
  return created;
}

/* ------------------------------ schedule ------------------------------ */

export async function listSchedule(): Promise<ScheduleSummary[]> {
  await ensureSeeded();
  const rows = await db
    .select({
      item: scheduleItems,
      headline: drafts.headline,
      audience: drafts.audience,
      format: drafts.format,
      assetTitle: assets.title,
    })
    .from(scheduleItems)
    .leftJoin(drafts, eq(scheduleItems.draftId, drafts.id))
    .leftJoin(assets, eq(drafts.assetId, assets.id))
    .orderBy(asc(scheduleItems.scheduledFor));

  return rows.map((row) => ({
    id: row.item.id,
    draftId: row.item.draftId,
    channel: row.item.channel,
    scheduledFor: row.item.scheduledFor.toISOString(),
    status: row.item.status,
    note: row.item.note,
    headline: row.headline ?? "Untitled draft",
    assetTitle: row.assetTitle ?? "",
    audience: row.audience ?? "public",
    format: row.format ?? "web",
  }));
}

export async function createScheduleItem(input: {
  draftId: string;
  channel: string;
  scheduledFor: string;
  note?: string;
}): Promise<ScheduleSummary> {
  await ensureSeeded();
  const [row] = await db
    .insert(scheduleItems)
    .values({
      draftId: input.draftId,
      channel: input.channel,
      scheduledFor: new Date(input.scheduledFor),
      status: "planned",
      note: input.note ?? "",
    })
    .returning();
  const all = await listSchedule();
  const created = all.find((item) => item.id === row.id);
  if (!created) throw new Error("schedule creation failed");
  return created;
}

export async function updateScheduleItem(
  id: string,
  patch: { scheduledFor?: string; channel?: string; note?: string; status?: string },
): Promise<ScheduleSummary | null> {
  await ensureSeeded();
  await db
    .update(scheduleItems)
    .set({
      ...(patch.scheduledFor ? { scheduledFor: new Date(patch.scheduledFor) } : {}),
      ...(patch.channel ? { channel: patch.channel } : {}),
      ...(patch.note !== undefined ? { note: patch.note } : {}),
      ...(patch.status ? { status: patch.status } : {}),
    })
    .where(eq(scheduleItems.id, id));
  const all = await listSchedule();
  return all.find((item) => item.id === id) ?? null;
}

/* ------------------------------ stats ------------------------------ */

export type StatsResponse = {
  assets: number;
  byKind: { kind: string; count: number }[];
  expeditions: number;
  regions: { region: string; count: number }[];
  draftsByStatus: { status: string; count: number }[];
  meanGrounding: number;
  growthByYear: { year: number; count: number }[];
  passages: number;
  scheduled: number;
};

export async function getStats(): Promise<StatsResponse> {
  await ensureSeeded();

  const [assetCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(assets);
  const [expeditionCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(expeditions);
  const [passageCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(passages);
  const [scheduleCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(scheduleItems);

  const byKind = await db
    .select({ kind: assets.kind, count: sql<number>`cast(count(*) as int)` })
    .from(assets)
    .groupBy(assets.kind);

  const regions = await db
    .select({ region: expeditions.region, count: sql<number>`cast(count(*) as int)` })
    .from(expeditions)
    .groupBy(expeditions.region);

  const draftsByStatus = await db
    .select({ status: drafts.status, count: sql<number>`cast(count(*) as int)` })
    .from(drafts)
    .groupBy(drafts.status);

  const growthByYear = await db
    .select({ year: assets.year, count: sql<number>`cast(count(*) as int)` })
    .from(assets)
    .groupBy(assets.year)
    .orderBy(asc(assets.year));

  const [grounding] = await db
    .select({ mean: sql<number>`coalesce(avg(${drafts.groundingScore}), 0)` })
    .from(drafts);

  return {
    assets: Number(assetCount.count),
    expeditions: Number(expeditionCount.count),
    passages: Number(passageCount.count),
    scheduled: Number(scheduleCount.count),
    byKind: byKind.map((r) => ({ kind: r.kind, count: Number(r.count) })),
    regions: regions.map((r) => ({ region: r.region, count: Number(r.count) })),
    draftsByStatus: draftsByStatus.map((r) => ({ status: r.status, count: Number(r.count) })),
    meanGrounding: Number(Number(grounding.mean).toFixed(3)),
    growthByYear: growthByYear.map((r) => ({ year: r.year, count: Number(r.count) })),
  };
}
