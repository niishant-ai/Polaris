import type { Metadata } from "next";

import { ScheduleCalendar } from "@/components/calendar/schedule-calendar";
import { Reveal } from "@/components/motion-kit";
import { listDrafts, listSchedule } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Publication calendar",
  description:
    "Channel-aware publication calendar with drag-to-reschedule, keyboard alternatives and channel conflict detection.",
};

export default async function CalendarPage() {
  const [items, drafts] = await Promise.all([listSchedule(), listDrafts()]);
  const scheduledDraftIds = new Set(items.map((item) => item.draftId));
  const approved = drafts.filter((draft) => draft.status === "approved" && !scheduledDraftIds.has(draft.id));

  return (
    <div className="pb-24">
      <section className="border-b border-line bg-surface/50 section-pad">
        <div className="container-polaris">
          <Reveal>
            <p className="label-micro">Media dissemination</p>
            <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.25rem)] leading-[1.02] text-ink">
              Plan the noise, not the science
            </h1>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-2">
              Approved drafts become channel items. Drag them between days to reschedule, or use the
              keyboard buttons — both write through to the database. Days carrying more than three posts on
              a single channel are flagged.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="container-polaris section-pad pt-10">
        <ScheduleCalendar initialItems={items} approvedDrafts={approved} />
      </div>
    </div>
  );
}
