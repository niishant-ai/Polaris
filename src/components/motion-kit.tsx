"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false;
}

/* ------------------------------- Reveal ------------------------------- */

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? undefined : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  gap = 0.07,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? undefined : "hidden"}
      whileInView={reduced ? undefined : "show"}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 22,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      variants={
        reduced
          ? undefined
          : {
              hidden: { opacity: 0, y, filter: "blur(5px)" },
              show: { opacity: 1, y: 0, filter: "blur(0px)" },
            }
      }
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------- Parallax ------------------------------- */

export function Parallax({
  children,
  distance = 60,
  className,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div style={reduced ? undefined : { y }} className="gpu">
        {children}
      </motion.div>
    </div>
  );
}

/* ------------------------------- Counter ------------------------------- */

export function Counter({
  to,
  duration = 1400,
  suffix = "",
  decimals = 0,
  className,
}: {
  to: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      // Defer to the next frame so the reduced-motion end state is applied
      // from a callback, not synchronously during the effect body.
      const frame = requestAnimationFrame(() => setValue(to));
      return () => cancelAnimationFrame(frame);
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(to * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref} className={cn("tnum", className)}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ------------------------------- Magnetic hover ------------------------------- */

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseMove={(event) => {
        if (reduced || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / 6;
        const y = (event.clientY - rect.top - rect.height / 2) / 6;
        ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }}
      onMouseLeave={() => {
        if (!ref.current) return;
        ref.current.style.transform = "translate3d(0,0,0)";
      }}
      style={{ transition: reduced ? undefined : "transform 420ms cubic-bezier(.22,1,.36,1)" }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------- Clip reveal ------------------------------- */

export function ClipReveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? undefined : { clipPath: "inset(100% 0 0 0)", opacity: 0.4, scale: 1.04 }}
      whileInView={reduced ? undefined : { clipPath: "inset(0% 0 0 0)", opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------- 3D tilt ------------------------------- */

export function Tilt({ children, className, max = 5 }: { children: ReactNode; className?: string; max?: number }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={cn("h-full [transform-style:preserve-3d]", className)}
      onPointerMove={(event) => {
        if (reduced || !ref.current || event.pointerType !== "mouse") return;
        const rect = ref.current.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        ref.current.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-3px)`;
      }}
      onPointerLeave={() => {
        if (!ref.current) return;
        ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
      }}
      style={{ transition: reduced ? undefined : "transform 340ms cubic-bezier(.22,1,.36,1)" }}
    >
      {children}
    </div>
  );
}
