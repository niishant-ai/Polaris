# POLARIS — SIH26063

**Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal**
Ministry of Earth Sciences, Government of India · Smart India Hackathon problem statement **SIH26063**

> One repository for India's polar science. Search it by meaning, turn any paragraph into
> **citation-locked** outreach copy, and publish it through a governed editorial workflow.

---

## 1. What this is

A fully working fullstack prototype — not a landing page. Every flow below is clickable and writes to
PostgreSQL:

| Flow | Route | What actually happens |
|---|---|---|
| Cinematic landing | `/` | GSAP-pinned pipeline sequence, parallax aurora hero, animated counters |
| Ingest & catalogue | `/ingest` | Drag/drop → simulated upload pipeline → automatic metadata extraction → editable card → committed to Postgres with passages + embedding |
| Archive, timeline, map | `/archive` | Hybrid search, multimodal filters, highlighted snippets, polar projection map, decade timeline |
| Document viewer + studio | `/archive/[publicId]` | Select text or a passage → citation-locked generation at 3 reading levels → grounding verifier → submit for review |
| Editorial review queue | `/review` | Draft → In review → Approved → Published, role-gated, note-required rejections, audit trail |
| Publication calendar | `/calendar` | Drag-to-reschedule (plus keyboard equivalents), channel colours, conflict detection |
| Dashboard | `/dashboard` | KPIs, archive growth, composition, pending reviews, activity feed, editorial funnel |

Full product documentation lives in [`/docs`](./docs) (10 PRD files).
Judge walkthrough script: [`DEMO.md`](./DEMO.md).

---

## 2. The one thing that matters: citation locking

Most "AI outreach" demos generate plausible text and hope it is right. POLARIS does the opposite.

1. The generation endpoint requires a `passageId`. Without it the API returns
   `422 citation_source_required` and the adapter is never called.
2. The adapter (`src/lib/generate.ts`) receives **only** that passage — there is no code path that
   passes the wider document.
3. A model-agnostic verifier then checks every returned block: it must carry a citation id, that
   citation must resolve to the passage, every number must appear in the source, and content-word
   recall must clear a threshold. Anything that fails is flagged **"needs human review"** in red.
4. Nothing is published without a human editor, and only the Admin role can publish.

You can prove it in the UI: open a report, select a paragraph, generate, then click a citation chip —
the page scrolls to and flashes the exact source paragraph.

---

## 3. Semantic search without a GPU

`polar-hash-256-v1` (`src/lib/embeddings.ts`) is a deterministic, dependency-free embedding model:

1. NFKC normalise → lowercase → strip punctuation → drop stop-words.
2. Expand every token against a **30-group polar science thesaurus** (krill ≈ crustacean ≈ zooplankton,
   ice sheet ≈ glacier ≈ cryosphere, black carbon ≈ soot ≈ aerosol …). This is what makes it *semantic*.
3. Hash tokens **and bigrams** into 256 signed buckets with sublinear TF weighting, then L2-normalise.

Cosine similarity is a dot product. Keyword ranking (field-weighted: title 3.2 / tags 2.6 /
description 1.6 / body 1.0) and the semantic ranking are fused with **Reciprocal Rank Fusion (k = 60)**.
The UI shows both contributions per result, so the ranking is explainable.

Try `how does melting ice affect krill` — no document contains those words together, and the krill
report still ranks first.

pgvector is not installed in this sandbox, so vectors live in a `jsonb` column and cosine runs in Node.
The swap is one function — see `docs/04-architecture.md` §7.

---

## 4. Tech stack

- **Next.js 16 (App Router) + React 19 + TypeScript strict, zero `any`**
- **Tailwind CSS v4** with CSS custom properties (`@theme inline`) for a light/dark/system theme engine
- **Drizzle ORM + PostgreSQL** (7 tables, indexes, idempotent lazy seed)
- **Framer Motion** (component + route transitions, layout animations), **GSAP + ScrollTrigger**
  (pinned pipeline, parallax), **Lenis** (smooth scroll)
- **Zustand** (role, palette), **TanStack Query** (server state, mutations, invalidation)
- **lucide-react**, **date-fns**, `clsx` + `tailwind-merge`

### Adapters (pluggable, no vendor lock)
- Generation: `mock` (default, offline, deterministic) → `openai` (uses `OPENAI_API_KEY`) → `ollama`
  (uses `OLLAMA_BASE_URL`). Any adapter failure falls back to mock, so the demo can never break.
- Embeddings: `polar-hash-256-v1` → `bge-m3` / CLIP behind an inference URL in production.

---

## 5. Running it

```bash
npm install
# DATABASE_URL is read from .env
npx drizzle-kit push     # create the 7 tables
npm run build && npm start   # or: npm run dev
```

The corpus seeds itself. On the first repository read, `ensureSeeded()` populates:

- **22 expeditions** — IAE-26 → IAE-43, Himadri (Arctic), 3 Southern Ocean cruises, Himansh/Gangotri (Himalaya)
- **24 expedition reports** with 72 real, chunked, page-anchored passages
- **36 images**, **12 videos**, **7 datasets**
- **10 drafts** generated at seed time by the real generation engine, spread across all five editorial states
- **10 audit-log entries** and 3 scheduled channel posts

Health check: `GET /api/health` → `{"ok":true,"data":{"status":"ok","db":"up"}}`

---

## 6. API contract

All responses are `{ ok: true, data }` or `{ ok: false, error: { code, message } }`.
The acting role is sent as the `x-polaris-role` header by the role switcher (mock auth).

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | service + DB health |
| `GET` `POST` | `/api/assets` | list (filters) / ingest |
| `GET` | `/api/assets/:publicId` | asset + passages + related |
| `POST` | `/api/search` | `{ query, mode, kinds[], region, yearFrom, yearTo }` → ranked results with scores + snippet |
| `POST` | `/api/generate` | `{ passageId, format, audience }` → citation-locked draft + grounding report |
| `GET` `POST` | `/api/drafts` | queue / save draft |
| `PATCH` | `/api/drafts/:id` | `{ event: submit\|approve\|reject\|request_changes\|publish, note?, channel? }` |
| `GET` `POST` | `/api/schedule` | calendar / create item |
| `PUT` | `/api/schedule/:id` | reschedule |
| `GET` | `/api/stats`, `/api/activity` | dashboard |

Error codes: `bad_request` · `not_found` · `role_forbidden` · `citation_source_required` ·
`note_required` · `invalid_transition`.

---

## 7. Accessibility (WCAG 2.2 AA)

- Skip link, semantic landmarks, one `h1` per route, strictly nested headings.
- Visible 2 px focus ring on every focusable element; `scroll-margin-top` on every `id` target so focus
  is never obscured by the sticky bar (**2.4.11**).
- Calendar drag has keyboard equivalents (**2.5.7**); all targets ≥ 24 px (**2.5.8**); consistent help
  position (**3.2.6**).
- `aria-live="polite"` on search counts, upload progress, generation status, reschedule confirmations;
  `role="alert"` on errors.
- Full `prefers-reduced-motion` path: Lenis is never mounted, GSAP timelines collapse, Framer Motion
  variants go to zero duration, aurora renders a static frame, skeletons stop shimmering.
- Contrast verified for both themes; status is never colour-only.

---

## 8. Repository map

```
docs/                     10 PRD files (overview → testing)
src/app/                  routes: /, /archive, /archive/[publicId], /ingest, /review, /calendar, /dashboard
src/app/api/              11 route handlers
src/components/           ui primitives, motion kit, landing, archive, ingest, review, calendar
src/data/                 seed corpus (expeditions, reports, media, drafts, activity)
src/db/                   Drizzle schema + idempotent seeder
src/lib/                  embeddings, search (RRF), extract, generate (adapters + verifier),
                          draft-state machine, repositories, api helpers, store
```

## 9. Known prototype boundaries

Documented honestly in `docs/07-roadmap.md` §Phase 9: real auth (NIC SSO), real file storage (S3
presigned), OCR for scanned PDFs, real social publishing, pgvector ANN index, and multilingual output.
Everything else in the PRD is implemented.
