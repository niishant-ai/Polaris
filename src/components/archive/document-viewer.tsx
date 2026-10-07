"use client";

import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Copy,
  FileDown,
  Quote,
  Sparkles,
  TextSelect,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { polarToast } from "@/components/chrome";
import { apiFetch } from "@/lib/client-api";
import type { GeneratedDraft, GenerationAudience, GenerationFormat } from "@/lib/generate";
import type { AssetSummary, PassageSummary } from "@/lib/repositories";
import { canGenerate, usePolarStore } from "@/lib/store";
import { Badge, Button, ScoreBar } from "@/components/ui/primitives";
import { AUDIENCE_LABELS, FORMAT_LABELS } from "@/lib/generate";
import { cn, formatBytes, statusLabel } from "@/lib/utils";

type GenerateResponse = {
  draft: GeneratedDraft;
  asset: { id: string; publicId: string; title: string };
  passage: { id: string; heading: string; page: number; text: string };
};

/* ------------------------------- reading pane ------------------------------- */

function Passage({
  passage,
  index,
  onPick,
  active,
}: {
  passage: PassageSummary;
  index: number;
  onPick: (passage: PassageSummary) => void;
  active: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  return (
    <article
      ref={ref}
      id={`passage-${passage.id}`}
      data-passage-id={passage.id}
      className={cn(
        "group relative scroll-mt-28 rounded-2xl border p-5 transition-colors sm:p-6",
        active ? "border-brand bg-brand-soft/40" : "border-line bg-surface hover:border-line-strong",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[0.9375rem] font-semibold tracking-tight text-ink">
          <span className="mr-2 font-[family-name:var(--font-mono)] text-[0.6875rem] text-ink-3 tnum">
            §{index + 1}
          </span>
          {passage.heading}
        </h3>
        <div className="flex items-center gap-2">
          <Badge>{`p. ${passage.page}`}</Badge>
          <button
            type="button"
            onClick={() => onPick(passage)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[0.6875rem] font-semibold text-ink-2 opacity-0 transition-all hover:border-brand hover:text-brand focus-visible:opacity-100 group-hover:opacity-100"
          >
            <TextSelect className="size-3" aria-hidden="true" />
            Select passage
          </button>
        </div>
      </div>
      <p className="mt-4 font-[family-name:var(--font-display)] text-[1.0625rem] leading-[1.72] text-ink-2">
        {passage.text}
      </p>
    </article>
  );
}

/* ------------------------------- studio drawer ------------------------------- */

function StudioPanel({
  passage,
  assetId,
  onClose,
  onCitationClick,
}: {
  passage: PassageSummary;
  assetId: string;
  onClose: () => void;
  onCitationClick: (passageId: string) => void;
}) {
  const role = usePolarStore((s) => s.role);
  const setLastAudience = usePolarStore((s) => s.setLastAudience);
  const [format, setFormat] = useState<GenerationFormat>("social");
  const [audience, setAudience] = useState<GenerationAudience>("public");
  const [headline, setHeadline] = useState("");
  const [draft, setDraft] = useState<GeneratedDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = useMutation({
    mutationFn: async () => {
      const data = await apiFetch<GenerateResponse>("/api/generate", {
        method: "POST",
        body: JSON.stringify({ passageId: passage.id, format, audience }),
      });
      return data;
    },
    onSuccess: (data) => {
      setDraft(data.draft);
      setHeadline(data.draft.headline);
      setMessage(null);
      polarToast(
        "Draft generated",
        `${data.draft.blocks.length} blocks · grounding ${data.draft.groundingScore.toFixed(2)} · ${data.draft.blocks.length - data.draft.unsupported.length} fully cited`,
      );
    },
    onError: (error: Error) => setMessage(error.message),
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error("Generate a draft first");
      const data = await apiFetch<{ draft: { id: string; status: string } }>("/api/drafts", {
        method: "POST",
        body: JSON.stringify({
          assetId,
          passageIds: [passage.id],
          format,
          audience,
          headline,
          dek: draft.dek,
          blocks: draft.blocks,
          citations: draft.citations,
          hashtags: draft.hashtags,
          groundingScore: draft.groundingScore,
          sourceExcerpt: draft.sourceExcerpt,
          adapter: draft.adapter,
          status: "in_review",
        }),
      });
      return data;
    },
    onSuccess: () => {
      setMessage("Submitted for review. An editor will verify every citation.");
      polarToast("Submitted for review", "An editor will verify every citation before it can be published.", "info");
    },
    onError: (error: Error) => setMessage(error.message),
  });

  useEffect(() => {
    setLastAudience(audience);
  }, [audience, setLastAudience]);

  const copyMarkdown = useCallback(() => {
    if (!draft) return;
    const body = draft.blocks
      .map((block) => (block.type === "bullets" ? (block.items ?? []).map((i) => `- ${i}`).join("\n") : block.text))
      .join("\n\n");
    const citations = draft.citations
      .map((c) => `[${c.label}] ${c.assetTitle}, p. ${c.page} — "${c.snippet}"`)
      .join("\n");
    void navigator.clipboard.writeText(`# ${headline}\n\n${draft.dek}\n\n${body}\n\n---\n${citations}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, [draft, headline]);

  return (
    <motion.aside
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Citation-locked generation studio"
      className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-xl flex-col border-l border-line bg-surface shadow-[var(--shadow-4)]"
    >
      <header className="flex items-start justify-between gap-4 border-b border-line p-5">
        <div>
          <p className="label-micro">Generation studio</p>
          <h2 className="mt-1.5 text-lg text-ink">Write from one passage only</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close studio"
          className="flex size-9 items-center justify-center rounded-lg border border-line text-ink-2 hover:bg-surface-2"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <section className="rounded-xl border border-line bg-surface-2 p-4">
          <p className="label-micro flex items-center gap-1.5">
            <Quote className="size-3" aria-hidden="true" /> Locked source · {passage.heading}, p.{" "}
            {passage.page}
          </p>
          <p className="mt-2.5 font-[family-name:var(--font-display)] text-[0.9375rem] leading-relaxed text-ink-2">
            {passage.text}
          </p>
          <p className="mt-3 text-[0.6875rem] text-ink-3">
            The adapter receives this text and nothing else. There is no code path that passes the wider
            document.
          </p>
        </section>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <fieldset>
            <legend className="label-micro mb-2">Format</legend>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(FORMAT_LABELS) as GenerationFormat[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={format === id}
                  onClick={() => setFormat(id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[0.75rem] font-medium transition-colors",
                    format === id
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-line bg-surface text-ink-2 hover:text-ink",
                  )}
                >
                  {FORMAT_LABELS[id]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="label-micro mb-2">Reading level</legend>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(AUDIENCE_LABELS) as GenerationAudience[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={audience === id}
                  onClick={() => setAudience(id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[0.75rem] font-medium transition-colors",
                    audience === id
                      ? "border-aurora bg-aurora-soft text-aurora"
                      : "border-line bg-surface text-ink-2 hover:text-ink",
                  )}
                >
                  {AUDIENCE_LABELS[id]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            onClick={() => generate.mutate()}
            loading={generate.isPending}
            disabled={!canGenerate(role)}
            icon={<Sparkles className="size-4" aria-hidden="true" />}
          >
            {generate.isPending ? "Composing…" : "Generate with citations"}
          </Button>
          {!canGenerate(role) ? (
            <p className="text-[0.75rem] text-warn">
              Switch to the Editor role in the top bar to generate. Public visitors can read everything.
            </p>
          ) : null}
        </div>

        {message ? (
          <p
            role="status"
            className="mt-4 rounded-xl border border-line bg-surface-2 p-3 text-[0.8125rem] text-ink-2"
          >
            {message}
          </p>
        ) : null}

        <AnimatePresence>
          {draft ? (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-5"
              aria-live="polite"
            >
              <div className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="label-micro">Draft output</p>
                  <Badge tone={draft.groundingScore >= 0.8 ? "aurora" : "warn"}>
                    {`Grounding ${draft.groundingScore.toFixed(2)} · ${draft.blocks.length} blocks`}
                  </Badge>
                </div>
                <label htmlFor="draft-headline" className="sr-only">
                  Headline (editable)
                </label>
                <textarea
                  id="draft-headline"
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  rows={2}
                  className="mt-3 w-full resize-none rounded-lg border border-line bg-bg p-3 font-[family-name:var(--font-display)] text-[1.125rem] leading-snug text-ink outline-none focus:border-brand"
                />
                <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-2">{draft.dek}</p>

                <div className="mt-4 space-y-4">
                  {draft.blocks.map((block) => {
                    const unsupported = draft.unsupported.includes(block.id);
                    return (
                      <div
                        key={block.id}
                        className={cn(
                          "rounded-xl border p-3.5",
                          unsupported
                            ? "border-[color-mix(in_oklab,var(--danger)_40%,var(--line))] bg-danger-soft"
                            : "border-line bg-surface-2",
                        )}
                      >
                        {block.type === "quote" ? (
                          <blockquote className="border-l-2 border-brand pl-3 font-[family-name:var(--font-display)] text-[0.9375rem] leading-relaxed text-ink">
                            {block.text}
                          </blockquote>
                        ) : block.type === "stat" ? (
                          <p className="font-[family-name:var(--font-display)] text-[1.0625rem] leading-relaxed text-ink">
                            {block.text}
                          </p>
                        ) : block.type === "bullets" ? (
                          <div>
                            <p className="text-[0.8125rem] font-semibold text-ink">{block.text}</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.875rem] leading-relaxed text-ink-2">
                              {(block.items ?? []).map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-[0.9375rem] leading-relaxed text-ink-2">{block.text}</p>
                        )}
                        <div className="mt-2.5 flex items-center gap-2">
                          {block.citationIds.map((citationId) => {
                            const citation = draft.citations.find((c) => c.id === citationId);
                            if (!citation) return null;
                            return (
                              <button
                                key={citationId}
                                type="button"
                                onClick={() => onCitationClick(citation.passageId)}
                                className="group inline-flex items-center gap-1 rounded-full bg-aurora-soft px-2 py-0.5 text-[0.625rem] font-bold text-aurora transition-transform hover:scale-105"
                                title={`${citation.assetTitle}, p. ${citation.page}`}
                              >
                                {citation.label}
                                <span className="font-[family-name:var(--font-mono)]">p.{citation.page}</span>
                              </button>
                            );
                          })}
                          {unsupported ? (
                            <Badge tone="danger">Needs human review</Badge>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {draft.hashtags.length ? (
                  <p className="mt-4 flex flex-wrap gap-1.5">
                    {draft.hashtags.map((tag) => (
                      <span key={tag} className="rounded-full bg-surface-3 px-2 py-0.5 text-[0.6875rem] text-ink-2">
                        #{tag}
                      </span>
                    ))}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ScoreBar value={draft.groundingScore} label="Grounding score" tone="aurora" />
                <div className="rounded-xl border border-line bg-surface p-3">
                  <p className="text-[0.6875rem] text-ink-3">Adapter</p>
                  <p className="mt-1 font-[family-name:var(--font-mono)] text-[0.8125rem] text-ink-2">
                    {draft.adapter}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={() => submit.mutate()}
                  loading={submit.isPending}
                  disabled={!canGenerate(role)}
                  icon={<Check className="size-4" aria-hidden="true" />}
                >
                  Submit for review
                </Button>
                <Button variant="secondary" onClick={copyMarkdown} icon={copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}>
                  {copied ? "Copied" : "Copy with citations"}
                </Button>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}

/* ------------------------------- viewer ------------------------------- */

export function DocumentViewer({
  asset,
  passages,
  related,
}: {
  asset: AssetSummary;
  passages: PassageSummary[];
  related: AssetSummary[];
}) {
  const [activePassage, setActivePassage] = useState<PassageSummary | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [studioOpen, setStudioOpen] = useState(false);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";
    if (!selection || text.length < 12) {
      setSelectedText("");
      return;
    }
    let node: Node | null = selection.anchorNode;
    while (node && node instanceof Element && !node.hasAttribute("data-passage-id")) {
      node = node.parentElement;
    }
    const passageId = node instanceof Element ? node.getAttribute("data-passage-id") : null;
    if (!passageId) {
      setSelectedText("");
      return;
    }
    const passage = passages.find((p) => p.id === passageId);
    if (passage) {
      setActivePassage(passage);
      setSelectedText(text.slice(0, 220));
    }
  }, [passages]);

  const openStudio = (passage: PassageSummary) => {
    setActivePassage(passage);
    setStudioOpen(true);
  };

  const jumpToPassage = (passageId: string) => {
    setStudioOpen(false);
    const element = document.getElementById(`passage-${passageId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    element?.classList.add("flash-target");
    window.setTimeout(() => element?.classList.remove("flash-target"), 1700);
  };

  return (
    <div className="container-polaris mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[1.1875rem] text-ink">Document text</h2>
          <p className="inline-flex items-center gap-2 text-[0.75rem] text-ink-3">
            <BookOpen className="size-3.5" aria-hidden="true" />
            {passages.length > 0
              ? `${passages.length} citable passages · select text or a passage to generate`
              : "No machine-readable text — metadata-only asset"}
          </p>
        </div>

        <div onMouseUp={handleSelection} onKeyUp={handleSelection} className="space-y-4">
          {passages.length > 0 ? (
            passages.map((passage, index) => (
              <Passage
                key={passage.id}
                passage={passage}
                index={index}
                active={activePassage?.id === passage.id}
                onPick={(p) => openStudio(p)}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
              <p className="font-[family-name:var(--font-display)] text-lg text-ink">
                This asset has no text layer
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2">
                Images, videos and datasets are catalogued by metadata and remain fully searchable through
                their titles, tags and descriptions. Text extraction for scanned reports is handled by the
                OCR adapter in the production roadmap.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {asset.tags.map((tag) => (
                  <Badge key={tag} tone="ice">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {asset.kind === "video" && asset.durationSeconds ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-ink/90 p-6 text-center">
            <p className="label-micro text-[color-mix(in_oklab,var(--ink)_20%,white)]">Video preview</p>
            <div className="mt-4 flex aspect-video items-center justify-center rounded-xl bg-black/40">
              <div className="flex flex-col items-center gap-3">
                <span className="flex size-14 items-center justify-center rounded-full border border-white/25 text-white">
                  ▶
                </span>
                <p className="font-[family-name:var(--font-mono)] text-[0.75rem] text-white/70 tnum">
                  {Math.floor(asset.durationSeconds / 60)}m {asset.durationSeconds % 60}s ·{" "}
                  {formatBytes(asset.sizeBytes)}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="label-micro">Expedition</p>
          {asset.expeditionSlug ? (
            <>
              <p className="mt-2 text-[0.9375rem] font-semibold text-ink">{asset.expeditionName}</p>
              <p className="mt-1 text-[0.75rem] text-ink-3">
                {asset.expeditionCode} · {asset.region?.replace("-", " ")}
              </p>
              <p className="mt-3 font-[family-name:var(--font-mono)] text-[0.6875rem] text-ink-3 tnum">
                {asset.lat !== null && asset.lng !== null
                  ? `${asset.lat.toFixed(2)}°, ${asset.lng.toFixed(2)}°`
                  : "coordinates unavailable"}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-2">Not yet linked to an expedition.</p>
          )}
          <dl className="mt-4 space-y-2 border-t border-line pt-3 text-[0.75rem]">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-3">Status</dt>
              <dd className="font-medium text-ink-2">{statusLabel(asset.status)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-3">Extraction</dt>
              <dd className="font-medium text-ink-2 tnum">
                {Math.round(asset.extractionConfidence * 100)}% confidence
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-3">Licence</dt>
              <dd className="font-medium text-ink-2">{asset.licence}</dd>
            </div>
          </dl>
          <a
            href={`/api/assets/${asset.publicId}`}
            className="mt-4 inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-brand hover:brightness-110"
          >
            <FileDown className="size-3.5" aria-hidden="true" />
            Download JSON record
          </a>
        </div>

        {related.length > 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-5">
            <p className="label-micro">Related by vector &amp; tag overlap</p>
            <ul className="mt-3 space-y-3">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/archive/${item.publicId}`}
                    className="group flex items-start gap-2 rounded-lg p-1 transition-colors hover:bg-surface-2"
                  >
                    <Badge tone="neutral">{item.kind}</Badge>
                    <span className="flex-1 text-[0.8125rem] leading-snug text-ink-2 transition-colors group-hover:text-brand">
                      {item.title}
                    </span>
                    <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-ink-3" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>

      {/* sticky selection bar */}
      <AnimatePresence>
        {selectedText && !studioOpen ? (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="no-print fixed inset-x-0 bottom-4 z-[60] mx-auto w-[min(92vw,44rem)]"
          >
            <div className="glass flex flex-col gap-3 rounded-2xl border border-line p-4 shadow-[var(--shadow-4)] sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="label-micro">Selection captured</p>
                <p className="mt-1 truncate text-[0.8125rem] text-ink-2">“{selectedText}…”</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="primary"
                  onClick={() => activePassage && openStudio(activePassage)}
                  icon={<Sparkles className="size-4" aria-hidden="true" />}
                >
                  Generate from selection
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedText("")}
                  aria-label="Dismiss selection"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {studioOpen && activePassage ? (
          <StudioPanel
            passage={activePassage}
            assetId={asset.id}
            onClose={() => setStudioOpen(false)}
            onCitationClick={jumpToPassage}
          />
        ) : null}
      </AnimatePresence>

    </div>
  );
}

