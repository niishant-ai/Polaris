import type { Metadata } from "next";

import { IngestConsole } from "@/components/ingest/ingest-console";
import { Reveal } from "@/components/motion-kit";
import { getExpeditions } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ingest & catalogue",
  description:
    "Drag-and-drop ingestion with automatic metadata extraction for polar science reports, imagery, video and datasets.",
};

export default async function IngestPage() {
  const expeditions = await getExpeditions();

  return (
    <div className="pb-24">
      <section className="border-b border-line bg-surface/50 section-pad">
        <div className="container-polaris">
          <Reveal>
            <p className="label-micro">Ingestion &amp; cataloguing</p>
            <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.25rem)] leading-[1.02] text-ink">
              Put it in the repository
            </h1>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-2">
              Drop anything in. POLARIS reads the file, proposes a title, matches an expedition, infers
              tags from the polar taxonomy and shows you a confidence score — then commits it to Postgres
              with passages chunked and embeddings computed.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="container-polaris section-pad pt-10">
        <IngestConsole expeditions={expeditions} />
      </div>
    </div>
  );
}
