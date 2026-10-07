# 06 — Tech Stack

## Runtime

| Layer | Choice | Version (installed) | Why |
|---|---|---|---|
| Framework | Next.js (App Router, Node runtime) | `16.2.6` | Server components for DB-bound pages, route handlers for the API, one deploy artifact. |
| UI runtime | React | `19.2.6` | Required by Next 16; supports `useOptimistic`, transitions. |
| Language | TypeScript | `5.9.3` | `strict: true`, **zero `any`** in `src/`. |
| Package manager | npm | bundled | Sandbox default. |

## Data

| Layer | Choice | Version | Why |
|---|---|---|---|
| Database | PostgreSQL | 15 | Mandated by the platform; production-ready. |
| ORM | Drizzle ORM | `0.45.2` | Typed schema as code, no codegen step, SQL-shaped. |
| Driver | `pg` + `drizzle-orm/node-postgres` | `8.20.2` | Pooled, singleton across HMR. |
| Migrations | `drizzle-kit` | `0.31.10` | `npx drizzle-kit push` for the prototype. |
| Vector store | `jsonb` embedding + in-Node cosine | – | pgvector binary unavailable in this sandbox; see `04-architecture.md` §7 for the drop-in upgrade. |

## Styling & UI

| Layer | Choice | Version | Why |
|---|---|---|---|
| CSS | Tailwind CSS v4 (`@import "tailwindcss"` + `@theme`) | `4.1.17` | Zero-config tokens, no `tailwind.config.js` needed, CSS-first theming. |
| PostCSS | `@tailwindcss/postcss` | `8.5.8` | Tailwind v4 pipeline. |
| Primitives | Hand-rolled shadcn-style components (`src/components/ui/*`) | – | Same API surface as shadcn/ui, but no CLI dependency and full control of a11y. |
| Icons | `lucide-react` | latest | Tree-shaken, 1.5 px stroke, consistent. |
| Utilities | `clsx` + `tailwind-merge` | latest | `cn()` helper. |
| Fonts | Fraunces + Inter via `<link>` + `font-display: swap` | variable | No build-time font fetch → the build can never fail on a network hiccup; system fallback stack if offline. |

## Motion

| Layer | Choice | Version | Why |
|---|---|---|---|
| Smooth scroll | Lenis | latest | Buttery inertial scroll, ScrollTrigger-integrated. |
| Scroll animation | GSAP + ScrollTrigger | latest | Pinned hero sequence, parallax, staggered reveals. |
| Component motion | Framer Motion | `12.x` | Layout animations, `AnimatePresence`, drag for the calendar. |
| Reduced motion | native `matchMedia` + CSS | – | Single source of truth in `usePrefersReducedMotion()`. |

## State & data fetching

| Layer | Choice | Version | Why |
|---|---|---|---|
| Client state | Zustand | latest | Role, theme preference, current selection. 1 kB, no provider. |
| Server state | TanStack Query | `latest` (v5) | Mutations, invalidation, retries, loading states. |
| Dates | date-fns | latest | Timezone-safe formatting, no moment. |

## Services & adapters

| Concern | Prototype | Production swap |
|---|---|---|
| Embeddings | `polar-hash-256-v1` in-process | `bge-m3` / CLIP behind an inference URL |
| Generation | `MockGroundedAdapter` | `OpenAIChatAdapter` (`OPENAI_API_KEY`) or `OllamaAdapter` (`OLLAMA_BASE_URL`) — both implemented, selected at runtime |
| Auth | `x-polaris-role` header | NextAuth + NIC SSO |
| Storage | in-DB metadata + `/public/uploads` | S3 presigned uploads |

## Testing

| Layer | Choice | Status |
|---|---|---|
| Unit / integration | Vitest | Config + suites for embeddings, RRF fusion, grounding verifier, draft state machine (`09-testing.md`). |
| E2E | Playwright | Scripted judge walkthrough mirroring `DEMO.md`. |
| Types | `tsc --noEmit` | Strict, part of the final gate. |
| Lint | `eslint-config-next` | Clean. |
| Build gate | `next typegen && tsc --noEmit && next build` | Must pass before ship. |

## Tooling notes

- `NODE_ENV=production` build; DB access pages are `dynamic = 'force-dynamic'` so the build never needs a
  live database.
- Seeding is **idempotent and lazy**: `ensureSeeded()` runs on first repository access and inserts the
  corpus only if `expeditions` is empty. A fresh Postgres bootstraps itself.
- No `use client` on pages that don't need it; the initial payload for `/dashboard` and `/archive/[slug]`
  is server-rendered HTML.
