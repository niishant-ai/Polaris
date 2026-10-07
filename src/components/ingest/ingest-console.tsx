"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Film,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Table2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiFetch } from "@/lib/client-api";
import { extractMetadata, isAccepted, type ExtractionCandidate } from "@/lib/extract";
import type { AssetSummary, ExpeditionSummary } from "@/lib/repositories";
import { canGenerate, usePolarStore } from "@/lib/store";
import { Badge, Button, EmptyState } from "@/components/ui/primitives";
import { cn, formatBytes } from "@/lib/utils";

type Stage = "queued" | "uploading" | "extracting" | "ready" | "committing" | "catalogued" | "rejected";

type IngestFile = {
  key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sampleText: string;
  stage: Stage;
  progress: number;
  error?: string;
  publicId?: string;
  extraction: ExtractionCandidate | null;
  expeditionSlug: string;
  author: string;
  licence: string;
};

const SAMPLE_FILES: { filename: string; mimeType: string; sizeBytes: number; sampleText: string }[] = [
  {
    filename: "43rd_IAE_apres_survey_final.pdf",
    mimeType: "application/pdf",
    sizeBytes: 8_420_000,
    sampleText:
      "Eleven autonomous phase-sensitive radar systems were recovered from the Ingrid Christensen Coast during the 43rd Indian Antarctic Expedition. Mean surface lowering of 1.4 metres of water equivalent was recorded across the traverse, with the strongest signal at the grounding zone of the largest outlet glacier. Ice thickness changes are compared against the 2015–2019 baseline and reconciled with satellite altimetry.",
  },
  {
    filename: "maitri_black_carbon_winter_2024.csv",
    mimeType: "text/csv",
    sizeBytes: 412_000,
    sampleText:
      "Aethalometer record for Maitri station, austral winter 2024, with hourly black carbon concentration in nanograms per cubic metre and coincident wind direction.",
  },
  {
    filename: "kronebreen_stake_farm_photos.zip",
    mimeType: "application/zip",
    sizeBytes: 128_400_000,
    sampleText: "Stake farm photography from Kongsvegen glacier, spring 2022, Svalbard Arctic campaign.",
  },
];

const KIND_ICON: Record<string, typeof FileText> = {
  report: FileText,
  image: ImageIcon,
  video: Film,
  dataset: Table2,
};

export function IngestConsole({ expeditions }: { expeditions: ExpeditionSummary[] }) {
  const role = usePolarStore((s) => s.role);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<IngestFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const client = useQueryClient();

  const addFiles = useCallback(
    (
      incoming: {
        name: string;
        type: string;
        size: number;
        sampleText?: string;
      }[],
    ) => {
      setFiles((current) => {
        const next = [...current];
        for (const file of incoming) {
          const accepted = isAccepted(file.name, file.type);
          const key = `${file.name}-${Math.random().toString(36).slice(2, 7)}`;
          next.push({
            key,
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
            sizeBytes: file.size,
            sampleText: file.sampleText ?? "",
            stage: accepted ? "uploading" : "rejected",
            progress: accepted ? 0 : 0,
            error: accepted ? undefined : `${file.name}: this file type is not accepted by the repository.`,
            extraction: null,
            expeditionSlug: "",
            author: "Dr. Ananya Rao",
            licence: "CC-BY-4.0",
          });
        }
        return next;
      });
    },
    [],
  );

  /* simulated pipeline: uploading → extracting → ready */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setFiles((current) => {
        let changed = false;
        const next = current.map((file) => {
          if (file.stage === "uploading") {
            changed = true;
            const progress = Math.min(100, file.progress + 12 + Math.random() * 16);
            if (progress >= 100) {
              return { ...file, progress: 100, stage: "extracting" as Stage };
            }
            return { ...file, progress };
          }
          if (file.stage === "extracting") {
            changed = true;
            return {
              ...file,
              stage: "ready" as Stage,
              progress: 100,
              extraction: extractMetadata(file.filename, file.mimeType, file.sizeBytes, file.sampleText),
              expeditionSlug:
                extractMetadata(file.filename, file.mimeType, file.sizeBytes, file.sampleText)
                  .suggestedExpeditionCode === null
                  ? ""
                  : (expeditions.find(
                      (expedition) =>
                        expedition.code ===
                        extractMetadata(file.filename, file.mimeType, file.sizeBytes, file.sampleText)
                          .suggestedExpeditionCode,
                    )?.slug ?? ""),
            };
          }
          return file;
        });
        return changed ? next : current;
      });
    }, 260);
    return () => window.clearInterval(timer);
  }, [expeditions]);

  const commit = useMutation({
    mutationFn: async ({ file }: { file: IngestFile }) => {
      const extraction = file.extraction;
      if (!extraction) throw new Error("Metadata has not been extracted yet.");
      const data = await apiFetch<{ asset: AssetSummary }>("/api/assets", {
        method: "POST",
        body: JSON.stringify({
          filename: file.filename,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
          kind: extraction.kind,
          title: extraction.title,
          description: extraction.description,
          expeditionSlug: file.expeditionSlug || null,
          tags: extraction.tags,
          year: extraction.year,
          author: file.author,
          licence: file.licence,
          pageCount: extraction.pageCount,
          durationSeconds: extraction.durationSeconds,
          sampleText: file.sampleText,
        }),
      });
      return data;
    },
    onMutate: ({ file }) => {
      setFiles((current) =>
        current.map((item) => (item.key === file.key ? { ...item, stage: "committing" } : item)),
      );
    },
    onSuccess: ({ asset }, { file }) => {
      setFiles((current) =>
        current.map((item) =>
          item.key === file.key ? { ...item, stage: "catalogued", publicId: asset.publicId } : item,
        ),
      );
      void client.invalidateQueries({ queryKey: ["search"] });
    },
    onError: (error: Error, { file }) => {
      setFiles((current) =>
        current.map((item) =>
          item.key === file.key ? { ...item, stage: "ready", error: error.message } : item,
        ),
      );
    },
  });

  const readyCount = files.filter((f) => f.stage === "ready").length;
  const cataloguedCount = files.filter((f) => f.stage === "catalogued").length;

  return (
    <div className="space-y-6">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(
            Array.from(event.dataTransfer.files).map((file) => ({
              name: file.name,
              type: file.type,
              size: file.size,
            })),
          );
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300",
          dragging
            ? "border-brand bg-brand-soft/50 shadow-[var(--shadow-3)]"
            : "border-line bg-surface hover:border-line-strong",
        )}
      >
        <motion.div
          animate={dragging ? { scale: 1.06, y: -4 } : { scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand"
        >
          <UploadCloud className="size-6" aria-hidden="true" />
        </motion.div>
        <h2 className="mt-5 font-[family-name:var(--font-display)] text-xl text-ink">
          {dragging ? "Drop to ingest" : "Drag reports, images, video or datasets here"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[0.875rem] leading-relaxed text-ink-2">
          PDF, DOCX, TXT · PNG, JPG, WEBP, TIFF · MP4, MOV, WEBM · CSV, XLSX, NetCDF, ZIP. The parser
          extracts title, year, expedition, media kind and tags, then lets you correct anything.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            aria-label="Choose files to ingest"
            onChange={(event) => {
              addFiles(
                Array.from(event.target.files ?? []).map((file) => ({
                  name: file.name,
                  type: file.type,
                  size: file.size,
                })),
              );
              event.target.value = "";
            }}
          />
          <Button variant="primary" onClick={() => inputRef.current?.click()}>
            Browse files
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              addFiles(
                SAMPLE_FILES.map((sample) => ({
                  name: sample.filename,
                  type: sample.mimeType,
                  size: sample.sizeBytes,
                  sampleText: sample.sampleText,
                })),
              )
            }
            icon={<Sparkles className="size-4" aria-hidden="true" />}
          >
            Load three sample files
          </Button>
        </div>
        {!canGenerate(role) ? (
          <p className="mt-4 text-[0.75rem] text-warn">
            You are browsing as a public visitor. Switch to the Editor role to commit files to the
            repository.
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <p aria-live="polite" className="text-[0.75rem] text-ink-3">
          {files.length === 0
            ? "No files in this batch"
            : `${files.length} in batch · ${readyCount} ready · ${cataloguedCount} catalogued`}
        </p>
        {files.length > 0 ? (
          <Button variant="ghost" onClick={() => setFiles([])} icon={<Trash2 className="size-4" aria-hidden="true" />}>
            Clear batch
          </Button>
        ) : null}
      </div>

      {files.length === 0 ? (
        <EmptyState
          icon={<UploadCloud className="size-5" aria-hidden="true" />}
          title="Nothing queued yet"
          description="Drop a file above, browse for one, or load the three sample files to see automatic metadata extraction and catalogue commit working end to end."
        />
      ) : (
        <ul className="space-y-4">
          <AnimatePresence initial={false}>
            {files.map((file) => {
              const Icon = KIND_ICON[file.extraction?.kind ?? "report"] ?? FileText;
              return (
                <motion.li
                  key={file.key}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-1)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-brand">
                        <Icon className="size-[1.1rem]" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[0.9375rem] font-semibold text-ink">{file.filename}</p>
                        <p className="mt-0.5 text-[0.75rem] text-ink-3 tnum">
                          {formatBytes(file.sizeBytes)} · {file.mimeType}
                        </p>
                      </div>
                    </div>
                    <StageBadge stage={file.stage} />
                  </div>

                  {(file.stage === "uploading" || file.stage === "extracting") && (
                    <div className="mt-4">
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                        <motion.div
                          className="h-full rounded-full bg-brand"
                          animate={{ width: `${file.stage === "extracting" ? 100 : file.progress}%` }}
                          transition={{ duration: 0.25 }}
                        />
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-[0.6875rem] text-ink-3">
                        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                        {file.stage === "uploading"
                          ? `Uploading ${Math.round(file.progress)}%`
                          : "Extracting metadata…"}
                      </p>
                    </div>
                  )}

                  {file.error ? (
                    <p className="mt-4 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-[0.8125rem] text-danger" role="alert">
                      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                      {file.error}
                    </p>
                  ) : null}

                  {file.extraction && (file.stage === "ready" || file.stage === "committing" || file.stage === "catalogued") ? (
                    <div className="mt-5 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="brand">{file.extraction.kind}</Badge>
                        <Badge tone="aurora">
                          {`Extraction confidence ${Math.round(file.extraction.confidence * 100)}%`}
                        </Badge>
                        <Badge>{`Year ${file.extraction.year}`}</Badge>
                        {file.extraction.pageCount ? <Badge>{`${file.extraction.pageCount} pages`}</Badge> : null}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor={`title-${file.key}`} className="label-micro">
                            Title
                          </label>
                          <input
                            id={`title-${file.key}`}
                            value={file.extraction.title}
                            onChange={(event) =>
                              setFiles((current) =>
                                current.map((item) =>
                                  item.key === file.key
                                    ? { ...item, extraction: { ...item.extraction!, title: event.target.value } }
                                    : item,
                                ),
                              )
                            }
                            className="mt-1.5 h-10 w-full rounded-lg border border-line bg-bg px-3 text-[0.875rem] text-ink outline-none focus:border-brand"
                          />
                        </div>
                        <div>
                          <label htmlFor={`expedition-${file.key}`} className="label-micro">
                            Expedition
                          </label>
                          <select
                            id={`expedition-${file.key}`}
                            value={file.expeditionSlug}
                            onChange={(event) =>
                              setFiles((current) =>
                                current.map((item) =>
                                  item.key === file.key ? { ...item, expeditionSlug: event.target.value } : item,
                                ),
                              )
                            }
                            className="mt-1.5 h-10 w-full rounded-lg border border-line bg-bg px-2.5 text-[0.875rem] text-ink outline-none focus:border-brand"
                          >
                            <option value="">Unassigned</option>
                            {expeditions.map((expedition) => (
                              <option key={expedition.slug} value={expedition.slug}>
                                {expedition.code} — {expedition.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <p className="label-micro">Inferred tags</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {file.extraction.tags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() =>
                                setFiles((current) =>
                                  current.map((item) =>
                                    item.key === file.key
                                      ? {
                                          ...item,
                                          extraction: {
                                            ...item.extraction!,
                                            tags: item.extraction!.tags.filter((t) => t !== tag),
                                          },
                                        }
                                      : item,
                                  ),
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[0.6875rem] font-medium text-ink-2 hover:border-danger hover:text-danger"
                              aria-label={`Remove tag ${tag}`}
                            >
                              {tag}
                              <span aria-hidden="true">×</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {file.stage === "catalogued" && file.publicId ? (
                        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[color-mix(in_oklab,var(--aurora)_35%,var(--line))] bg-aurora-soft p-3">
                          <CheckCircle2 className="size-4 text-aurora" aria-hidden="true" />
                          <p className="text-[0.8125rem] font-medium text-ink">
                            Catalogued and searchable.
                          </p>
                          <Link
                            href={`/archive/${file.publicId}`}
                            className="ml-auto text-[0.8125rem] font-semibold text-aurora underline decoration-dotted"
                          >
                            Open asset →
                          </Link>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="primary"
                            loading={file.stage === "committing"}
                            disabled={!canGenerate(role)}
                            onClick={() => commit.mutate({ file })}
                          >
                            Commit to archive
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() =>
                              setFiles((current) => current.filter((item) => item.key !== file.key))
                            }
                          >
                            Discard
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function StageBadge({ stage }: { stage: Stage }) {
  switch (stage) {
    case "uploading":
      return <Badge tone="ice">Uploading</Badge>;
    case "extracting":
      return <Badge tone="warn">Extracting</Badge>;
    case "ready":
      return <Badge tone="brand">Ready to commit</Badge>;
    case "committing":
      return <Badge tone="warn">Committing</Badge>;
    case "catalogued":
      return <Badge tone="aurora">Catalogued</Badge>;
    case "rejected":
      return <Badge tone="danger">Rejected</Badge>;
    default:
      return <Badge>Queued</Badge>;
  }
}
