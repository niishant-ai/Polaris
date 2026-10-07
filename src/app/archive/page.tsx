import type { Metadata } from "next";

import { ArchiveHeaderStat, SearchConsole } from "@/components/archive/search-console";
import { Reveal } from "@/components/motion-kit";
import { getExpeditions, listAssets } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Archive & search",
  description:
    "Search India's polar science repository by keyword and by meaning, with multimodal filters, a timeline and a polar expedition map.",
};

export default async function ArchivePage() {
  const [assets, expeditions] = await Promise.all([listAssets(), getExpeditions()]);

  return (
    <div className="pb-24">
      <section className="relative overflow-hidden border-b border-line bg-surface/50 section-pad">
        <div className="container-polaris relative">
          <Reveal>
            <p className="label-micro">Knowledge repository</p>
            <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.25rem)] leading-[1.02] text-ink">
              Search the polar archive
            </h1>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-2">
              Reports, imagery, video and datasets from 22 Indian expeditions across the Antarctic, the
              Arctic, the Southern Ocean and the Himalaya. Hybrid mode fuses field-weighted keyword scoring
              with 256-dimensional vector similarity, so you can ask a question instead of guessing a
              filename.
            </p>
            <div className="mt-6">
              <ArchiveHeaderStat assets={assets.length} expeditions={expeditions.length} />
            </div>
          </Reveal>
        </div>
      </section>

      <div className="container-polaris section-pad pt-10">
        <SearchConsole initialAssets={assets} expeditions={expeditions} />
      </div>
    </div>
  );
}
