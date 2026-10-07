# 07 — Roadmap

## Phase 0 — PRDs & decisions (Day 0) ✅
All ten documents in `/docs`. Key decisions logged:
- D1 — Name: **POLARIS**.
- D2 — Editorial "Glacier" design system, light-default, OLED dark.
- D3 — Postgres + Drizzle (not SQLite) even for the prototype, because the platform provides it and the
  prod schema is the deliverable.
- D4 — pgvector unavailable → `jsonb` vectors + in-Node cosine behind a repository seam.
- D5 — Deterministic offline embedding (`polar-hash-256-v1`) so semantic search never fails in a demo.
- D6 — Citation locking enforced by **request shape**, not prompt instructions.
- D7 — Mock auth via role header; the switcher lives in the top bar so judges can see role-gating live.
- D8 — Fraunces + Inter, loaded via `<link>` (build never depends on a font CDN).

## Phase 1 — Foundation (Day 1)
- Design tokens, `@theme` mapping, light/dark/system theme engine with no-flash inline script. ✅
- Tailwind v4 wiring, `cn()` utility, UI primitives. ✅
- DB schema, repositories, idempotent seed. ✅
- App shell: top bar, role switcher, command palette, footer, Lenis provider. ✅

## Phase 2 — Landing & motion (Day 1–2)
- Cinematic hero with canvas aurora. ✅
- GSAP pinned "pipeline" sequence, parallax bands, stat counters. ✅
- Framer Motion route transitions + micro-interactions. ✅

## Phase 3 — Ingestion (Day 2)
- Dropzone, validation, simulated pipeline, metadata extraction, editable cards, commit to archive. ✅

## Phase 4 — Archive & search (Day 2–3)
- Grid / timeline / map views, filters. ✅
- Hybrid search API, highlighted snippets, explainability panel, multimodal filters. ✅

## Phase 5 — Viewer & generation (Day 3)
- Reading pane, selection toolbar, passage anchors. ✅
- Citation-locked generation, audiences, grounding verifier, citation chips. ✅

## Phase 6 — Editorial workflow (Day 4)
- Review queue, split view, role-gated transitions, audit trail. ✅
- Scheduling calendar, drag-to-reschedule, channel conflicts. ✅

## Phase 7 — Dashboard & polish (Day 4)
- KPIs, growth sparkline, pending list, activity feed. ✅
- Empty/loading/error states across every surface. ✅

## Phase 8 — Quality gate (Day 5)
- Accessibility pass (see `08-accessibility.md`). ✅
- `next typegen` + `tsc --noEmit` + `next build` + healthcheck. ✅
- `README.md` + `DEMO.md`. ✅

## Phase 9 — Post-SIH productionisation (Weeks 2–12)
| Milestone | Scope | Exit criteria |
|---|---|---|
| M1 · Auth & tenancy | NIC SSO, MoES directory roles, org model | 20 pilot users, SSO login |
| M2 · Vector infra | pgvector + HNSW, `bge-m3` embeddings, CLIP for images | p95 search < 400 ms on 25k assets |
| M3 · Real ingest | S3 presigned multipart, PDF text extraction, OCR adapter, EXIF geotag | 1 GB video + 300-page PDF ingestible |
| M4 · Real generation | Azure OpenAI with the same verifier, Hindi/Tamil audiences | Grounding score ≥ 0.9 on 95 % of outputs |
| M5 · Publishing | Channel connectors, analytics ingestion | Auto-publish + performance report |
| M6 · Migration | Legacy NCPOR/MoES back-catalogue ETL | 25,000 documents catalogued |
| M7 · Certification | WCAG 2.2 AA audit, GIGW compliance, security review | Signed audit report |

## Risks & mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| LLM hallucination in outreach copy | High (brand + scientific integrity) | Citation locking by request shape + model-agnostic grounding verifier + human approval gate |
| Scanned PDFs with no text layer | Medium | OCR adapter interface, "needs OCR" status, human task queue |
| Corpus too small for good retrieval | Medium | Synonym expansion in the embedding model + RRF fusion; production uses real embeddings |
| Polar jargon alienating the public | Medium | Reading-level selector with a jargon dictionary; plain-language glossary chips |
| Scope creep toward a general CMS | High | The editorial state machine is fixed at 5 states; nothing else enters the workflow |
