"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Layers,
  Quote,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import {
  ClipReveal,
  Counter,
  Magnetic,
  Reveal,
  Stagger,
  StaggerItem,
  Tilt,
  usePrefersReducedMotion,
} from "@/components/motion-kit";
import { Badge, Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export type LandingStats = {
  assets: number;
  reports: number;
  images: number;
  videos: number;
  datasets: number;
  expeditions: number;
  passages: number;
};

/* --------------------------------- Aurora field --------------------------------- */

export function AuroraField({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden noise", className)} aria-hidden="true">
      <div
        className="aurora-glow"
        style={{ top: "-22%", left: "6%", width: "44vw", height: "44vw", background: "var(--accent)" }}
      />
      <div
        className="aurora-glow"
        style={{ top: "4%", right: "2%", width: "38vw", height: "38vw", background: "var(--aurora-fill)" }}
      />
      <div
        className="aurora-band"
        style={{
          inset: "-25% -10% auto -10%",
          height: "78%",
          background:
            "radial-gradient(60% 70% at 30% 40%, color-mix(in oklab, var(--brand) 62%, transparent), transparent 70%)",
        }}
      />
      <div
        className="aurora-band"
        style={{
          inset: "-18% 0% auto -12%",
          height: "66%",
          background:
            "radial-gradient(55% 65% at 62% 45%, color-mix(in oklab, var(--aurora) 58%, transparent), transparent 72%)",
        }}
      />
      <div
        className="aurora-band"
        style={{
          inset: "-12% -18% auto -6%",
          height: "52%",
          background:
            "radial-gradient(50% 60% at 45% 55%, color-mix(in oklab, var(--ice) 52%, transparent), transparent 74%)",
        }}
      />
      <div className="absolute inset-0 grid-field opacity-70" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-[var(--bg)]" />
    </div>
  );
}

/* --------------------------------- Hero --------------------------------- */

export function Hero({ stats }: { stats: LandingStats }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const auroraY = useTransform(scrollYProgress, [0, 1], [0, -64]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden section-pad-lg">
      <motion.div className="absolute inset-0" style={reduced ? undefined : { y: auroraY }}>
        <AuroraField />
      </motion.div>
      <motion.div
        style={reduced ? undefined : { y, opacity: fade }}
        className="container-polaris relative flex flex-col items-center text-center"
      >
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 16 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 backdrop-blur"
        >
          <span className="relative flex size-1.5" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-aurora opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-aurora" />
          </span>
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-2">
            SIH26063 · Ministry of Earth Sciences
          </span>
        </motion.div>

        <h1 className="mt-8 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(2.5rem,7.2vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.032em] text-ink">
          {["India\u2019s", "polar", "science,"].map((word, index) => (
            <motion.span
              key={word}
              className="inline-block"
              initial={reduced ? undefined : { opacity: 0, y: 28, filter: "blur(10px)" }}
              animate={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.78, delay: 0.06 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
              {"\u00A0"}
            </motion.span>
          ))}
          <motion.span
            className="inline-block gradient-text"
            initial={reduced ? undefined : { opacity: 0, y: 28, filter: "blur(10px)" }}
            animate={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.86, delay: 0.06 + 3 * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            made legible.
          </motion.span>
        </h1>

        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 18 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-2 sm:text-[1.1875rem]"
        >
          One repository for every Antarctic report, Arctic observation, Southern Ocean cast and Himalayan
          stake farm. Search it by meaning, turn any paragraph into citable outreach copy, and publish it
          through a governed editorial workflow.
        </motion.p>

        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 18 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Magnetic>
            <Link
              href="/archive"
              className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-brand px-6 text-[0.9375rem] font-semibold text-brand-ink shadow-[var(--shadow-3)] transition-[filter,transform] hover:brightness-110"
            >
              <ScanSearch className="size-4" aria-hidden="true" />
              Search the archive
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href="/ingest"
              className="inline-flex h-12 items-center gap-2.5 rounded-xl border border-line bg-surface px-6 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-line-strong hover:bg-surface-2"
            >
              <UploadCloud className="size-4" aria-hidden="true" />
              Ingest material
            </Link>
          </Magnetic>
        </motion.div>

        <dl className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-10 sm:grid-cols-4">
          {[
            { label: "Assets catalogued", value: stats.assets },
            { label: "Expeditions", value: stats.expeditions },
            { label: "Citable passages", value: stats.passages },
            { label: "Media items", value: stats.images + stats.videos },
          ].map((item, index) => (
            <div key={item.label} className="text-center">
              <dd className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,3.4vw,2.5rem)] font-light leading-none text-ink">
                <Counter to={item.value} duration={1500 + index * 120} />
              </dd>
              <dt className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
                {item.label}
              </dt>
            </div>
          ))}
        </dl>

        <motion.p
          style={reduced ? undefined : { opacity: cueOpacity }}
          className="mt-14 flex flex-col items-center gap-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-ink-3"
        >
          Scroll to explore
          <span className="block h-10 w-px bg-gradient-to-b from-[var(--accent)] to-transparent" aria-hidden="true" />
        </motion.p>
      </motion.div>
    </section>
  );
}

/* --------------------------------- Pipeline (GSAP pinned) --------------------------------- */

const STAGES = [
  {
    id: "ingest",
    step: "01",
    title: "Ingest",
    Icon: UploadCloud,
    body: "Drop a 300-page expedition report, a drone mosaic or a NetCDF dataset. The parser pulls title, year, expedition, media type and tags out of the file itself, then hands you an editable card instead of a twelve-field form.",
    detail: "PDF · PNG/JPG · MP4 · CSV · NetCDF",
  },
  {
    id: "catalogue",
    step: "02",
    title: "Catalogue",
    Icon: Layers,
    body: "Every asset is bound to an expedition, a station, a coordinate pair and a season. Reports are chunked into passages, each one a future citation target with its own page anchor.",
    detail: "22 expeditions · 4 regions · 1981–2025",
  },
  {
    id: "search",
    step: "03",
    title: "Search",
    Icon: ScanSearch,
    body: "Ask in plain language. Keyword ranking is fused with 256-dimensional vector similarity, so 'how does melting ice affect krill' finds the right report even though those exact words never appear together.",
    detail: "Hybrid RRF · 256-dim · <300 ms",
  },
  {
    id: "generate",
    step: "04",
    title: "Generate",
    Icon: Sparkles,
    body: "Select a paragraph. Choose a format and a reading level. The adapter sees nothing but that paragraph — and every sentence it returns carries a citation chip that jumps back to the exact source text.",
    detail: "Citation-locked · 3 reading levels",
  },
  {
    id: "publish",
    step: "05",
    title: "Review & publish",
    Icon: ShieldCheck,
    body: "Editors approve, admins publish, and every transition is written to an append-only audit trail. Approved items land on a channel calendar you can drag to reschedule.",
    detail: "Role-gated · audited · scheduled",
  },
];

export function PipelineSequence() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let context: { revert: () => void } | null = null;
    let cancelled = false;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !sectionRef.current || !trackRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      const track = trackRef.current;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 96);

      if (window.innerWidth < 900) return;

      context = gsap.context(() => {
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.4}`,
            pin: true,
            scrub: 0.55,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-stage-index]").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0.35, scale: 0.96 },
            {
              opacity: 1,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                containerAnimation: undefined,
                start: "left right",
                end: "center center",
                horizontal: true,
              },
            },
          );
        });
      }, sectionRef);

      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, [reduced]);

  return (
    <section id="pipeline" className="relative border-y border-line bg-surface/40 section-pad">
      <div className="container-polaris">
        <Reveal>
          <p className="label-micro">The pipeline</p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.06] text-ink">
            From a scanned PDF on a ship to a cited public post — in one continuous chain of custody.
          </h2>
          <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-2">
            Five stages, one repository, no dead ends. Scroll sideways through the sequence.
          </p>
        </Reveal>
      </div>

      <div ref={sectionRef} className="relative mt-12 overflow-hidden">
        <div
          ref={trackRef}
          className="scroll-x flex gap-6 px-[max(1.25rem,calc((100vw-1240px)/2+1.25rem))] pb-6 max-lg:snap-x max-lg:snap-mandatory"
        >
          {STAGES.map((stage) => (
            <article
              key={stage.id}
              data-stage-index
              className="relative flex w-[min(88vw,26rem)] shrink-0 snap-center flex-col rounded-2xl border border-line bg-surface p-7 shadow-[var(--shadow-2)] max-lg:transform-none"
            >
              <div className="flex items-center justify-between">
                <span className="font-[family-name:var(--font-display)] text-[2.75rem] font-light leading-none text-[color-mix(in_oklab,var(--brand)_38%,var(--ink))]" aria-hidden="true">
                  {stage.step}
                </span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <stage.Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-6 text-xl text-ink">{stage.title}</h3>
              <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-2">{stage.body}</p>
              <p className="mt-6 font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-wider text-ink-3">
                {stage.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Citation showcase --------------------------------- */

export function CitationShowcase() {
  const reduced = usePrefersReducedMotion();
  return (
    <section className="section-pad-lg">
      <div className="container-polaris">
        <Reveal>
          <div className="max-w-2xl">
            <p className="label-micro">Citation-locked generation</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.06] text-ink">
              Every sentence carries its source.
            </h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-2">
              The adapter is handed exactly one passage — never the whole document. A model-agnostic
              verifier then checks that each block maps back to that passage, that every number appears in
              the source, and that no claim is left uncited.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <ClipReveal>
            <Card className="h-full p-7">
              <div className="flex items-center justify-between">
                <p className="label-micro">Source passage</p>
                <Badge tone="ice">Page 58</Badge>
              </div>
              <p className="mt-4 text-[0.8125rem] font-semibold uppercase tracking-wider text-ink-3">
                Sea-ice link
              </p>
              <blockquote className="mt-3 border-l-2 border-brand pl-4 font-[family-name:var(--font-display)] text-[1.0625rem] leading-relaxed text-ink">
                Krill recruitment in our survey region is tightly coupled to the duration of the previous
                winter&apos;s sea-ice cover. Years with more than 180 days of sea ice above 60°S produced
                strong one-year-old cohorts, whereas the ice-poor summer of 2016–17 produced a cohort
                failure…
              </blockquote>
              <p className="mt-4 text-xs text-ink-3">
                Krill Biomass and Sea-Ice Extent Along the 65°E Transect, IAE-41
              </p>
            </Card>
          </ClipReveal>

          <ClipReveal>
            <Card className="h-full border-[color-mix(in_oklab,var(--aurora)_28%,var(--line))] p-7">
              <div className="flex items-center justify-between">
                <p className="label-micro">Generated · student reading level</p>
                <Badge tone="aurora">
                  <CheckCircle2 className="size-3" aria-hidden="true" /> Grounded 0.94
                </Badge>
              </div>
              <h3 className="mt-4 text-xl leading-snug text-ink">
                What 180 days tells us about krill
              </h3>
              <div className="prose-polaris mt-4 text-[0.9375rem]">
                <p>
                  Krill recruitment in our survey region is tightly coupled to the duration of the previous
                  winter&apos;s sea-ice cover.
                  <sup className="ml-1">
                    <span className="rounded bg-aurora-soft px-1.5 py-0.5 text-[0.625rem] font-bold text-aurora">
                      1
                    </span>
                  </sup>{" "}
                  (In plain words: krill are shrimp-like creatures that feed almost everything in the
                  Southern Ocean.)
                </p>
              </div>
              <div className="mt-6 rounded-xl border border-line bg-surface-2 p-3">
                <p className="flex items-start gap-2 text-[0.75rem] leading-relaxed text-ink-2">
                  <Quote className="mt-0.5 size-3.5 shrink-0 text-ink-3" aria-hidden="true" />
                  <span>
                    <strong className="text-ink">1 · IAE-41, p. 58</strong> — Sea-ice link, Krill Biomass
                    and Sea-Ice Extent Along the 65°E Transect
                  </span>
                </p>
              </div>
            </Card>
          </ClipReveal>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Feature grid --------------------------------- */

const FEATURES = [
  {
    title: "Hybrid semantic search",
    body: "Field-weighted keyword scoring fused with vector cosine similarity using reciprocal rank fusion. Toggle modes and see the contribution of each signal.",
    href: "/archive",
    cta: "Try a natural-language query",
    Icon: ScanSearch,
  },
  {
    title: "Drag-and-drop ingestion",
    body: "Automatic metadata extraction with a confidence score you can override. Reports are chunked into citable passages on the way in.",
    href: "/ingest",
    cta: "Upload a file",
    Icon: UploadCloud,
  },
  {
    title: "Three reading levels",
    body: "The same paragraph becomes a press-ready story, a class-ready explainer or a researcher brief — with a plain-language gloss where jargon appears.",
    href: "/archive",
    cta: "Open the studio",
    Icon: Sparkles,
  },
  {
    title: "Editorial state machine",
    body: "Draft → In review → Approved → Published, with role-gated transitions, mandatory rejection notes and an append-only audit trail.",
    href: "/review",
    cta: "Open the review queue",
    Icon: ShieldCheck,
  },
  {
    title: "Channel calendar",
    body: "Drag an approved draft onto a day to reschedule it, or shift by day and week with the keyboard. Crowded channels are flagged.",
    href: "/calendar",
    cta: "View the calendar",
    Icon: Layers,
  },
  {
    title: "Archive intelligence",
    body: "Assets by kind, growth by year, pending review load and mean grounding score — the numbers a programme officer actually needs.",
    href: "/dashboard",
    cta: "See the dashboard",
    Icon: FileSearch,
  },
];

export function FeatureGrid() {
  return (
    <section className="border-t border-line bg-surface/40 section-pad-lg">
      <div className="container-polaris">
        <Reveal>
          <div className="max-w-2xl">
            <p className="label-micro">Capabilities</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.06] text-ink">
              Six working surfaces, not six mockups.
            </h2>
          </div>
        </Reveal>
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title}>
              <Tilt>
              <Link
                href={feature.href}
                className="card-lift group flex h-full flex-col rounded-2xl border border-line bg-surface p-7 shadow-[var(--shadow-1)]"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-surface-2 text-brand">
                  <feature.Icon className="size-[1.15rem]" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-[1.0625rem] text-ink">{feature.title}</h3>
                <p className="mt-2.5 flex-1 text-[0.875rem] leading-relaxed text-ink-2">{feature.body}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-brand">
                  {feature.cta}
                  <ArrowRight
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* --------------------------------- Closing CTA --------------------------------- */

export function ClosingCta() {
  return (
    <section className="relative isolate overflow-hidden section-pad-lg">
      <AuroraField className="opacity-70" />
      <div className="container-polaris relative text-center">
        <Reveal>
          <h2 className="mx-auto max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.04] text-ink">
            The archive is already open. Come find something.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-ink-2">
            {`Try the query "how does melting ice affect krill" — no document in the corpus contains those
            words together, and it still returns the right report first.`}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/archive"
              className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-brand px-6 text-[0.9375rem] font-semibold text-brand-ink shadow-[var(--shadow-3)] transition-[filter] hover:brightness-110"
            >
              <ScanSearch className="size-4" aria-hidden="true" />
              Open the archive
            </Link>
            <Link
              href="/review"
              className="inline-flex h-12 items-center gap-2.5 rounded-xl border border-line bg-surface px-6 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-line-strong hover:bg-surface-2"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              See the review queue
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
