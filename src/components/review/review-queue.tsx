"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileSearch,
  History,
  Quote,
  Send,
  ShieldAlert,
  Trash2,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { polarToast } from "@/components/chrome";
import { apiFetch } from "@/lib/client-api";
import { AUDIENCE_LABELS, FORMAT_LABELS } from "@/lib/generate";
import type { DraftSummary } from "@/lib/repositories";
import { canApprove, canPublish, usePolarStore } from "@/lib/store";
import { Badge, Button, EmptyState, ScoreBar, TabBar } from "@/components/ui/primitives";
import { cn, relativeTime, statusLabel, statusTone } from "@/lib/utils";

const CHANNEL_OPTIONS = [
  { id: "website", label: "Website" },
  { id: "x", label: "X / Twitter" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "newsletter", label: "Newsletter" },
];

type TabId = "in_review" | "approved" | "published" | "draft" | "rejected";

export function ReviewQueue({ initialDrafts }: { initialDrafts: DraftSummary[] }) {
  const role = usePolarStore((s) => s.role);
  const hydrated = usePolarStore((s) => s.hydrated);
  const [tab, setTab] = useState<TabId>("in_review");
  const [selectedId, setSelectedId] = useState<string | null>(initialDrafts[0]?.id ?? null);
  const [note, setNote] = useState("");
  const [channel, setChannel] = useState("website");
  const [feedback, setFeedback] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const client = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: ["drafts"],
    queryFn: () => apiFetch<{ drafts: DraftSummary[] }>("/api/drafts").then((d) => d.drafts),
    initialData: initialDrafts,
  });

  const drafts = data ?? [];
  const counts = drafts.reduce<Record<string, number>>((acc, draft) => {
    acc[draft.status] = (acc[draft.status] ?? 0) + 1;
    return acc;
  }, {});
  const visible = drafts.filter((d) => d.status === tab);
  const selected = drafts.find((d) => d.id === selectedId) ?? visible[0] ?? null;

  useEffect(() => {
    if (!selectedId && visible.length > 0) setSelectedId(visible[0].id);
  }, [selectedId, visible]);

  const transition = useMutation({
    mutationFn: async (payload: { id: string; event: string; note?: string; channel?: string }) => {
      const data = await apiFetch<{ draft: DraftSummary }>(`/api/drafts/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify({ event: payload.event, note: payload.note, channel: payload.channel }),
      });
      return data.draft;
    },
    onSuccess: (draft) => {
      setFeedback({ tone: "ok", text: `Moved to “${statusLabel(draft.status)}”.` });
      polarToast(
        draft.status === "published" ? "Published" : `Moved to ${statusLabel(draft.status)}`,
        draft.status === "published" ? "A channel calendar item was created automatically." : draft.headline,
      );
      setNote("");
      void client.invalidateQueries({ queryKey: ["drafts"] });
      void client.invalidateQueries({ queryKey: ["schedule"] });
      void client.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (error: Error) => setFeedback({ tone: "error", text: error.message }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBar
          ariaLabel="Review status"
          value={tab}
          onChange={(id) => {
            setTab(id);
            setFeedback(null);
          }}
          tabs={[
            { id: "in_review", label: "In review", count: counts.in_review ?? 0 },
            { id: "approved", label: "Approved", count: counts.approved ?? 0 },
            { id: "published", label: "Published", count: counts.published ?? 0 },
            { id: "draft", label: "Drafts", count: counts.draft ?? 0 },
            { id: "rejected", label: "Rejected", count: counts.rejected ?? 0 },
          ]}
        />
        <p aria-live="polite" className="text-[0.6875rem] text-ink-3">
          {isFetching ? "refreshing…" : `${drafts.length} drafts · acting as ${hydrated ? role : "editor"}`}
        </p>
      </div>

      {feedback ? (
        <p
          role="status"
          className={cn(
            "flex items-start gap-2 rounded-xl border p-3 text-[0.8125rem]",
            feedback.tone === "ok"
              ? "border-[color-mix(in_oklab,var(--aurora)_35%,var(--line))] bg-aurora-soft text-ink"
              : "border-[color-mix(in_oklab,var(--danger)_35%,var(--line))] bg-danger-soft text-danger",
          )}
        >
          {feedback.tone === "ok" ? (
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-aurora" aria-hidden="true" />
          ) : (
            <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          )}
          {feedback.text}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-3">
          {visible.length === 0 ? (
            <EmptyState
              icon={<Clock className="size-5" aria-hidden="true" />}
              title="Nothing in this queue"
              description="When a science communication officer submits a draft it lands here with its citations attached, ready for an editor to verify against the source."
            />
          ) : (
            visible.map((draft) => (
              <button
                key={draft.id}
                type="button"
                onClick={() => {
                  setSelectedId(draft.id);
                  setFeedback(null);
                }}
                aria-current={selected?.id === draft.id}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-all",
                  selected?.id === draft.id
                    ? "border-brand bg-brand-soft/60 shadow-[var(--shadow-2)]"
                    : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(draft.status)}>{statusLabel(draft.status)}</Badge>
                  <Badge>{FORMAT_LABELS[draft.format as keyof typeof FORMAT_LABELS] ?? draft.format}</Badge>
                </div>
                <p className="mt-2.5 line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-ink">
                  {draft.headline}
                </p>
                <p className="mt-1.5 truncate text-[0.6875rem] text-ink-3">{draft.assetTitle}</p>
                <p className="mt-2 flex items-center justify-between text-[0.6875rem] text-ink-3">
                  <span>
                    {AUDIENCE_LABELS[draft.audience as keyof typeof AUDIENCE_LABELS] ?? draft.audience}
                  </span>
                  <span>{relativeTime(draft.updatedAt)}</span>
                </p>
              </button>
            ))
          )}
        </div>

        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <div className="rounded-2xl border border-line bg-surface p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(selected.status)}>{statusLabel(selected.status)}</Badge>
                  <Badge tone="ice">
                    {AUDIENCE_LABELS[selected.audience as keyof typeof AUDIENCE_LABELS] ?? selected.audience}
                  </Badge>
                  <Badge>{FORMAT_LABELS[selected.format as keyof typeof FORMAT_LABELS] ?? selected.format}</Badge>
                  <Badge>{`adapter ${selected.adapter}`}</Badge>
                  <span className="ml-auto text-[0.6875rem] text-ink-3">
                    by {selected.createdBy} · {relativeTime(selected.createdAt)}
                  </span>
                </div>

                <h2 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.375rem,2.4vw,1.875rem)] leading-tight text-ink">
                  {selected.headline}
                </h2>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{selected.dek}</p>

                <div className="mt-6 space-y-4">
                  {selected.blocks.map((block) => (
                    <div key={block.id} className="rounded-xl border border-line bg-surface-2 p-4">
                      {block.type === "quote" ? (
                        <blockquote className="border-l-2 border-brand pl-3 font-[family-name:var(--font-display)] text-[1rem] leading-relaxed text-ink">
                          {block.text}
                        </blockquote>
                      ) : block.type === "bullets" ? (
                        <ul className="list-disc space-y-1 pl-5 text-[0.9375rem] leading-relaxed text-ink-2">
                          {(block.items ?? []).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[0.9375rem] leading-relaxed text-ink-2">{block.text}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {block.citationIds.map((id) => {
                          const citation = selected.citations.find((c) => c.id === id);
                          if (!citation) return null;
                          return (
                            <Link
                              key={id}
                              href={`/archive/${citation.assetPublicId}#passage-${citation.passageId}`}
                              className="inline-flex items-center gap-1 rounded-full bg-aurora-soft px-2 py-0.5 text-[0.625rem] font-bold text-aurora hover:brightness-110"
                            >
                              {citation.label}
                              <span className="font-[family-name:var(--font-mono)]">p.{citation.page}</span>
                              <ArrowUpRight className="size-2.5" aria-hidden="true" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {selected.hashtags.length ? (
                  <p className="mt-4 flex flex-wrap gap-1.5">
                    {selected.hashtags.map((tag) => (
                      <span key={tag} className="rounded-full bg-surface-3 px-2 py-0.5 text-[0.6875rem] text-ink-2">
                        #{tag}
                      </span>
                    ))}
                  </p>
                ) : null}

                <div className="mt-6 max-w-xs">
                  <ScoreBar value={selected.groundingScore} label="Grounding score" tone="aurora" />
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-6">
                <p className="label-micro flex items-center gap-1.5">
                  <Quote className="size-3" aria-hidden="true" /> Source passage under review
                </p>
                <p className="mt-3 rounded-xl border border-line bg-surface-2 p-4 font-[family-name:var(--font-display)] text-[0.9375rem] leading-relaxed text-ink-2">
                  {selected.sourceExcerpt}
                </p>
                <Link
                  href={`/archive/${selected.assetPublicId}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-brand hover:brightness-110"
                >
                  <FileSearch className="size-3.5" aria-hidden="true" />
                  Open the full source document
                </Link>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-6">
                <p className="label-micro flex items-center gap-1.5">
                  <History className="size-3" aria-hidden="true" /> Audit trail
                </p>
                <ol className="mt-4 space-y-3">
                  {selected.audit.map((entry, index) => (
                    <li key={`${entry.at}-${index}`} className="flex gap-3 text-[0.8125rem]">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                      <span>
                        <span className="font-semibold text-ink">{entry.actor}</span>{" "}
                        <span className="text-ink-2">{entry.action}</span>{" "}
                        <span className="text-ink-3">({entry.role})</span>
                        {entry.note ? (
                          <span className="mt-1 block rounded-lg bg-surface-2 p-2 text-[0.75rem] text-ink-2">
                            “{entry.note}”
                          </span>
                        ) : null}
                      </span>
                      <span className="ml-auto shrink-0 text-[0.6875rem] text-ink-3 tnum">
                        {relativeTime(entry.at)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-6">
                <p className="label-micro">Editorial decision</p>
                {!canApprove(role) ? (
                  <p className="mt-3 text-[0.875rem] text-warn">
                    The public role is read-only. Switch to Editor to approve or reject, and to Admin to
                    publish.
                  </p>
                ) : null}

                <label htmlFor="review-note" className="label-micro mt-4 block">
                  Note (required when rejecting)
                </label>
                <textarea
                  id="review-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  placeholder="e.g. Headline overstates the retreat rate — the 28 m figure is annual, not cumulative."
                  className="mt-1.5 w-full rounded-lg border border-line bg-bg p-3 text-[0.875rem] text-ink outline-none focus:border-brand"
                />

                <label htmlFor="publish-channel" className="label-micro mt-4 block">
                  Publish channel
                </label>
                <select
                  id="publish-channel"
                  value={channel}
                  onChange={(event) => setChannel(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-line bg-bg px-2.5 text-[0.875rem] text-ink outline-none focus:border-brand sm:w-64"
                >
                  {CHANNEL_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    disabled={!canApprove(role) || selected.status !== "in_review"}
                    loading={transition.isPending && transition.variables?.event === "approve"}
                    onClick={() => transition.mutate({ id: selected.id, event: "approve" })}
                    icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={!canApprove(role) || selected.status === "published"}
                    loading={transition.isPending && transition.variables?.event === "reject"}
                    onClick={() => transition.mutate({ id: selected.id, event: "reject", note })}
                    icon={<Trash2 className="size-4" aria-hidden="true" />}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={!canApprove(role) || selected.status === "draft"}
                    loading={transition.isPending && transition.variables?.event === "request_changes"}
                    onClick={() => transition.mutate({ id: selected.id, event: "request_changes", note })}
                    icon={<Undo2 className="size-4" aria-hidden="true" />}
                  >
                    Request changes
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!canPublish(role) || selected.status !== "approved"}
                    loading={transition.isPending && transition.variables?.event === "publish"}
                    onClick={() => transition.mutate({ id: selected.id, event: "publish", channel })}
                    icon={<Send className="size-4" aria-hidden="true" />}
                  >
                    Publish
                  </Button>
                </div>
                {!canPublish(role) && selected.status === "approved" ? (
                  <p className="mt-3 text-[0.75rem] text-ink-3">
                    Publishing is reserved for the Admin role — the API enforces this independently of the
                    button state.
                  </p>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
