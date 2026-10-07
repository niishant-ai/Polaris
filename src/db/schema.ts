import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ *
 * POLARIS · SIH26063 · schema
 * See docs/04-architecture.md for the data dictionary.
 * ------------------------------------------------------------------ */

export const expeditions = pgTable(
  "expeditions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    region: text("region").notNull(), // antarctic | arctic | southern-ocean | himalaya
    station: text("station").notNull(),
    season: text("season").notNull(),
    startDate: text("start_date").notNull(), // ISO date, kept as text for portability
    endDate: text("end_date").notNull(),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    leadScientist: text("lead_scientist").notNull(),
    institutions: jsonb("institutions").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    summary: text("summary").notNull(),
    heroImage: text("hero_image"),
    tags: jsonb("tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("expeditions_region_idx").on(t.region)],
);

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    publicId: text("public_id").notNull().unique(),
    expeditionId: uuid("expedition_id").references(() => expeditions.id, { onDelete: "set null" }),
    kind: text("kind").notNull(), // report | image | video | dataset
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    mimeType: text("mime_type").notNull(),
    /** bigint: NetCDF archives and 4K video routinely exceed the int4 ceiling. */
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull().default(0),
    fileUrl: text("file_url").notNull().default(""),
    thumbnailUrl: text("thumbnail_url"),
    year: integer("year").notNull(),
    author: text("author").notNull().default("MoES"),
    licence: text("licence").notNull().default("CC-BY-4.0"),
    language: text("language").notNull().default("en"),
    tags: jsonb("tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    pageCount: integer("page_count"),
    durationSeconds: integer("duration_seconds"),
    status: text("status").notNull().default("catalogued"), // processing | catalogued | published
    extractionConfidence: real("extraction_confidence").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("assets_kind_idx").on(t.kind),
    index("assets_year_idx").on(t.year),
    index("assets_expedition_idx").on(t.expeditionId),
  ],
);

export const passages = pgTable(
  "passages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    ordinal: integer("ordinal").notNull(),
    heading: text("heading").notNull(),
    page: integer("page").notNull().default(1),
    text: text("text").notNull(),
  },
  (t) => [index("passages_asset_idx").on(t.assetId)],
);

/** One row per asset (title+tags+summary) and one per passage.
 *  Stored with the pgvector extension (`vector(256)`), enabling
 *  in-database cosine distance search (`<=>`). */
export const assetEmbeddings = pgTable(
  "asset_embeddings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    passageId: uuid("passage_id").references(() => passages.id, { onDelete: "cascade" }),
    model: text("model").notNull().default("polar-hash-256-v1"),
    dim: integer("dim").notNull().default(256),
    vector: vector("vector", { dimensions: 256 }).notNull(),
  },
  (t) => [index("asset_embeddings_asset_idx").on(t.assetId)],
);

export type DraftBlock = {
  id: string;
  type: "paragraph" | "quote" | "stat" | "bullets";
  text: string;
  items?: string[];
  citationIds: string[];
};

export type DraftCitation = {
  id: string;
  label: string;
  passageId: string;
  assetPublicId: string;
  assetTitle: string;
  page: number;
  heading: string;
  snippet: string;
};

export type DraftAuditEntry = {
  at: string;
  actor: string;
  role: string;
  action: string;
  note?: string;
};

export const drafts = pgTable(
  "drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    passageIds: jsonb("passage_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    format: text("format").notNull(), // web | social | explainer | newsletter
    audience: text("audience").notNull(), // public | student | researcher
    headline: text("headline").notNull(),
    dek: text("dek").notNull().default(""),
    blocks: jsonb("blocks").$type<DraftBlock[]>().notNull().default(sql`'[]'::jsonb`),
    citations: jsonb("citations").$type<DraftCitation[]>().notNull().default(sql`'[]'::jsonb`),
    hashtags: jsonb("hashtags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    groundingScore: real("grounding_score").notNull().default(1),
    sourceExcerpt: text("source_excerpt").notNull().default(""),
    adapter: text("adapter").notNull().default("mock"),
    status: text("status").notNull().default("draft"), // draft | in_review | approved | published | rejected
    createdBy: text("created_by").notNull().default("Vikram Mehta"),
    createdByRole: text("created_by_role").notNull().default("editor"),
    audit: jsonb("audit").$type<DraftAuditEntry[]>().notNull().default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("drafts_status_idx").on(t.status)],
);

export const scheduleItems = pgTable(
  "schedule_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    draftId: uuid("draft_id")
      .notNull()
      .references(() => drafts.id, { onDelete: "cascade" }),
    channel: text("channel").notNull(), // website | x | instagram | linkedin | newsletter | youtube
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("planned"),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("schedule_items_date_idx").on(t.scheduledFor)],
);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actor: text("actor").notNull(),
    role: text("role").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull().default(""),
    entityLabel: text("entity_label").notNull().default(""),
    meta: jsonb("meta").$type<Record<string, string | number>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("activities_created_idx").on(t.createdAt)],
);

export type Expedition = typeof expeditions.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Passage = typeof passages.$inferSelect;
export type Draft = typeof drafts.$inferSelect;
export type ScheduleItem = typeof scheduleItems.$inferSelect;
export type Activity = typeof activities.$inferSelect;
