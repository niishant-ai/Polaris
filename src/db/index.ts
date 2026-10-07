import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __polarisPool?: Pool;
  __polarisDb?: NodePgDatabase;
};

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  return new Pool({ connectionString: databaseUrl });
}

export function getPool(): Pool {
  globalForDb.__polarisPool ??= createPool();
  return globalForDb.__polarisPool;
}

export function getDb(): NodePgDatabase {
  globalForDb.__polarisDb ??= drizzle(getPool());
  return globalForDb.__polarisDb;
}

// Lazy proxies so that importing this module never throws at build time
// (Next.js collects page data by importing route modules); the connection
// is only created on first actual query.
export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    return Reflect.get(getPool() as object, prop, receiver);
  },
});

export const db = new Proxy({} as NodePgDatabase, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});
