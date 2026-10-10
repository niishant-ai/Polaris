"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CalendarRange,
  FileText,
  Film,
  Image as ImageIcon,
  Layers,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Table2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { apiFetch, type ApiResponse } from "@/lib/client-api";
import type { AssetSummary, ExpeditionSummary, SearchResponse } from "@/lib/repositories";
import { Badge, Button, EmptyState, ScoreBar, Skeleton, TabBar } from "@/components/ui/primitives";
import { cn, formatDate, formatBytes, KINDS } from "@/lib/utils";

const KIND_ICON: Record<string, typeof FileText> = {
  report: FileText,
  image: ImageIcon,
  video: Film,
  dataset: Table2,
};

const SUGGESTED = [
  "how does melting ice affect krill",
  "black carbon on Himalayan snow",
  "what do expeditioners eat during polar winter",
  "is the Southern Ocean acidifying",
];

/* ------------------------------- highlight ------------------------------- */

function Highlighted({ text, tokens }: { text: string; tokens: string[] }) {
  if (tokens.length === 0) return <>{text}</>;
  const pattern = new RegExp(
    `(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, index) =>
        pattern.test(part) && part.length > 2 ? <mark key={index}>{part}</mark> : <span key={index}>{part}</span>,
      )}
    </>
  );
}

/* ------------------------------- polar map ------------------------------- */

type DiscProps = {
  pole: "north" | "south";
  items: ExpeditionSummary[];
  title: string;
  cx: number;
  cy: number;
  activeSlug: string | null;
  onSelect: (slug: string) => void;
};

function PolarDisc({ pole, items, title, cx, cy, activeSlug, onSelect }: DiscProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={98} fill="var(--surface-2)" stroke="var(--line)" />
      <circle cx={cx} cy={cy} r={74} fill="none" stroke="var(--line)" strokeDasharray="3 5" />
      <circle cx={cx} cy={cy} r={46} fill="none" stroke="var(--line)" strokeDasharray="3 5" />
      <text x={cx} y={cy - 112} textAnchor="middle" className="fill-[var(--ink-3)]" fontSize="10" letterSpacing="1.6">
        {title.toUpperCase()}
      </text>
      {items.map((expedition) => {
        const d = pole === "north" ? (90 - expedition.lat) / 90 : (expedition.lat + 90) / 90;
        const rad = (expedition.lng * Math.PI) / 180;
        const x = cx + d * 98 * Math.cos(rad);
        const y = pole === "north" ? cy - d * 98 * Math.sin(rad) : cy + d * 98 * Math.sin(rad);
        const active = activeSlug === expedition.slug;
        return (
          <g
            key={expedition.id}
            tabIndex={0}
            role="button"
            aria-label={`${expedition.name}, ${expedition.assetCount} assets. Filter archive.`}
            onClick={() => onSelect(expedition.slug)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(expedition.slug);
              }
            }}
            className="cursor-pointer outline-none focus-visible:stroke-[var(--brand)]"
          >
            <title>{`${expedition.name} · ${expedition.assetCount} assets`}</title>
            <circle
              cx={x}
              cy={y}
              r={active ? 7 : 4.5}
              fill={active ? "var(--brand)" : "var(--aurora)"}
              stroke="var(--surface)"
              strokeWidth={1.5}
            />
            <text x={x + 8} y={y + 3} fontSize="8.5" className="fill-[var(--ink-2)]">
              {expedition.code}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function PolarMap({
  expeditions,
  onSelect,
  activeSlug,
}: {
  expeditions: ExpeditionSummary[];
  onSelect: (slug: string) => void;
  activeSlug: string | null;
}) {
  const arctic = expeditions.filter((e) => e.lat >= 40);
  const antarctic = expeditions.filter((e) => e.lat <= -40);
  const thirdPole = expeditions.filter((e) => e.lat > -40 && e.lat < 40);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface p-4">
      <p className="label-micro mb-2">Expedition map · click a station to filter</p>
      <svg viewBox="0 0 520 320" className="h-auto w-full" role="img" aria-label="Polar expedition map">
        <PolarDisc
          pole="north"
          items={arctic}
          title="Arctic · Himadri"
          cx={140}
          cy={150}
          activeSlug={activeSlug}
          onSelect={onSelect}
        />
        <PolarDisc
          pole="south"
          items={antarctic}
          title="Antarctic · Maitri & Bharati"
          cx={380}
          cy={150}
          activeSlug={activeSlug}
          onSelect={onSelect}
        />
        <text x={20} y={300} fontSize="9" className="fill-[var(--ink-3)]" letterSpacing="1.4">
          THIRD POLE · HIMALAYA
        </text>
        <line x1={20} y1={308} x2={500} y2={308} stroke="var(--line)" />
        {thirdPole.map((expedition, index) => {
          const x = 40 + (index * 440) / Math.max(1, thirdPole.length - 1 || 1);
          const active = activeSlug === expedition.slug;
          return (
            <g
              key={expedition.id}
              tabIndex={0}
              role="button"
              aria-label={`${expedition.name}, ${expedition.assetCount} assets. Filter archive.`}
              onClick={() => onSelect(expedition.slug)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(expedition.slug);
                }
              }}
              className="cursor-pointer outline-none"
            >
              <title>{`${expedition.name} · ${expedition.assetCount} assets`}</title>
              <circle cx={x} cy={308} r={active ? 6 : 4} fill={active ? "var(--brand)" : "var(--aurora)"} stroke="var(--surface)" strokeWidth={1.5} />
              <text x={x} y={296} fontSize="8.5" textAnchor="middle" className="fill-[var(--ink-2)]">
                {expedition.code.replace("HIMANSH-", "HS ").replace("GANGOTRI-", "GT ")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------- timeline ------------------------------- */

function Timeline({
  expeditions,
  onSelect,
  activeSlug,
}: {
  expeditions: ExpeditionSummary[];
  onSelect: (slug: string) => void;
  activeSlug: string | null;
}) {
  const sorted = [...expeditions].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const byDecade = new Map<string, ExpeditionSummary[]>();
  for (const expedition of sorted) {
    const decade = `${expedition.startDate.slice(0, 3)}0s`;
    byDecade.set(decade, [...(byDecade.get(decade) ?? []), expedition]);
  }

  return (
    <ol className="relative space-y-10 border-l border-line pl-6">
      {[...byDecade.entries()].map(([decade, items]) => (
        <li key={decade}>
          <p className="sticky top-20 z-10 mb-4 inline-block rounded-full border border-line bg-surface px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
            {decade}
          </p>
          <ul className="space-y-3">
            {items.map((expedition) => {
              const active = activeSlug === expedition.slug;
              return (
                <li key={expedition.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(expedition.slug)}
                    aria-pressed={active}
                    className={cn(
                      "card-lift flex w-full flex-col gap-2 rounded-xl border p-4 text-left sm:flex-row sm:items-center sm:justify-between",
                      active ? "border-brand bg-brand-soft" : "border-line bg-surface",
                    )}
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className={cn(
                          "absolute -ml-[34px] mt-1.5 size-2.5 rounded-full",
                          active ? "bg-brand" : "bg-aurora",
                        )}
                        aria-hidden="true"
                      />
                      <span>
                        <span className="block text-[0.9375rem] font-semibold text-ink">{expedition.name}</span>
                        <span className="mt-0.5 block text-xs text-ink-3">
                          {expedition.station} · {expedition.season}
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <Badge tone="ice">{expedition.region.replace("-", " ")}</Badge>
                      <Badge>{expedition.assetCount} assets</Badge>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------- result card ------------------------------- */

function ResultCard({ hit }: { hit: SearchResponse["results"][number] }) {
  const Icon = KIND_ICON[hit.asset.kind] ?? FileText;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/archive/${hit.asset.publicId}`}
        className="card-lift group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-1)]"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">
            <Icon className="size-3" aria-hidden="true" />
            {hit.asset.kind}
          </Badge>
          {hit.asset.expeditionCode ? <Badge tone="ice">{hit.asset.expeditionCode}</Badge> : null}
          <Badge>{hit.asset.year}</Badge>
          <span className="ml-auto font-[family-name:var(--font-mono)] text-[0.6875rem] text-ink-3 tnum">
            score {hit.score.toFixed(2)}
          </span>
        </div>

        <h3 className="mt-3 text-[1.0625rem] leading-snug text-ink transition-colors group-hover:text-brand">
          {hit.asset.title}
        </h3>

        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-ink-2">
          {hit.snippet ? <Highlighted text={hit.snippet} tokens={hit.highlights} /> : hit.asset.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <ScoreBar value={hit.keywordScore} label="Keyword" tone="brand" />
          <ScoreBar value={hit.semanticScore} label="Semantic" tone="aurora" />
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] text-ink-3">
          <span>{hit.asset.author}</span>
          <span aria-hidden="true">·</span>
          <span>{formatBytes(hit.asset.sizeBytes)}</span>
          {hit.asset.pageCount ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{hit.asset.pageCount} pp.</span>
            </>
          ) : null}
          {hit.asset.durationSeconds ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{Math.round(hit.asset.durationSeconds / 60)} min</span>
            </>
          ) : null}
          <span aria-hidden="true">·</span>
          <span>{formatDate(hit.asset.createdAt)}</span>
        </p>
      </Link>
    </motion.li>
  );
}

/* ------------------------------- console ------------------------------- */

type Mode = "keyword" | "semantic" | "hybrid";
type View = "results" | "timeline" | "map";

export function SearchConsole({
  initialAssets,
  expeditions,
}: {
  initialAssets: AssetSummary[];
  expeditions: ExpeditionSummary[];
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [mode, setMode] = useState<Mode>("hybrid");
  const [view, setView] = useState<View>("results");
  const [kinds, setKinds] = useState<string[]>([]);
  const [region, setRegion] = useState("");
  const [expeditionSlug, setExpeditionSlug] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 260);
    return () => window.clearTimeout(id);
  }, [query]);

  const { data, isFetching, error } = useQuery({
    queryKey: ["search", debounced, mode, kinds, region],
    queryFn: async () => {
      const data = await apiFetch<
        SearchResponse & { suggestions: string[] }
      >("/api/search", {
        method: "POST",
        body: JSON.stringify({ query: debounced, mode, kinds, region: region || undefined, limit: 30 }),
      });
      return data;
    },
    staleTime: 15_000,
    retry: 1,
  });

  const results = useMemo(() => data?.results ?? [], [data]);
  const visible = useMemo(
    () => (expeditionSlug ? results.filter((r) => r.asset.expeditionSlug === expeditionSlug) : results),
    [results, expeditionSlug],
  );

  const toggleKind = (kind: string) => {
    setKinds((current) => (current.includes(kind) ? current.filter((k) => k !== kind) : [...current, kind]));
  };

  const activeFilters = (kinds.length > 0 ? `${kinds.length} types` : null) ?? (region ? region : null);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-1)] sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
            <label htmlFor="archive-search" className="sr-only">
              Search the polar archive
            </label>
            <input
              id="archive-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask in plain language — e.g. how does melting ice affect krill"
              className="h-12 w-full rounded-xl border border-line bg-bg pl-10 pr-10 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-brand"
              autoComplete="off"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <TabBar
              ariaLabel="Search mode"
              value={mode}
              onChange={setMode}
              tabs={[
                { id: "hybrid", label: "Hybrid" },
                { id: "semantic", label: "Semantic" },
                { id: "keyword", label: "Keyword" },
              ]}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {KINDS.map((kind) => {
            const active = kinds.includes(kind.id);
            return (
              <button
                key={kind.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleKind(kind.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[0.75rem] font-medium transition-colors",
                  active
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
                )}
              >
                {kind.label}
              </button>
            );
          })}
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <label className="sr-only" htmlFor="region-filter">
            Filter by region
          </label>
          <select
            id="region-filter"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="h-9 rounded-lg border border-line bg-surface px-2.5 text-[0.75rem] font-medium text-ink-2 outline-none focus:border-brand"
          >
            <option value="">All regions</option>
            <option value="antarctic">Antarctic</option>
            <option value="arctic">Arctic</option>
            <option value="southern-ocean">Southern Ocean</option>
            <option value="himalaya">Himalaya</option>
          </select>
          {expeditionSlug || activeFilters ? (
            <button
              type="button"
              onClick={() => {
                setExpeditionSlug(null);
                setKinds([]);
                setRegion("");
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.75rem] font-medium text-ink-2 hover:text-danger"
            >
              <X className="size-3" aria-hidden="true" />
              Clear filters
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <TabBar
            ariaLabel="Archive view"
            value={view}
            onChange={setView}
            tabs={[
              { id: "results", label: "Results", count: visible.length },
              { id: "timeline", label: "Timeline", count: expeditions.length },
              { id: "map", label: "Map" },
            ]}
          />
          <p aria-live="polite" className="text-[0.6875rem] text-ink-3 tnum">
            {isFetching ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin" aria-hidden="true" /> searching…
              </span>
            ) : data ? (
              <>
                {visible.length} of {data.total} assets · {data.tookMs} ms · {mode} mode
              </>
            ) : (
              "ready"
            )}
          </p>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_oklab,var(--danger)_35%,var(--line))] bg-danger-soft p-4 text-sm text-danger" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            The search service did not respond ({error.message}). Check that the API is running, then try
            again.
          </span>
        </div>
      ) : null}

      {view === "map" ? (
        <PolarMap
          expeditions={expeditions}
          activeSlug={expeditionSlug}
          onSelect={(slug) => setExpeditionSlug((current) => (current === slug ? null : slug))}
        />
      ) : view === "timeline" ? (
        <Timeline
          expeditions={expeditions}
          activeSlug={expeditionSlug}
          onSelect={(slug) => setExpeditionSlug((current) => (current === slug ? null : slug))}
        />
      ) : (
        <>
          {!debounced && results.length === 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="size-3.5 text-aurora" aria-hidden="true" />
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-3">
                  Suggested natural-language queries
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setQuery(suggestion)}
                    className="rounded-full border border-line bg-surface px-3.5 py-2 text-left text-[0.8125rem] text-ink-2 transition-colors hover:border-brand hover:text-brand"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {initialAssets.slice(0, 9).map((asset) => (
                  <ResultCard
                    key={asset.id}
                    hit={{
                      asset,
                      score: 0,
                      keywordScore: 0,
                      semanticScore: 0,
                      rank: 0,
                      snippet: "",
                      highlights: [],
                    }}
                  />
                ))}
              </ul>
            </div>
          ) : isFetching && results.length === 0 ? (
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <li key={index} className="space-y-3 rounded-2xl border border-line bg-surface p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-1.5 w-full" />
                </li>
              ))}
            </ul>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={<Search className="size-5" aria-hidden="true" />}
              title="Nothing matched that query"
              description="Try fewer words, switch to Hybrid or Semantic mode, or clear the type and region filters. The semantic index understands concepts, not just exact words."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setKinds([]);
                    setRegion("");
                    setExpeditionSlug(null);
                    setMode("hybrid");
                  }}
                >
                  Reset everything
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {visible.map((hit) => (
                  <ResultCard key={hit.asset.id} hit={hit} />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </>
      )}

      {view !== "results" && expeditionSlug ? (
        <div className="rounded-2xl border border-brand/30 bg-brand-soft p-4">
          <p className="text-sm font-semibold text-brand">
            Filtered to {expeditions.find((e) => e.slug === expeditionSlug)?.name}
          </p>
          <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {initialAssets
              .filter((asset) => asset.expeditionSlug === expeditionSlug)
              .map((asset) => (
                <ResultCard
                  key={asset.id}
                  hit={{ asset, score: 0, keywordScore: 0, semanticScore: 0, rank: 0, snippet: "", highlights: [] }}
                />
              ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function ArchiveHeaderStat({ assets, expeditions }: { assets: number; expeditions: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.75rem] text-ink-3">
      <span className="inline-flex items-center gap-1.5">
        <Layers className="size-3.5" aria-hidden="true" /> {assets} assets
      </span>
      <span className="inline-flex items-center gap-1.5">
        <MapPin className="size-3.5" aria-hidden="true" /> {expeditions} expeditions
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CalendarRange className="size-3.5" aria-hidden="true" /> 1981–2025
      </span>
    </div>
  );
}

export type { ApiResponse };
