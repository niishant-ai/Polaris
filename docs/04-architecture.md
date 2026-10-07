# 04 — Architecture & Data Model

## 1. System shape

```
┌──────────────────────── Browser (React 19, client components) ────────────────────────┐
│  Zustand (role, theme, selection)  ·  TanStack Query (server state)  ·  Lenis          │
│  GSAP ScrollTrigger  ·  Framer Motion  ·  canvas aurora field                          │
└───────────────┬───────────────────────────────────────────────────────────────────────┘
                │ fetch (JSON)
┌───────────────▼───────────────── Next.js App Router (Node runtime) ────────────────────┐
│  Route handlers: /api/{assets,search,generate,drafts,schedule,stats,activity,ingest}    │
│  Domain services:  src/lib/search.ts · src/lib/generate/*.ts · src/lib/draft-state.ts   │
│  Embedding service: src/lib/embeddings.ts  (polar-hash-256-v1, deterministic, offline)  │
│  Repository layer:  src/lib/repositories.ts (all Drizzle access, typed, no `any`)       │
└───────────────┬───────────────────────────────────────────────────────────────────────┘
                │ Drizzle ORM (node-postgres pool)
┌───────────────▼────────────────────── PostgreSQL ──────────────────────────────────────┐
│  expeditions · assets · passages · asset_embeddings · drafts · schedule_items ·         │
│  activities                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

**Why no separate FastAPI:** the embedding model is a deterministic hashed lexical-semantic hybrid that
runs in-process in ~0.3 ms for 256 dims. Keeping it in the Node runtime removes a service, a network hop
and a cold-start from the demo path. The adapter boundary (`EmbeddingProvider`) lets pgvector / a remote
inference server drop in without touching callers.

---

## 2. Data model (Drizzle, `src/db/schema.ts`)

| Table | Key columns | Notes |
|---|---|---|
| `expeditions` | `id`, `slug`, `code`, `name`, `region`, `station`, `season`, `startDate`, `endDate`, `lat`, `lng`, `leadScientist`, `institutions[]`, `summary`, `heroImage`, `tags[]` | The spine of the catalogue. `region ∈ {antarctic, arctic, southern-ocean, himalaya}`. |
| `assets` | `id`, `publicId`, `expeditionId`, `kind`, `title`, `description`, `mimeType`, `sizeBytes`, `fileUrl`, `thumbnailUrl`, `year`, `author`, `licence`, `tags[]`, `pageCount`, `status`, `createdAt` | `kind ∈ {report, image, video, dataset}`. `status ∈ {processing, catalogued, published}`. |
| `passages` | `id`, `assetId`, `ordinal`, `heading`, `page`, `text` | Chunk unit = one report sub-section (300–900 chars). Citation target. |
| `asset_embeddings` | `id`, `assetId`, `passageId`, `model`, `dim`, `vector jsonb` | One row per asset (title+tags+summary) **and** one per passage. |
| `drafts` | `id`, `assetId`, `passageIds[]`, `format`, `audience`, `headline`, `dek`, `blocks jsonb`, `citations jsonb`, `hashtags[]`, `groundingScore`, `status`, `createdBy`, `createdByRole`, `audit jsonb[]`, `createdAt`, `updatedAt` | Generated content. `blocks: {id,type,text,citationIds[]}`. |
| `schedule_items` | `id`, `draftId`, `channel`, `scheduledFor`, `status`, `note` | `channel ∈ {website, x, instagram, linkedin, newsletter, youtube}`. |
| `activities` | `id`, `actor`, `role`, `action`, `entityType`, `entityId`, `entityLabel`, `meta jsonb`, `createdAt` | Append-only audit trail. |

Indexes: `assets(kind)`, `assets(year)`, `assets(expeditionId)`, `drafts(status)`,
`schedule_items(scheduledFor)`, `passages(assetId)`, GIN on `assets.tags`.

---

## 3. API contract

All responses: `{ ok: true, data }` or `{ ok: false, error: { code, message, details? } }`.

| Method | Route | Body / Query | Returns |
|---|---|---|---|
| GET | `/api/health` | – | `{ status: 'ok', db: 'up' }` |
| GET | `/api/assets` | `?q&kind&region&year&expedition&tag&limit` | `Asset[]` |
| POST | `/api/assets` | `{ filename, mimeType, sizeBytes, kind, title, description, expeditionId, tags[], year, author, licence }` | `{ asset, passages, embedding }` |
| GET | `/api/assets/:publicId` | – | `{ asset, expedition, passages, related[] }` |
| POST | `/api/search` | `{ query, mode: 'keyword'\|'semantic'\|'hybrid', kinds[], region, yearFrom, yearTo, limit }` | `{ results: [{ asset, passage?, score, keywordScore, semanticScore, snippet }], tookMs, mode }` |
| POST | `/api/generate` | `{ passageId, format, audience }` | `{ draft: GeneratedDraft, grounding: { score, unsupported[] }, adapter }` |
| POST | `/api/drafts` | `{ assetId, passageIds[], format, audience, headline, dek, blocks[], citations[], hashtags[] }` | `Draft` |
| GET | `/api/drafts` | `?status` | `Draft[]` (with asset + expedition titles) |
| PATCH | `/api/drafts/:id` | `{ status, note?, channel?, scheduledFor? }` | `Draft` (+ created schedule item when publishing) |
| GET | `/api/schedule` | – | `ScheduleItem[]` (joined with draft + asset) |
| PUT | `/api/schedule/:id` | `{ scheduledFor, channel? }` | `ScheduleItem` |
| POST | `/api/schedule` | `{ draftId, channel, scheduledFor }` | `ScheduleItem` |
| GET | `/api/stats` | – | `{ assets, byKind, expeditions, draftsByStatus, meanGrounding, growthByYear, pending[] }` |
| GET | `/api/activity` | `?limit` | `Activity[]` |

### Error codes
`400 bad_request` · `404 not_found` · `403 role_forbidden` · `422 citation_source_required` ·
`422 invalid_transition` · `500 adapter_failed` (auto-falls back to mock).

**Role propagation:** the client sends `x-polaris-role` (set by the mock role switcher). The server treats
it as the acting role. In production this header is replaced by the session claim — a one-line change in
`src/lib/role.ts`.

---

## 4. Vector / semantic search design

### Model `polar-hash-256-v1`
1. Normalize: lowercase, strip punctuation, Unicode NFKC.
2. Tokenize on whitespace; add bigrams; expand against a **polar synonym thesaurus** (`krill≈crustacean`,
   `ice sheet≈glacier≈cryosphere`, `co2≈carbon dioxide`…). This is what makes it *semantic* rather than
   purely lexical.
3. Hash each token (`FNV-1a 32-bit`) into 256 buckets → signed accumulation with sublinear TF
   (`1 + log(tf)`), phrase-window bonus for bigrams.
4. L2-normalize.

Cosine similarity = dot product of the normalized vectors. **Deterministic, dependency-free, offline,
~0.3 ms/vector.**

### Fusion
Reciprocal Rank Fusion across the keyword ranking and the semantic ranking:

```
RRF(d) = Σ_modes  1 / (k + rank_mode(d)),   k = 60
```

Displayed score is normalised to 0–1; the UI shows the per-mode contribution so ranking is explainable.

### Why it matters for the demo
The judge can type a *concept* ("how does melting ice affect krill") that appears **nowhere verbatim** in
the corpus and still get the right report ranked first — that is the moment keyword search fails and
semantic search wins.

---

## 5. Citation-locked generation

```
passageId ──▶ fetchPassage (the ONLY source text)
          ──▶ Adapter.generate({ source, format, audience })
                 ├── MockGroundedAdapter     (deterministic, extractive, always available)
                 ├── OpenAIChatAdapter       (if OPENAI_API_KEY, JSON-mode prompt)
                 └── OllamaAdapter           (if OLLAMA_BASE_URL)
          ──▶ GroundingVerifier.verify(blocks, citations, sourceText)
                 • every block needs ≥1 citation id
                 • every citation must resolve to the passage
                 • numeric claims must appear in the source
                 • lexical overlap (content-word recall) → groundingScore
          ──▶ Draft (persisted with citations + score)
```

**Guarantee:** the adapter never receives document text other than the selected passage. That is enforced
by the request shape, not by prompt etiquette.

---

## 6. Front-end architecture

- **Server components** for all data-heavy pages (`/dashboard`, `/archive/[slug]`, `/review` shell) —
  they render instantly from the DB.
- **Client components** for interactive surfaces (search console, viewer, dropzone, calendar, review
  queue) hydrated with TanStack Query for mutation/refetch.
- **Route transitions** via a Framer Motion `AnimatePresence` in a template file (`app/template.tsx`).
- **Theme** via `data-theme` on `<html>` + CSS custom properties; a blocking inline script sets it before
  first paint (zero flash of wrong theme).
- **Motion** via a single `<SmoothScroll>` Lenis provider, GSAP registered once, and a `Reveal` component
  that reads `prefers-reduced-motion`.

---

## 7. Production upgrade path

| Concern | Prototype | Production |
|---|---|---|
| Vector store | `jsonb` vector + in-Node cosine | `CREATE EXTENSION vector;` + `vector(256)` column + HNSW index (`m=16, ef_construction=64`), `ORDER BY embedding <=> $1 LIMIT 50`. The repository function `searchVectors()` is the only call site to change. |
| Embeddings | `polar-hash-256-v1` | `bge-m3` / `multilingual-e5-large` behind an inference URL, plus CLIP for image↔text multimodal retrieval. |
| Generation | Mock extractive | Azure OpenAI / Ollama with the same JSON schema + the same verifier (verifier is model-agnostic). |
| Auth | `x-polaris-role` header | NextAuth + NIC SSO, role claims from MoES directory. |
| Files | `/public/uploads` | S3 + signed URLs, presigned multipart for > 100 MB video. |
| OCR | skipped | Tesseract / Google Document AI adapter. |
