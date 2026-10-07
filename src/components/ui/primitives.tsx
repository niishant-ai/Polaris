"use client";

import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn, type Tone } from "@/lib/utils";

/* ------------------------------- Button ------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "btn-glow bg-brand text-brand-ink hover:brightness-110 active:brightness-95 shadow-[var(--shadow-2)] border border-transparent",
  secondary:
    "bg-surface text-ink border border-line hover:border-line-strong hover:bg-surface-2",
  ghost: "bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink border border-transparent",
  danger: "bg-danger-soft text-danger border border-[color-mix(in_oklab,var(--danger)_35%,transparent)] hover:bg-danger hover:text-white",
};

/* 44px minimum target on touch (WCAG 2.5.8), compact from sm up */
const SIZES: Record<ButtonSize, string> = {
  sm: "tap-target h-11 px-3.5 text-[0.8125rem] gap-1.5 rounded-lg sm:h-9 sm:px-3",
  md: "tap-target h-11 px-4 text-sm gap-2 rounded-xl sm:h-10",
  lg: "tap-target h-12 px-6 text-[0.9375rem] gap-2.5 rounded-xl",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center font-medium transition-all duration-200 ease-[cubic-bezier(.22,1,.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {loading ? (
        <span
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

/* ------------------------------- Badge ------------------------------- */

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2 border-line",
  brand: "bg-brand-soft text-brand border-[color-mix(in_oklab,var(--brand)_28%,transparent)]",
  aurora: "bg-aurora-soft text-aurora border-[color-mix(in_oklab,var(--aurora)_30%,transparent)]",
  warn: "bg-warn-soft text-warn border-[color-mix(in_oklab,var(--warn)_30%,transparent)]",
  danger: "bg-danger-soft text-danger border-[color-mix(in_oklab,var(--danger)_30%,transparent)]",
  ice: "bg-ice-soft text-ice border-[color-mix(in_oklab,var(--ice)_30%,transparent)]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  title,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------- Card ------------------------------- */

export function Card({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "li";
}) {
  return (
    <As
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-[var(--shadow-1)]",
        className,
      )}
    >
      {children}
    </As>
  );
}

/* ------------------------------- Section heading ------------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="label-micro mb-3">{eyebrow}</p> : null}
        <h2 className="text-[clamp(1.75rem,3vw,2.375rem)] leading-[1.08] text-ink">{title}</h2>
        {description ? (
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink-2">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------- Stat ------------------------------- */

export function Stat({
  label,
  value,
  hint,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="label-micro">{label}</p>
      <p
        className={cn(
          "mt-2 font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.25rem)] leading-none font-light tnum",
          tone === "danger" ? "text-danger" : tone === "aurora" ? "text-aurora" : "text-ink",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-ink-3">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------- Score bar ------------------------------- */

export function ScoreBar({
  value,
  label,
  tone = "aurora",
}: {
  value: number;
  label: string;
  tone?: "aurora" | "brand" | "danger";
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const bg =
    tone === "danger" ? "bg-danger" : tone === "brand" ? "bg-brand" : "bg-aurora";
  return (
    <div>
      <div className="flex items-center justify-between text-[0.6875rem] text-ink-3">
        <span>{label}</span>
        <span className="tnum">{pct}%</span>
      </div>
      <div
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} ${pct} percent`}
      >
        <motion.div
          className={cn("h-full rounded-full", bg)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

/* ------------------------------- Empty state ------------------------------- */

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
      <div className="mb-5 text-ink-3">{icon ? icon : <PolarIllustration />}</div>
      <p className="font-[family-name:var(--font-display)] text-lg text-ink">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-2">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* ------------------------------- Skeleton ------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} aria-hidden="true" />;
}

/* ------------------------------- Tabs ------------------------------- */

export function TabBar<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="scroll-x flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1"
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative shrink-0 rounded-lg px-3.5 py-2 text-[0.8125rem] font-medium transition-colors",
              active ? "text-brand" : "text-ink-2 hover:text-ink",
            )}
          >
            {active ? (
              <motion.span
                layoutId={`tab-${ariaLabel}`}
                className="absolute inset-0 rounded-lg bg-brand-soft"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
            ) : null}
            <span className="relative flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined ? (
                <span className="tnum text-[0.6875rem] text-ink-3">{tab.count}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* --------------------- polar empty-state illustration --------------------- */

export function PolarIllustration({ variant = "aurora" }: { variant?: "aurora" | "ice" | "penguin" }) {
  return (
    <svg
      viewBox="0 0 120 72"
      className="h-[4.5rem] w-full max-w-[13rem]"
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pgAurora" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--aurora-fill)" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="pgIce" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--surface-3)" />
          <stop offset="100%" stopColor="var(--surface)" />
        </linearGradient>
      </defs>
      {variant === "aurora" ? (
        <>
          <path d="M8 52C22 22 38 16 54 20s22 14 30 10 20-16 28-18" fill="none" stroke="url(#pgAurora)" strokeWidth="7" strokeLinecap="round" />
          <path d="M12 60c14-24 30-28 46-24s20 12 28 8" fill="none" stroke="url(#pgAurora)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </>
      ) : null}
      {variant === "penguin" ? (
        <>
          <ellipse cx="60" cy="46" rx="15" ry="20" fill="var(--ink)" opacity="0.85" />
          <ellipse cx="60" cy="50" rx="9" ry="13" fill="var(--surface)" />
          <circle cx="55" cy="34" r="2" fill="var(--surface)" />
          <circle cx="65" cy="34" r="2" fill="var(--surface)" />
          <path d="M56 40h8l-4 5z" fill="var(--aurora-fill)" />
        </>
      ) : null}
      <path d="M0 68h120" stroke="var(--line)" strokeWidth="1" />
      <path d="M18 68l10-10 8 6 9-12 11 16z" fill="url(#pgIce)" stroke="var(--line)" />
      <path d="M72 68l9-8 7 5 10-9 10 12z" fill="url(#pgIce)" stroke="var(--line)" opacity="0.85" />
    </svg>
  );
}
