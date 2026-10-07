"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronDown,
  Layers,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { PaletteHint } from "@/components/providers";
import { THEME_SCRIPT, ThemeToggle } from "@/components/theme-toggle";
import { ROLE_META, usePolarStore, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/archive", label: "Archive", Icon: Search },
  { href: "/ingest", label: "Ingest", Icon: UploadCloud },
  { href: "/review", label: "Review", Icon: ShieldCheck },
  { href: "/calendar", label: "Calendar", Icon: CalendarDays },
  { href: "/dashboard", label: "Dashboard", Icon: Layers },
];

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 rounded-lg transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-px" aria-label="POLARIS home">
      <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-brand to-aurora text-brand-ink shadow-[var(--shadow-2)]">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z" strokeLinejoin="round" />
          <path d="M12 21.5V12m0 0 8.5-5M12 12 3.5 7" strokeOpacity="0.65" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-[family-name:var(--font-display)] text-[1.0625rem] font-semibold tracking-tight text-ink">
          POLARIS
        </span>
        <span className="mt-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.18em] text-ink-3">
          MoES · SIH26063
        </span>
      </span>
    </Link>
  );
}

function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const role = usePolarStore((s) => s.role);
  const setRole = usePolarStore((s) => s.setRole);
  const hydrated = usePolarStore((s) => s.hydrated);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onClick = () => setOpen(false);
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [open]);

  return (
    <div className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
      >
        <span className="relative flex size-5 items-center justify-center rounded-full bg-brand-soft text-[0.625rem] font-bold text-brand" aria-hidden="true">
          {(hydrated ? ROLE_META[role].label : "Editor").slice(0, 1)}
        </span>
        <span className="hidden sm:inline">{hydrated ? ROLE_META[role].label : "Editor"}</span>
        <ChevronDown className="size-3.5 text-ink-3" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            aria-label="Switch role"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-[var(--shadow-4)]"
          >
            {(Object.keys(ROLE_META) as Role[]).map((id) => (
              <button
                key={id}
                type="button"
                role="menuitemradio"
                aria-checked={hydrated && role === id}
                onClick={() => {
                  setRole(id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-colors",
                  hydrated && role === id ? "bg-brand-soft" : "hover:bg-surface-2",
                )}
              >
                <span className="text-[0.8125rem] font-semibold text-ink">{ROLE_META[id].label}</span>
                <span className="text-[0.6875rem] text-ink-3">{ROLE_META[id].person}</span>
                <span className="text-[0.6875rem] leading-snug text-ink-2">{ROLE_META[id].blurb}</span>
              </button>
            ))}
            <p className="px-3 py-2 text-[0.625rem] leading-snug text-ink-3">
              Prototype auth: roles are switched here and sent as an acting-role header. Production
              replaces this with NIC SSO.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {compact ? null : null}
    </div>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-ink"
      >
        Skip to content
      </a>

      <header className="no-print sticky top-0 z-50 border-b border-line/70 glass">
        <div className="container-polaris flex h-[4.5rem] items-center gap-4">
          <Logo />

          <nav aria-label="Primary" className="ml-4 hidden items-center gap-0.5 lg:flex">
            {NAV.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-[0.8125rem] font-medium transition-colors",
                    active ? "text-brand" : "text-ink-2 hover:text-ink",
                  )}
                >
                  {label}
                  {active ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2 -bottom-[13px] h-[2px] rounded-full bg-brand"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <PaletteHint className="hidden md:inline-flex" />
            <ThemeToggle />
            <RoleSwitcher />
            <Link
              href="/archive"
              className="hidden items-center gap-2 rounded-xl bg-brand px-3.5 py-2 text-[0.8125rem] font-semibold text-brand-ink shadow-[var(--shadow-2)] transition-[filter] hover:brightness-110 sm:inline-flex"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              Explore
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-2 lg:hidden"
            >
              {menuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.nav
              id="mobile-nav"
              aria-label="Primary mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-line bg-surface lg:hidden"
            >
              <ul className="container-polaris flex flex-col gap-1 py-3">
                {NAV.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                        pathname === href ? "bg-brand-soft text-brand" : "text-ink-2 hover:bg-surface-2",
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>

      <main id="main" className="min-h-[60vh]">
        {children}
      </main>

      <footer className="no-print mt-24 border-t border-line bg-surface/60">
        <div className="container-polaris grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-2">
              Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal —
              a prototype built for Smart India Hackathon problem statement SIH26063, Ministry of Earth
              Sciences, Government of India.
            </p>
            <p className="mt-4 text-[0.6875rem] text-ink-3">
              Content is illustrative seed data modelled on India&apos;s Antarctic, Arctic, Southern Ocean
              and Himalayan research programmes.
            </p>
          </div>
          <div>
            <p className="label-micro mb-3">Product</p>
            <ul className="space-y-2 text-sm text-ink-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline transition-colors hover:text-brand">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/#pipeline" className="link-underline transition-colors hover:text-brand">
                  How it works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="label-micro mb-3">Documentation</p>
            <ul className="space-y-2 text-sm text-ink-2">
              <li>
                <Link href="/api/health" className="link-underline transition-colors hover:text-brand">
                  Service health
                </Link>
              </li>
              <li>PRDs in /docs (10 files)</li>
              <li>WCAG 2.2 AA target</li>
              <li>Licence: CC-BY-4.0</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line py-5">
          <p className="container-polaris text-[0.6875rem] text-ink-3">
            © {new Date().getFullYear()} Ministry of Earth Sciences, Government of India · Prototype for
            SIH26063 · Built with Next.js, Drizzle and PostgreSQL
          </p>
        </div>
      </footer>
    </>
  );
}
