import Link from "next/link";

import {
  CitationShowcase,
  ClosingCta,
  FeatureGrid,
  Hero,
  PipelineSequence,
  type LandingStats,
} from "@/components/landing";
import { Badge } from "@/components/ui/primitives";
import { getStats, listAssets } from "@/lib/repositories";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [stats, recent] = await Promise.all([
    getStats(),
    listAssets({ kinds: ["report"], limit: 3 }),
  ]);

  const byKind = new Map(stats.byKind.map((entry) => [entry.kind, entry.count]));
  const landingStats: LandingStats = {
    assets: stats.assets,
    reports: byKind.get("report") ?? 0,
    images: byKind.get("image") ?? 0,
    videos: byKind.get("video") ?? 0,
    datasets: byKind.get("dataset") ?? 0,
    expeditions: stats.expeditions,
    passages: stats.passages,
  };

  return (
    <>
      <Hero stats={landingStats} />
      <PipelineSequence />
      <CitationShowcase />
      <FeatureGrid />

      <section className="section-pad-lg">
        <div className="container-polaris">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-micro">Recently catalogued</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.6vw,2rem)] leading-tight text-ink">
                Straight from the repository
              </h2>
            </div>
            <Link
              href="/archive"
              className="text-[0.875rem] font-semibold text-brand transition-colors hover:brightness-110"
            >
              Browse all {landingStats.assets} assets →
            </Link>
          </div>

          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {recent.map((asset) => (
              <li key={asset.id}>
                <Link
                  href={`/archive/${asset.publicId}`}
                  className="card-lift flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-1)]"
                >
                  <div className="flex items-center gap-2">
                    <Badge tone="brand">{asset.expeditionCode ?? "Unassigned"}</Badge>
                    <Badge>{asset.year}</Badge>
                  </div>
                  <h3 className="mt-4 text-[1.0625rem] leading-snug text-ink">{asset.title}</h3>
                  <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-ink-2">
                    {asset.description}
                  </p>
                  <p className="mt-5 text-[0.6875rem] text-ink-3">
                    {asset.author} · {formatDate(asset.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
