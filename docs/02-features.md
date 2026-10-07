# 02 — Feature List (MoSCoW)

## M — Must have (all implemented in this prototype)

### F1 · Ingestion & Cataloguing
- **F1.1** Drag-and-drop dropzone (reports / images / videos / datasets) with click-to-browse fallback.
- **F1.2** Client-side validation: accepted MIME types, max size, duplicate name warning.
- **F1.3** Simulated upload progress with per-file states (queued → uploading → extracting → catalogued).
- **F1.4** **Automatic metadata extraction**: title from filename or first heading, expedition match by year/keyword, media kind, year, tag inference from token overlap with taxonomy, language, size, page count.
- **F1.5** Editable metadata card per file before commit; "Extracted with n % confidence" badge.
- **F1.6** Persisted to Postgres via `/api/assets` with an activity-log entry and auto-generated passages + embedding.
- **F1.7** Post-ingest toast with a deep link to the new asset page.

### F2 · Archive, Timeline & Map
- **F2.1** Archive grid with kind badges (report / image / video / dataset), year, region, tags.
- **F2.2** **Timeline view** — expeditions on a horizontal/vertical chronological scrubber with expandable asset counts.
- **F2.3** **Map view** — projected polar scatter map (SVG, equirectangular with polar emphasis) with station pins, expedition markers, hover tooltips, keyboard-focusable pins.
- **F2.4** Filters: region, expedition, year range, kind, tags.

### F3 · Search
- **F3.1** Keyword search (tokenized, stop-worded, field-weighted: title > tags > body).
- **F3.2** **Semantic search** — 256-dim deterministic embedding, cosine similarity, fused with keyword score (Reciprocal Rank Fusion, k=60).
- **F3.3** Multimodal filters: text / image / video / dataset (multi-select).
- **F3.4** **Highlighted snippets** with `<mark>` on matched tokens and the best-matching passage.
- **F3.5** Mode toggle (Keyword / Semantic / Hybrid) with a live explanation of the ranking.
- **F3.6** Empty, loading, no-results and error states, all designed.
- **F3.7** Recent + suggested queries.

### F4 · Document Viewer
- **F4.1** Reading pane with heading-structured passages and page anchors.
- **F4.2** **Text selection → floating action bar** ("Generate from selection").
- **F4.3** Highlighted source text preserved in the draft (the "ground truth" excerpt).
- **F4.4** Asset metadata sidebar: expedition, station, coordinates, licence, author, related assets.
- **F4.5** Citation chips in generated content deep-link back to `#passage-{id}` with scroll + flash.

### F5 · Citation-Locked Content Generation
- **F5.1** Generates **only** from the selected passage — the adapter receives no other body text.
- **F5.2** Formats: Website story, Social post, Explainer card, Newsletter blurb.
- **F5.3** **Reading-level selector**: public / student / researcher.
- **F5.4** Structured output: headline, dek, content blocks (paragraph / pull-quote / stat / bullets), hashtags, citations.
- **F5.5** Inline citations rendered as numbered chips linked to source passage + page.
- **F5.6** **Grounding verifier**: every output block must map to ≥ 1 citation; unsupported blocks are flagged red and marked "needs human review".
- **F5.7** Pluggable adapter: `MockGroundedAdapter` (default, deterministic, offline) / `OpenAIChatAdapter` (reads `OPENAI_API_KEY`) / `OllamaAdapter` (reads `OLLAMA_BASE_URL`). Automatic fallback to mock on any adapter error.
- **F5.8** Editing the draft body inline before submitting for review.
- **F5.9** "Copy with citations" and "Copy markdown" actions.

### F6 · Editorial Review Queue
- **F6.1** State machine: `draft → in_review → approved → published` (+ `rejected`), with role-gated transitions.
- **F6.2** Split view: draft left, source passage right, citations clickable.
- **F6.3** Editor: approve / request changes / reject with mandatory note on reject.
- **F6.4** Admin-only: publish (creates a scheduled item + activity entry).
- **F6.5** Queue filters (status, audience, channel) and counts.
- **F6.6** Full audit trail per draft (who, what, when, note).

### F7 · Scheduling Calendar
- **F7.1** Month calendar with channel-coloured scheduled items.
- **F7.2** **Drag to reschedule** (mouse + keyboard alternative via "shift day" buttons — a11y requirement).
- **F7.3** Unscheduled approved items in a side tray, draggable onto a day.
- **F7.4** Conflict detection: > 3 items on a channel/day warns.
- **F7.5** List/agenda view toggle.

### F8 · Dashboard
- **F8.1** KPI cards (assets by kind, expeditions, drafts by status, avg. grounding score).
- **F8.2** Pending reviews list with quick approve.
- **F8.3** Recent activity feed.
- **F8.4** Archive growth sparkline (CSS/SVG, no chart lib).

### F9 · Experience platform
- **F9.1** Light / dark / system theme, persisted in `localStorage`, no flash (inline script + `data-theme`).
- **F9.2** Lenis smooth scroll, GSAP ScrollTrigger reveals + parallax + pinned hero, Framer Motion component/page transitions.
- **F9.3** `prefers-reduced-motion` → all animation suppressed, replaced by instant state.
- **F9.4** Role switcher persisted in Zustand.
- **F9.5** Cinematic landing page with an aurora canvas field (CSS + canvas, 60 fps, GPU-only transforms).

## S — Should have (implemented)
- **S1** Related-asset recommendations by vector neighbour.
- **S2** Search explainability panel (keyword vs semantic contribution per result).
- **S3** Activity log with actor + role.
- **S4** Keyboard command palette (`⌘K`) for archive jump.
- **S5** Reading progress bar in the document viewer.

## C — Could have (stubbed / documented)
- **C1** OCR of scanned PDFs (adapter interface present).
- **C2** EXIF → map auto-geotagging.
- **C3** Real social publishing + analytics ingestion.
- **C4** Multilingual generation (Hindi / Tamil) — lexicon scaffold present.
- **C5** pgvector ANN index (see `04-architecture.md` §7).

## W — Won't have (this prototype)
- **W1** Real authentication / NIC SSO.
- **W2** Multi-tenant organisation management.
- **W3** Video transcoding pipeline.
- **W4** Offline-first PWA sync.
