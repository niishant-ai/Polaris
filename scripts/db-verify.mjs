/**
 * POLARIS database verification.
 * Confirms the schema is present, reports row counts, and proves that
 * pgvector cosine search executes. Read-only. Never prints the URL.
 */
import "dotenv/config";
import pg from "pg";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("[verify] DATABASE_URL is not set.");
  process.exit(1);
}

const TABLES = [
  "expeditions",
  "assets",
  "passages",
  "asset_embeddings",
  "drafts",
  "schedule_items",
  "activities",
];

const client = new pg.Client({
  connectionString: url,
  ssl: url.includes("localhost") || url.includes("127.0.0.1") ? undefined : { rejectUnauthorized: false },
});

try {
  await client.connect();

  const { rows: present } = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public'",
  );
  const names = new Set(present.map((r) => r.table_name));
  console.log("[verify] tables:");
  for (const table of TABLES) {
    if (!names.has(table)) {
      console.log(`  MISSING  ${table}`);
      continue;
    }
    const { rows } = await client.query(`select count(*)::int as n from "${table}"`);
    console.log(`  ok       ${table} (${rows[0].n} rows)`);
  }

  const { rows: col } = await client.query(
    "select data_type, udt_name from information_schema.columns where table_name = 'asset_embeddings' and column_name = 'vector'",
  );
  console.log(`[verify] asset_embeddings.vector -> ${col[0]?.udt_name ?? "(absent)"}`);

  const { rows: probe } = await client.query(
    `select count(*)::int as n from asset_embeddings
     where vector <=> (select vector from asset_embeddings limit 1) = 0`,
  );
  console.log(`[verify] pgvector cosine query executed; exact self-matches: ${probe[0].n}`);
} catch (error) {
  console.error("[verify] failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
