import { fail, ok, readJson } from "@/lib/api";
import { createScheduleItem, listSchedule } from "@/lib/repositories";
import { getActingRole } from "@/lib/role";

export const dynamic = "force-dynamic";

const VALID_CHANNELS = new Set(["website", "x", "instagram", "linkedin", "newsletter", "youtube"]);

export async function GET() {
  return ok({ items: await listSchedule() });
}

type CreateBody = { draftId?: string; channel?: string; scheduledFor?: string; note?: string };

export async function POST(request: Request) {
  const role = await getActingRole();
  if (role === "public") return fail("role_forbidden", "Scheduling requires Editor or Admin.", 403);

  const body = await readJson<CreateBody>(request);
  if (!body?.draftId || !body.scheduledFor) {
    return fail("bad_request", "draftId and scheduledFor are required.", 400);
  }
  if (Number.isNaN(Date.parse(body.scheduledFor))) {
    return fail("bad_request", "scheduledFor must be an ISO date string.", 400);
  }
  if (body.channel && !VALID_CHANNELS.has(body.channel)) {
    return fail("bad_request", `channel must be one of ${[...VALID_CHANNELS].join(", ")}.`, 400);
  }

  const item = await createScheduleItem({
    draftId: body.draftId,
    channel: body.channel ?? "website",
    scheduledFor: body.scheduledFor,
    note: body.note,
  });
  return ok({ item }, { status: 201 });
}
