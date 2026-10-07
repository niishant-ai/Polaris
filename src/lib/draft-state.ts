import type { Role } from "@/lib/store";

export type DraftStatus = "draft" | "in_review" | "approved" | "published" | "rejected";
export type DraftEvent = "submit" | "approve" | "request_changes" | "reject" | "publish";

type Transition = {
  event: DraftEvent;
  from: DraftStatus[];
  to: DraftStatus;
  roles: Role[];
  requiresNote?: boolean;
};

const TRANSITIONS: Transition[] = [
  { event: "submit", from: ["draft", "rejected"], to: "in_review", roles: ["editor", "admin"] },
  { event: "approve", from: ["in_review"], to: "approved", roles: ["editor", "admin"] },
  { event: "request_changes", from: ["in_review", "approved"], to: "draft", roles: ["editor", "admin"] },
  { event: "reject", from: ["in_review", "approved"], to: "rejected", roles: ["editor", "admin"], requiresNote: true },
  { event: "publish", from: ["approved"], to: "published", roles: ["admin"] },
];

export type TransitionResult =
  | { ok: true; status: DraftStatus }
  | { ok: false; code: "unknown_event" | "invalid_transition" | "role_forbidden" | "note_required"; message: string };

export function resolveTransition(
  event: string,
  current: string,
  role: Role,
  note?: string,
): TransitionResult {
  const transition = TRANSITIONS.find((t) => t.event === event);
  if (!transition) {
    return { ok: false, code: "unknown_event", message: `Unknown editorial event "${event}".` };
  }
  if (!transition.roles.includes(role)) {
    return {
      ok: false,
      code: "role_forbidden",
      message: `The ${role} role cannot perform "${event}". Required: ${transition.roles.join(" or ")}.`,
    };
  }
  if (!transition.from.includes(current as DraftStatus)) {
    return {
      ok: false,
      code: "invalid_transition",
      message: `Cannot "${event}" a draft that is currently "${current}".`,
    };
  }
  if (transition.requiresNote && (!note || note.trim().length < 8)) {
    return {
      ok: false,
      code: "note_required",
      message: "A rejection note of at least 8 characters is required so the author can act on it.",
    };
  }
  return { ok: true, status: transition.to };
}

export const DRAFT_EVENTS: DraftEvent[] = ["submit", "approve", "request_changes", "reject", "publish"];
