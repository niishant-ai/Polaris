import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DocumentViewer } from "@/components/archive/document-viewer";
import { Badge } from "@/components/ui/primitives";
import { getAssetDetail } from "@/lib/repositories";
import { formatBytes } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const detail = await getAssetDetail(publicId);
  if (!detail) return { title: "Asset not found" };
  return { title: detail.asset.title, description: detail.asset.description };
}

export default async function AssetPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const detail = await getAssetDetail(publicId);
  if (!detail) notFound();

  const { asset, passages, related } = detail;

  return (
    <div className="pb-24">
      <div className="container-polaris pt-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[0.75rem] text-ink-3">
          <Link href="/archive" className="transition-colors hover:text-brand">
            Archive
          </Link>
          <span aria-hidden="true">/</span>
          {asset.expeditionSlug ? (
            <>
              <Link href="/archive" className="transition-colors hover:text-brand">
                {asset.expeditionName}
              </Link>
              <span aria-hidden="true">/</span>
            </>
          ) : null}
          <span className="text-ink-2">{asset.title}</span>
        </nav>
      </div>

      <header className="container-polaris pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{asset.kind}</Badge>
          {asset.expeditionCode ? <Badge tone="ice">{asset.expeditionCode}</Badge> : null}
          <Badge>{asset.year}</Badge>
          <Badge tone="aurora">{asset.licence}</Badge>
        </div>
        <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.06] text-ink">
          {asset.title}
        </h1>
        <p className="mt-4 max-w-3xl text-[1.0625rem] leading-relaxed text-ink-2">{asset.description}</p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[0.75rem] text-ink-3">
          <div>
            <dt className="label-micro">Author</dt>
            <dd className="mt-1 text-ink-2">{asset.author}</dd>
          </div>
          <div>
            <dt className="label-micro">Size</dt>
            <dd className="mt-1 text-ink-2">{formatBytes(asset.sizeBytes)}</dd>
          </div>
          {asset.pageCount ? (
            <div>
              <dt className="label-micro">Pages</dt>
              <dd className="mt-1 text-ink-2">{asset.pageCount}</dd>
            </div>
          ) : null}
          {asset.durationSeconds ? (
            <div>
              <dt className="label-micro">Duration</dt>
              <dd className="mt-1 text-ink-2">{Math.round(asset.durationSeconds / 60)} min</dd>
            </div>
          ) : null}
          <div>
            <dt className="label-micro">Tags</dt>
            <dd className="mt-1 text-ink-2">{asset.tags.join(" · ")}</dd>
          </div>
        </dl>
      </header>

      <DocumentViewer asset={asset} passages={passages} related={related} />
    </div>
  );
}
