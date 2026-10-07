import { fail, ok, readJson } from "@/lib/api";
import { listSchedule, updateScheduleItem } from "@/lib/repositories";
import { getActingRole } from "@/lib/role";

export const dynamic = "force-dynamic";

type PutBody = { scheduledFor?: string; channel?: string; note?: string; status?: string };

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = await getActingRole();
  if (role === "public") return fail("role_forbidden", "Rescheduling requires Editor or Admin.", 403);

  const body = await readJson<PutBody>(request);
  if (!body) return fail("bad_request", "A JSON body is required.", 400);
  if (body.scheduledFor && Number.isNaN(Date.parse(body.scheduledFor))) {
    return fail("bad_request", "scheduledFor must be an ISO date string.", 400);
  }

  const updated = await updateScheduleItem(id, body);
  if (!updated) return fail("not_found", "No such scheduled item.", 404);
  return ok({ item: updated, items: await listSchedule() });
}
