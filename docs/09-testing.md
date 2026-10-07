# 09 — Testing Strategy

## 1. Philosophy
The prototype's risk is not algorithmic complexity — it is **integrity**: does the citation lock hold, does
ranking return the right thing, does the editorial state machine refuse illegal moves. Tests concentrate
there.

## 2. Test pyramid

| Level | Tool | Share | Runtime target |
|---|---|---|---|
| Unit | Vitest | 60 % | < 3 s |
| Integration (route handlers against real Postgres) | Vitest + fetch against a running server | 25 % | < 20 s |
| E2E | Playwright (Chromium + WebKit) | 15 % | < 90 s |
| Static gates | `next typegen`, `tsc --noEmit`, `eslint`, `next build` | gate | – |

---

## 3. Unit suites

### `tests/embeddings.test.ts`
- Determinism: same input → identical vector across runs and processes.
- Normalization: ‖v‖₂ = 1 ± 1e-6.
- Synonym expansion: `embed("krill biomass")` has high cosine with `embed("crustacean populations")`
  (> 0.55) while `embed("station power supply")` stays low (< 0.20).
- Bigram capture: `"ice sheet melt"` matches `"melting of the ice sheet"`.
- Dimensionality is exactly 256 for any input length, including empty string.

### `tests/search.test.ts`
- Tokenizer strips stopwords and punctuation, lowercases, NFKC-normalizes.
- Field weighting: a title match outranks a body match at equal TF.
- RRF fusion: a document ranked 1st semantically and 9th by keyword outranks one ranked 4th/4th.
- Snippet generation: returns ≤ 240 chars, contains the matched token, inserts `<mark>` correctly, never
  splits a surrogate pair.

### `tests/grounding.test.ts` (citation locking — the critical suite)
- Every returned block has ≥ 1 citation id.
- Every citation id resolves to the supplied passage.
- A block whose text shares no content words with the source is flagged `unsupported`.
- A number that does not appear in the source is flagged.
- `groundingScore` is 1.0 for a purely extractive output.
- Adapter failure (`OpenAIChatAdapter` throws) falls back to `MockGroundedAdapter` and returns
  `adapter: 'mock'`.

### `tests/draft-state.test.ts`
| From | Event | Role | Expect |
|---|---|---|---|
| draft | submit | editor | → in_review |
| in_review | approve | editor | → approved |
| in_review | approve | public | → 403 |
| in_review | reject (no note) | editor | → 422 (note required) |
| approved | publish | editor | → 403 |
| approved | publish | admin | → published **and** a schedule item exists |
| published | publish | admin | → 422 invalid transition |
| rejected | submit | admin | → 422 (terminal) |

### `tests/extract.test.ts`
- Filename → title (handles `snake-case`, `CamelCase`, `41st_IAE_report_final_v2.pdf`).
- Year extraction from filename and from body text (4-digit, 1980–2030 window).
- Kind inference from MIME.
- Tag inference: ≥ 2 taxonomy hits for a typical abstract, ≤ 6 (cap).

---

## 4. Integration suites (`tests/api/*.test.ts`)
- `POST /api/search` — 12 scripted judge queries (see §6) return the expected asset in the top 3.
- `POST /api/assets` — creates asset + ≥ 1 passage + embedding + activity entry; returns 400 on bad kind.
- `POST /api/generate` — returns **422 `citation_source_required`** when `passageId` is absent. This test
  is the product's core promise in code.
- `PATCH /api/drafts/:id` — every row of the state table above, executed over HTTP.
- `PUT /api/schedule/:id` — reschedule persists; channel conflict surfaces a warning.

---

## 5. E2E (`e2e/judge-walkthrough.spec.ts`) — mirrors `DEMO.md`
1. Land on `/`, skip link visible, hero renders, scroll pipeline plays.
2. Toggle dark theme → reload → theme persisted (no flash).
3. Switch role to Editor.
4. `/archive` → type `melting ice krill` → expect highlighted snippet in < 1 s.
5. Open first result → keyboard-select passage 3 → Enter → studio opens.
6. Generate (Student / Social post) → expect ≥ 1 citation chip → click chip → source passage flashes.
7. Submit for review → toast → `/review`.
8. Approve as Editor; switch to Admin; Publish; expect schedule item created.
9. `/calendar` → drag item to another day → expect `aria-live` "Moved to 12 March".
10. `/dashboard` → counters reflect the new asset and draft.

Playwright a11y assertions: axe-core scan on `/`, `/archive`, `/review` with zero critical violations.

---

## 6. Scripted judge queries (retrieval acceptance)

| # | Query | Expected top result |
|---|---|---|
| 1 | `how does melting ice affect krill` | *Krill biomass & sea-ice extent, IAE-41* |
| 2 | `what do scientists eat at the station` | *Maitri logistics & rationing report* |
| 3 | `ice core climate record` | *Ice-core palaeoclimate bulletin* |
| 4 | `antarctic treaty and india's role` | *IAE treaty compliance note* |
| 5 | `black carbon himalaya` | *Himansh glaciology dataset* |
| 6 | `polar satellite orbit` | *Himalayasat / RISAT polar orbit brief* |
| 7 | `ocean acidification southern ocean` | *SO cruise carbonate chemistry* |
| 8 | `renewable power at bharati` | *Bharati hybrid power report* |
| 9 | `penguin colony monitoring` | *Emperor penguin census imagery note* |
| 10 | `aurora observation` | *Optical aurora campaign log* |
| 11 | `glacier retreat satopanth` | *Himansh mass-balance dataset* |
| 12 | `storm waves drake passage` | *Southern Ocean swell bulletin* |

Acceptance: ≥ 10 of 12 in the top 3.

---

## 7. Performance budget & monitoring
- Lighthouse ≥ 95 Performance / A11y / Best Practices / SEO on the production build.
- Interaction budgets: search keystroke → results < 300 ms; generate → draft < 900 ms; route transition
  < 220 ms.
- All animations on `transform`/`opacity` only; 60 fps target validated with a trace during the pinned
  hero sequence.
- Long task budget: no task > 50 ms during scroll.

## 8. Manual test matrix
| Surface | States to verify |
|---|---|
| Search | loading · results · no results · error · empty query · filters yielding nothing |
| Ingest | empty · dragging · uploading · extracting · catalogued · rejected type · duplicate name |
| Studio | no selection · generating · generated · unsupported blocks · adapter fallback |
| Review | empty queue · one item · many items · reject without note (error) · role-forbidden publish |
| Calendar | empty day · crowded day · drag · keyboard shift · month boundary |
| Dashboard | cold DB (auto-seed) · zero drafts · long activity list |
