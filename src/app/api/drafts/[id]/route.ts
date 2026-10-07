import { eq } from "drizzle-orm";

import { db } from "@/db";
import { drafts, type DraftAuditEntry } from "@/db/schema";
import { fail, ok, readJson } from "@/lib/api";
import { getDraftById, logActivity } from "@/lib/repositories";
import { getActingRole } from "@/lib/role";
import { resolveTransition } from "@/lib/draft-state";

export const dynamic = "force-dynamic";

type PatchBody = {
  event?: string;
  note?: string;
  headline?: string;
  channel?: string;
  scheduledFor?: string;
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = await getActingRole();
  const body = await readJson<PatchBody>(request);
  if (!body?.event) return fail("bad_request", "An editorial event is required.", 400);

  const current = await getDraftById(id);
  if (!current) return fail("not_found", "No such draft.", 404);

  const result = resolveTransition(body.event, current.status, role, body.note);
  if (!result.ok) return fail(result.code, result.message, result.code === "role_forbidden" ? 403 : 422);

  const audit: DraftAuditEntry[] = [
    ...current.audit,
    {
      at: new Date().toISOString(),
      actor: role === "admin" ? "S. Krishnan" : "Vikram Mehta",
      role,
      action: body.event.replace("_", " "),
      note: body.note,
    },
  ];

  await db
    .update(drafts)
    .set({
      status: result.status,
      audit,
      ...(body.headline ? { headline: body.headline } : {}),
      updatedAt: new Date(),
    })
    .where(eq(drafts.id, id));

  if (result.status === "published") {
    const scheduledFor = body.scheduledFor ?? new Date(Date.now() + 86_400_000).toISOString();
    const { createScheduleItem } = await import("@/lib/repositories");
    await createScheduleItem({
      draftId: id,
      channel: body.channel ?? "website",
      scheduledFor,
      note: "Auto-scheduled on publish",
    }).catch(() => null);
  }

  await logActivity({
    actor: role === "admin" ? "S. Krishnan" : "Vikram Mehta",
    role,
    action: `${body.event.replace("_", " ")} draft`,
    entityType: "draft",
    entityId: id,
    entityLabel: current.headline,
  });

  const updated = await getDraftById(id);
  return ok({ draft: updated });
}
