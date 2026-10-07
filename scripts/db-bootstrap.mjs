/**
 * POLARIS database bootstrap.
 * Enables the Postgres extensions the schema depends on before drizzle-kit
 * syncs tables. Safe to re-run (idempotent). Never prints the connection URL.
 */
import "dotenv/config";
import pg from "pg";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("[bootstrap] DATABASE_URL is not set.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  ssl: url.includes("localhost") || url.includes("127.0.0.1") ? undefined : { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query("create extension if not exists vector");
  await client.query("create extension if not exists pg_trgm");
  const { rows } = await client.query(
    "select extname, extversion from pg_extension where extname in ('vector','pg_trgm') order by extname",
  );
  console.log("[bootstrap] extensions ready:", rows.map((r) => `${r.extname}@${r.extversion}`).join(", "));
} catch (error) {
  console.error("[bootstrap] failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
