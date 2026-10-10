"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { usePolarStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/* ------------------------------ Lenis smooth scroll ------------------------------ */

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  useEffect(() => {
    if (reduced) return;
    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;
    let frame = 0;
    let cancelled = false;

    void (async () => {
      const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const instance = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 });
      lenis = instance;
      instance.on("scroll", ScrollTrigger.update);
      const loop = (time: number) => {
        instance.raf(time);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}

/* ------------------------------ role hydration ------------------------------ */

function RoleHydration() {
  const hydrate = usePolarStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}

/* ------------------------------ command palette ------------------------------ */

const PALETTE_ITEMS = [
  { label: "Archive & search", hint: "Search the repository", href: "/archive" },
  { label: "Ingest new material", hint: "Upload reports, images, video", href: "/ingest" },
  { label: "Review queue", hint: "Editorial workflow", href: "/review" },
  { label: "Publication calendar", hint: "Schedule and channels", href: "/calendar" },
  { label: "Dashboard", hint: "Archive statistics", href: "/dashboard" },
];

function CommandPalette() {
  const open = usePolarStore((s) => s.paletteOpen);
  const setOpen = usePolarStore((s) => s.setPaletteOpen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!usePolarStore.getState().paletteOpen);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  return <AnimatePresence>{open ? <PaletteDialog onClose={() => setOpen(false)} /> : null}</AnimatePresence>;
}

/** Mounted only while the palette is open, so the query starts empty
 *  naturally — no reset-on-open effect required. */
function PaletteDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const items = useMemo(
    () => PALETTE_ITEMS.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[14vh] no-print"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div
        className="absolute inset-0 bg-[color-mix(in_oklab,var(--bg-deep)_72%,transparent)] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-4)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search className="size-4 text-ink-3" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to…"
            aria-label="Search commands"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
          />
          <kbd className="label-micro rounded border border-line px-1.5 py-0.5 text-ink-3">esc</kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto p-2">
          {items.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-ink-3">No matches</li>
          ) : (
            items.map((item) => (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(item.href);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-2 focus-visible:bg-surface-2"
                >
                  <span className="text-sm font-medium text-ink">{item.label}</span>
                  <span className="text-xs text-ink-3">{item.hint}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------ root providers ------------------------------ */

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 20_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <SmoothScroll>{children}</SmoothScroll>
      <RoleHydration />
      <CommandPalette />
    </QueryClientProvider>
  );
}

export function PaletteHint({ className }: { className?: string }) {
  const setOpen = usePolarStore((s) => s.setPaletteOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2",
        className,
      )}
      aria-label="Open command palette"
    >
      <Command className="size-3.5" aria-hidden="true" />
      <span>K</span>
    </button>
  );
}
