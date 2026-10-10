"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Check, Info, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Chrome: the page-level furniture — scroll progress rail, custom
 * cursor, first-paint veil and the toast rail. All motion is
 * transform/opacity only, and every piece respects reduced motion.
 * ------------------------------------------------------------------ */

/* ---------------------------- scroll progress ---------------------------- */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion() ?? false;
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  if (reduced) {
    return (
      <div className="scroll-progress no-print" aria-hidden="true" style={{ transform: "none", opacity: 0.5 }}>
        <div className="h-full w-full origin-left" style={{ background: "inherit" }} />
      </div>
    );
  }

  return (
    <motion.div
      className="scroll-progress no-print"
      style={{ scaleX }}
      aria-hidden="true"
      role="presentation"
    />
  );
}

/* ---------------------------- custom cursor ---------------------------- */

export function CustomCursor() {
  const reduced = useReducedMotion() ?? false;
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(fine.matches && !reduced);
    update();
    fine.addEventListener("change", update);
    return () => fine.removeEventListener("change", update);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let ringX = x;
    let ringY = y;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    const loop = () => {
      ringX += (x - ringX) * 0.18;
      ringY += (y - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX - 16}px, ${ringY - 16}px, 0)`;
      }
      frame = requestAnimationFrame(loop);
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const interactive = target?.closest("a, button, [role='button'], input, select, textarea, [tabindex]");
      ringRef.current?.setAttribute("data-active", interactive ? "true" : "false");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    frame = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={ringRef} className="cursor-ring size-8 no-print" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot no-print" aria-hidden="true" />
      <style>{`.cursor-ring[data-active="true"]{width:3rem;height:3rem;margin:-1.5rem 0 0 -1.5rem;border-color:color-mix(in oklab, var(--aurora) 70%, transparent);}`}</style>
    </>
  );
}

/* ---------------------------- first-paint veil ---------------------------- */

export function LoadingVeil() {
  const reduced = useReducedMotion() ?? false;
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The veil is a decorative first-paint animation. React state is only
    // touched from a timer callback (an external event), never synchronously
    // inside the effect body, which keeps the render pass single-shot.
    const timer = window.setTimeout(() => setDone(true), reduced ? 120 : 820);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          className="veil no-print"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
          aria-hidden="true"
        >
          <span className="veil-sweep" />
          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--aurora-fill)] text-[color:var(--accent-ink)]">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z" strokeLinejoin="round" />
                <path d="M12 21.5V12m0 0 8.5-5M12 12 3.5 7" strokeOpacity="0.65" />
              </svg>
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg tracking-tight text-ink">POLARIS</span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------------------------- toast rail ---------------------------- */

type Toast = { id: number; title: string; body?: string; tone: "ok" | "info" };

const TOAST_EVENT = "polaris:toast";

export function polarToast(title: string, body?: string, tone: "ok" | "info" = "ok"): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<Toast>(TOAST_EVENT, { detail: { id: Date.now(), title, body, tone } }));
}

export function ToastRail() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<Toast>).detail;
      setToasts((current) => [...current, detail].slice(-3));
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== detail.id));
      }, 4600);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  return (
    <div className="toast-rail no-print" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className="toast"
            layout
            initial={{ opacity: 0, x: 32, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start gap-2.5">
              <span className={cn("mt-0.5 shrink-0", toast.tone === "ok" ? "text-aurora" : "text-brand")}>
                {toast.tone === "ok" ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <Info className="size-4" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[0.8125rem] font-semibold leading-snug text-ink">{toast.title}</p>
                {toast.body ? <p className="mt-0.5 text-[0.75rem] leading-snug text-ink-2">{toast.body}</p> : null}
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                className="ml-auto shrink-0 rounded-md p-1 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
