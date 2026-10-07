import { sql } from "drizzle-orm";

import { db } from "@/db";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return ok({ status: "ok", db: "up", service: "polaris", time: new Date().toISOString() });
  } catch {
    return ok({ status: "degraded", db: "down", service: "polaris", time: new Date().toISOString() });
  }
}
