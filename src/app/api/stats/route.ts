import { ok } from "@/lib/api";
import { getStats, listActivity } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  const [stats, activity] = await Promise.all([getStats(), listActivity(10)]);
  return ok({ stats, activity });
}
