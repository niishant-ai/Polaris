import { ok } from "@/lib/api";
import { listActivity } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 12) || 12, 50);
  return ok({ activity: await listActivity(limit) });
}
