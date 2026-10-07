import type { Metadata } from "next";
import Link from "next/link";

import { Reveal, Stagger, StaggerItem } from "@/components/motion-kit";
import { Badge, Stat } from "@/components/ui/primitives";
import { getStats, listActivity, listDrafts } from "@/lib/repositories";
import { cn, KINDS, REGIONS, relativeTime, statusLabel, statusTone } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Archive statistics, pending editorial load, grounding quality and a full activity trail for the POLARIS repository.",
};

function GrowthChart({ data }: { data: { year: number; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <figure className="rounded-2xl border border-line bg-surface p-5">
      <figcaption className="label-micro">Archive growth by year</figcaption>
      <div className="mt-5 flex h-40 items-end gap-1.5">
        {data.map((point) => (
          <div key={point.year} className="group flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[0.5625rem] text-ink-3 opacity-0 transition-opacity group-hover:opacity-100 tnum">
              {point.count}
            </span>
            <div
              className="w-full rounded-t bg-gradient-to-t from-brand/45 to-brand transition-all"
              style={{ height: `${Math.max(4, (point.count / max) * 100)}%` }}
            />
            <span className="font-[family-name:var(--font-mono)] text-[0.5625rem] text-ink-3 tnum">
              {`’${String(point.year).slice(2)}`}
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}

export default async function DashboardPage() {
  const [stats, activity, drafts] = await Promise.all([getStats(), listActivity(12), listDrafts()]);
  const byKind = new Map(stats.byKind.map((entry) => [entry.kind, entry.count]));
  const byRegion = new Map(stats.regions.map((entry) => [entry.region, entry.count]));
  const pending = drafts.filter((draft) => draft.status === "in_review").slice(0, 5);
  const statusCounts = new Map(stats.draftsByStatus.map((entry) => [entry.status, entry.count]));

  return (
    <div className="pb-24">
      <section className="border-b border-line bg-surface/50 section-pad">
        <div className="container-polaris">
          <Reveal>
            <p className="label-micro">Archive intelligence</p>
            <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.25rem)] leading-[1.02] text-ink">
              The state of the repository
            </h1>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-2">
              One screen for the programme officer: what is archived, what is waiting on a human, how well
              the citation lock is holding, and who did what.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="container-polaris space-y-10 section-pad pt-10">
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Stat label="Assets catalogued" value={stats.assets} hint={`${stats.passages} citable passages`} />
          </StaggerItem>
          <StaggerItem>
            <Stat label="Expeditions" value={stats.expeditions} hint="Antarctic · Arctic · Southern Ocean · Himalaya" />
          </StaggerItem>
          <StaggerItem>
            <Stat
              label="Awaiting review"
              value={statusCounts.get("in_review") ?? 0}
              hint={`${statusCounts.get("approved") ?? 0} approved · ${statusCounts.get("published") ?? 0} published`}
              tone="aurora"
            />
          </StaggerItem>
          <StaggerItem>
            <Stat
              label="Mean grounding score"
              value={stats.meanGrounding.toFixed(2)}
              hint="1.00 = every block cited and verified"
              tone={stats.meanGrounding >= 0.8 ? "aurora" : "danger"}
            />
          </StaggerItem>
        </Stagger>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <GrowthChart data={stats.growthByYear} />

            <section className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[1.0625rem] text-ink">Composition of the archive</h2>
                <Link href="/archive" className="text-[0.75rem] font-semibold text-brand hover:brightness-110">
                  Open archive →
                </Link>
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {KINDS.map((kind) => {
                  const count = byKind.get(kind.id) ?? 0;
                  const pct = Math.round((count / Math.max(1, stats.assets)) * 100);
                  return (
                    <li key={kind.id} className="rounded-xl border border-line bg-surface-2 p-3">
                      <div className="flex items-center justify-between text-[0.8125rem]">
                        <span className="font-medium text-ink">{kind.label}</span>
                        <span className="tnum text-ink-3">{count}</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
                        <div className="h-full rounded-full bg-aurora" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <ul className="mt-4 flex flex-wrap gap-2">
                {REGIONS.map((region) => (
                  <li key={region.id}>
                    <Badge tone="ice">
                      {region.label} · {byRegion.get(region.id) ?? 0} expeditions
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[1.0625rem] text-ink">Pending reviews</h2>
                <Link href="/review" className="text-[0.75rem] font-semibold text-brand hover:brightness-110">
                  Open queue →
                </Link>
              </div>
              {pending.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-line bg-surface-2 p-4 text-[0.8125rem] text-ink-3">
                  Queue is clear. Nothing is waiting on a human decision.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {pending.map((draft) => (
                    <li key={draft.id} className="rounded-xl border border-line bg-surface-2 p-3">
                      <div className="flex items-center gap-2">
                        <Badge tone={statusTone(draft.status)}>{statusLabel(draft.status)}</Badge>
                        <Badge>{draft.audience}</Badge>
                      </div>
                      <Link
                        href="/review"
                        className="mt-2 block text-[0.875rem] font-medium leading-snug text-ink hover:text-brand"
                      >
                        {draft.headline}
                      </Link>
                      <p className="mt-1 text-[0.6875rem] text-ink-3">
                        {draft.createdBy} · grounding {draft.groundingScore.toFixed(2)} ·{" "}
                        {relativeTime(draft.updatedAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-[1.0625rem] text-ink">Recent activity</h2>
              <ol className="mt-4 space-y-3">
                {activity.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <span
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        entry.role === "admin" ? "bg-aurora" : "bg-brand",
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-[0.8125rem] leading-snug text-ink-2">
                        <span className="font-semibold text-ink">{entry.actor}</span> {entry.action}
                      </p>
                      <p className="truncate text-[0.6875rem] text-ink-3">{entry.entityLabel}</p>
                    </div>
                    <span className="ml-auto shrink-0 text-[0.625rem] text-ink-3 tnum">
                      {relativeTime(entry.createdAt)}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-[1.0625rem] text-ink">Editorial funnel</h2>
              <ul className="mt-4 space-y-2.5">
                {["draft", "in_review", "approved", "published", "rejected"].map((status) => {
                  const count = statusCounts.get(status) ?? 0;
                  const total = Math.max(1, drafts.length);
                  return (
                    <li key={status}>
                      <div className="flex items-center justify-between text-[0.75rem]">
                        <span className="text-ink-2">{statusLabel(status)}</span>
                        <span className="tnum text-ink-3">{count}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            status === "rejected"
                              ? "bg-danger"
                              : status === "published"
                                ? "bg-aurora"
                                : "bg-brand",
                          )}
                          style={{ width: `${(count / total) * 100}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-[0.6875rem] text-ink-3">
                {stats.scheduled} items on the publication calendar.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
