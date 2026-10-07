# 00 — Product Overview

**Project:** SIH26063 — Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal
**Client:** Ministry of Earth Sciences (MoES), Government of India
**Product name:** **POLARIS** — Polar Outreach & Literary Archive Information System
**Doc status:** Approved for build (auto-mode)

---

## 1. Vision

India runs three permanent Antarctic stations (Maitri, Bharati), an Arctic station (Himadri), a Southern
Ocean program, and the Himansh glaciological facility in the Himalaya. Every one of those programmes
produces expedition reports, technical bulletins, imagery, video logs and datasets — most of which end up
as static PDFs on separate portals, invisible to the public, unsearchable by meaning, and unusable by
communication officers who need to turn them into outreach material.

**POLARIS** is a single, editorially governed pipeline that:

1. **Ingests** polar science material of any media type.
2. **Catalogues** it with automatically extracted metadata and links it to an expedition, a place and a time.
3. **Makes it discoverable** by keyword *and* by meaning (semantic / vector search) across text, image, video and datasets.
4. **Generates outreach content that is citation-locked** — every sentence traceable to the source passage it came from, at three reading levels.
5. **Routes that content through a human editorial workflow** (Draft → Review → Approve → Publish).
6. **Schedules** publication across channels on a calendar.
7. **Reports** on the whole archive and newsroom through a single dashboard.

The result: MoES science becomes publicly legible within hours of an upload, with a verifiable chain of
custody from *raw expedition report* → *published tweet*.

---

## 2. Problem statement

| # | Problem today | POLARIS answer |
|---|---------------|----------------|
| P1 | Polar knowledge is fragmented across NCPOR, MoES, ESSO and station-level archives. | One repository, one catalogue, expedition-first information architecture. |
| P2 | Search is filename-based; nobody can ask *"show me everything about krill biomass decline in the Weddell Sea"*. | Hybrid search: BM25-style keyword score fused with 256-dim vector cosine score, multimodal type filters. |
| P3 | Communication officers manually copy-paste from PDFs and lose the source. | Citation-locked generation: output is composed **only** from the user-selected passage, and each block carries a clickable citation chip back to source + page. |
| P4 | Outreach copy is either too technical or too dumbed-down. | Reading-level selector — public / student / researcher — with per-audience lexicon, sentence length and framing rules. |
| P5 | No editorial control; wrong things get published. | Role-based review queue (Editor, Admin) with explicit state machine and audit trail. |
| P6 | No coordinated publication calendar. | Channel-aware scheduler with drag-to-reschedule. |
| P7 | Leadership has no visibility. | Dashboard with archive stats, pending review load, and an activity feed. |

---

## 3. Target users

See `01-personas.md` for full personas. Summary:

- **Dr. Ananya Rao** — Polar researcher / data depositor.
- **Vikram Mehta** — Science communication officer (the power user of generation).
- **Meera** — 15-year-old student, public visitor, mobile-first.
- **Ar. S. Krishnan** — Editor / outreach lead (approves everything).
- **Sys admin / MoES programme officer** — governance + reporting.

---

## 4. Success metrics

### Prototype (judged in 3 minutes)
- Every flow in the information architecture is **clickable and functional** — no dead buttons.
- Upload → catalogued asset visible in search in **< 3 seconds**.
- Semantic query returns a relevant, highlighted result in the **top 3** for ≥ 80 % of the 12 scripted demo queries.
- Generated content contains **zero** uncited claims (enforced by the grounding verifier, surfaced in the UI).
- Full keyboard operability; visible focus; `prefers-reduced-motion` honoured.

### Production (12 months post-SIH)
| Metric | Target |
|---|---|
| Assets catalogued | 25,000+ legacy documents migrated |
| Time from upload → publishable draft | < 10 minutes (from ~3 days today) |
| Editorial rejection rate for AI-assisted drafts | < 15 % |
| Public sessions / month | 250,000 |
| Avg. search → document open | < 2 clicks |
| Accessibility conformance | WCAG 2.2 AA, verified |
| Lighthouse (prod build) | ≥ 95 Performance / A11y / Best Practices / SEO |

---

## 5. Scope

### In scope (this prototype)
- Full Next.js 15/16 App Router application with Postgres + Drizzle persistence.
- Mock role switcher (Public / Editor / Admin) — real auth is explicitly out of scope for SIH round 2 demo.
- Deterministic local embedding model (`polar-hash-256-v1`) so semantic search works offline.
- Mock grounded-generation adapter with a pluggable LLM adapter interface (OpenAI / Ollama ready).
- Seed corpus: 22 expeditions, 24 reports (with real, chunked passages), 36 images, 12 videos, 7 datasets.

### Out of scope
- Real OAuth / SSO with NIC.
- Real file transcoding, OCR of scanned TIFFs, EXIF geo-flipping.
- Payment, multi-tenancy, CMS-scale CDN distribution.
- Real social publishing (the prototype models the schedule only).

---

## 6. Positioning statement

> **For** the Ministry of Earth Sciences, **POLARIS** is a polar science knowledge repository and media
> dissemination portal **that** turns expedition material into citable, publishable, scheduled outreach
> content. **Unlike** a document library, **POLARIS** guarantees every published sentence is traceable to
> the exact source passage it was generated from.
