import type { Metadata } from "next";

import { Reveal } from "@/components/motion-kit";
import { ReviewQueue } from "@/components/review/review-queue";
import { listDrafts } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editorial review",
  description:
    "Role-gated editorial review queue: draft, in review, approved, published and rejected, with citations and a full audit trail.",
};

export default async function ReviewPage() {
  const drafts = await listDrafts();

  return (
    <div className="pb-24">
      <section className="border-b border-line bg-surface/50 section-pad">
        <div className="container-polaris">
          <Reveal>
            <p className="label-micro">Editorial workflow</p>
            <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.25rem)] leading-[1.02] text-ink">
              Nothing reaches the public unverified
            </h1>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-2">
              Every draft arrives with its source passage and citation chips. Editors approve or reject with
              a note; only admins publish. Each transition is written to an append-only audit trail, and the
              state machine rejects illegal moves server-side.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="container-polaris section-pad pt-10">
        <ReviewQueue initialDrafts={drafts} />
      </div>
    </div>
  );
}
