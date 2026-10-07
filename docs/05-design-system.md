# 05 — Design System — "Glacier Editorial"

The aesthetic reference set is **Nature**, **NASA Climate**, **ISRO**, and **Stripe Docs**: editorial
restraint, scientific precision, generous whitespace, one moment of spectacle (the aurora).

---

## 1. Colour

### Light — "Snow Lab" (default)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#f6f9fc` | Page |
| `--surface` | `#ffffff` | Cards |
| `--surface-2` | `#eef4f9` | Nested panels, table headers |
| `--ink` | `#08192b` | Primary text |
| `--ink-2` | `#42596e` | Secondary text |
| `--ink-3` | `#7a8fa3` | Tertiary / captions |
| `--line` | `#d5e0ea` | Hairline borders |
| `--brand` | `#0b5f9e` | Primary action (deep ice blue) |
| `--aurora` | `#0f9e8e` | Accent, semantic mode, success |
| `--ice` | `#69c4f2` | Highlights, selection |
| `--glow` | `#b8e6ff` | Aurora bloom |
| `--warn` | `#b4700c` | Pending review |
| `--danger` | `#b3261e` | Reject / unsupported claim |

### Dark — "Midnight Ocean" (OLED-friendly)
| Token | Value |
|---|---|
| `--bg` | `#04080f` |
| `--surface` | `#0a1422` |
| `--surface-2` | `#0f1d2f` |
| `--ink` | `#e8f2fb` |
| `--ink-2` | `#a3b8c9` |
| `--ink-3` | `#6d8296` |
| `--line` | `#1a2c40` |
| `--brand` | `#5cc4ff` |
| `--aurora` | `#2ee6c0` |
| `--ice` | `#8ad8ff` |
| `--glow` | `#0a3a4a` |
| `--warn` | `#f0b34a` |
| `--danger` | `#ff7a72` |

Contrast: every text token on its intended background clears **WCAG 2.2 AA (4.5:1 body, 3:1 large)** in
both themes — verified in `08-accessibility.md`.

Glass tokens: `--glass` = `color-mix(in oklab, var(--surface) 72%, transparent)` with a
`backdrop-filter: blur(18px) saturate(140%)` and a 1 px `--line` top highlight — used only on the top bar,
the floating selection toolbar, and the command palette (three places, never more).

---

## 2. Typography

- **Display / serif:** *Fraunces* (variable, `opsz` 9–144, weights 300–900) — headlines, big numerals, pull-quotes. It has a scientific-editorial warmth that Inter lacks.
- **Text / sans:** *Inter* (variable) — UI, body, tables, code.
- **Mono:** `ui-monospace, SFMono-Regular, Menlo` — IDs, coordinates, scores.

### Scale (fluid, `clamp()`)
| Role | Size | Weight / tracking |
|---|---|---|
| Display XL | `clamp(2.75rem, 7vw, 5.25rem)` | 620 / `-0.03em` / lh 0.98 |
| Display L | `clamp(2.25rem, 4.6vw, 3.5rem)` | 560 / `-0.02em` / lh 1.04 |
| Heading 1 | `clamp(1.75rem, 3vw, 2.25rem)` | 600 / `-0.01em` |
| Heading 2 | `1.375rem` | 620 |
| Heading 3 | `1.0625rem` | 620 |
| Body L | `1.1875rem` / lh 1.65 | 400 |
| Body | `0.9875rem` / lh 1.62 | 400 |
| Small | `0.875rem` | 450 |
| Micro / label | `0.6875rem` | 600 / `+0.12em` uppercase |
| Numeral (stat) | `clamp(2.25rem, 4vw, 3.25rem)` | 300 (Fraunces) |

Max measure: **68 ch** for prose, 90 ch for UI text. Never centre more than 3 lines of body copy.

---

## 3. Spacing & layout

4 px base grid; the working set is `1 / 2 / 3 / 4 / 6 / 8 / 12 / 16 / 24 / 32`.
Section rhythm: `padding-block: clamp(4rem, 9vh, 8rem)`.
Container: `max-width: 1240px`, gutter `clamp(1.25rem, 4vw, 3rem)`.
Radii: `--r-sm 8px`, `--r-md 14px`, `--r-lg 22px`, `--r-xl 32px`, `--r-pill 999px`.
Elevation: 5-step shadow scale using the theme's own ink at 6–14 % opacity (never pure black).
Focus ring: `2px` `--brand` offset `3px` + an inner `1px` surface ring — always visible, never removed.

---

## 4. Motion tokens

| Token | Value | Use |
|---|---|---|
| `--dur-1` | 120 ms | Hover, focus, colour |
| `--dur-2` | 220 ms | Tooltips, chips, tabs |
| `--dur-3` | 420 ms | Cards, drawers, page transitions |
| `--dur-4` | 720 ms | Hero sequences, pinned sections |
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` | Default (exponential-ish decel) |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | Position moves |
| `--ease-spring` | `framer-motion spring {stiffness:210, damping:26}` | Layout shifts, drag settle |

Rules:
1. **Only `transform` and `opacity`** animate. Layout-triggering properties are swapped for transform.
2. Every animated element gets `will-change: transform` for the duration of the animation only.
3. GSAP ScrollTrigger reveals are `y: 28 → 0` + `opacity 0 → 1` + a 6 % blur-out; stagger 70 ms.
4. Parallax amplitude is capped at ±10 % of viewport height.
5. Hero aurora canvas runs at a fixed 60 fps budget, pauses on `visibilitychange`, and is disabled
   entirely under `prefers-reduced-motion`.
6. Reduced motion: `--dur-*` collapse to 1 ms; Lenis is not mounted; GSAP timelines are replaced by
   `gsap.set()` equivalents.

---

## 5. Components

| Component | Notes |
|---|---|
| `Button` | 4 variants (primary / secondary / ghost / danger), 3 sizes, loading state with spinner, icon slot. |
| `Card` | Surface + hairline + hover lift (`translateY(-3px)` + shadow step 3) |
| `Badge` | Status, kind, region, channel colour coding |
| `Tabs` | Roving-tabindex, `role="tablist"`, arrow-key navigation |
| `Chip` | Filter toggle, removable, `aria-pressed` |
| `Input / Select` | Labelled, `aria-describedby` hint + error |
| `Dialog` | Focus trap, `Escape` to close, restore focus on close |
| `Toast` | `role="status"`, auto-dismiss 5 s, `aria-live="polite"` region |
| `Snippet` | `<mark>` highlight with `--ice` at 30 % and 2 px ink underline |
| `CitationChip` | Superscript number, hover preview card with source excerpt + page |
| `Dropzone` | Dashed hairline, drag-over glow, file list with per-file progress |
| `ScoreBar` | 4 px bar, `--aurora` fill, text value for screen readers |
| `EmptyState` | Illustration (inline SVG) + headline + action |
| `Skeleton` | Shimmer at 8 % ink, respects reduced motion |

---

## 6. The one spectacle

The landing hero carries a **canvas aurora field**: three additive gradient ribbons driven by a
low-frequency sine field, blended `screen` over a deep-navy base, with a fine grain overlay at 4 % to kill
banding. It is the only decorative animation on the site, it never carries information, and it is the
first thing disabled under reduced motion.
