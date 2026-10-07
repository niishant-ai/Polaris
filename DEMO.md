# DEMO — 3-minute judge walkthrough

**Setup (before you start):** `npm run build && npm start`, open the app, and set the role switcher
(top-right) to **Editor**. Keep a second tab on `/dashboard` if you want to show the audit trail later.

> Total time: ~3 minutes. The bold lines are the things to say out loud.

---

## 0:00 — The landing page (20 s)

Open `/`.

**Say:** *"This is POLARIS — a polar science knowledge repository and media dissemination portal for the
Ministry of Earth Sciences. Everything you are about to see is live data from Postgres."*

- Point at the animated counters: **79 assets, 22 expeditions, 72 citable passages**.
- Scroll into the pinned pipeline: **Ingest → Catalogue → Search → Generate → Review & publish**. The
  section pins and tracks sideways as you scroll (GSAP ScrollTrigger).
- **Say:** *"Five stages, one chain of custody — that's the whole problem statement in one screen."*
- Toggle the theme in the header (sun / moon / monitor). **Say:** *"Light, dark and system-aware,
  persisted in localStorage, zero flash of wrong theme."*

---

## 0:25 — Semantic search (35 s)

Click **Explore the archive** → `/archive`.

**Type:** `how does melting ice affect krill`

- **Say:** *"No document in this corpus contains those words together. Keyword search fails here — watch
  the semantic score do the work."*
- Point at the result card: *Krill Biomass and Sea-Ice Extent Along the 65°E Transect, IAE-41*, with the
  two score bars — **Keyword** low, **Semantic** high — and the highlighted snippet.
- **Say:** *"Ranking is reciprocal-rank fusion of a field-weighted keyword score and a 256-dimensional
  vector. There's no GPU and no external API: the embedding model is a deterministic hashed model with a
  30-group polar thesaurus inside it, so it runs offline and never fails during a demo."*
- Switch the mode toggle to **Keyword** to show the same query degrade. Switch back to **Hybrid**.
- Click **Map** and **Timeline** tabs briefly: *"the same repository as a polar stereographic map and a
  decade timeline."*

---

## 1:00 — Ingestion (30 s)

Go to `/ingest`. Click **Load three sample files**.

- Watch the pipeline: **Uploading → Extracting → Ready to commit**, with an extraction confidence badge.
- **Say:** *"The parser read the filename and the text layer and proposed a title, a year, a media kind,
  an expedition and tags from a polar taxonomy. The scientist corrects rather than types."*
- Remove one wrong tag to show it's editable, then click **Commit to archive** on the PDF.
- **Say:** *"That just wrote a row to Postgres, chunked it into a citable passage, computed its embedding
  and appended to the audit log."* Click **Open asset →**.

---

## 1:30 — Citation-locked generation (45 s)

You are now on the report page. Scroll to a passage.

- Select a sentence with the mouse. A sticky action bar appears with the captured excerpt.
  **Say:** *"Keyboard users get the same thing via the 'Select passage' button on every paragraph."*
- Click **Generate from selection**. The studio drawer opens with the source passage pinned at the top.
- **Say:** *"This is the core integrity guarantee. The API refuses to generate without a passage id — try
  it without one and you get 422 `citation_source_required`. The adapter is handed this paragraph and
  nothing else. There is no code path that gives it the wider document."*
- Choose **Social post** + **Student**, click **Generate with citations**.
- Point at the output: headline (editable), blocks, and the green **Grounding 0.9x** badge.
- **Click citation chip `1 · p.58`** — the drawer closes, the page scrolls to the source paragraph and it
  flashes.
- **Say:** *"A model-agnostic verifier checks every block: it needs a citation, the citation must resolve
  to this passage, every number must appear in the source. If any of that fails the block turns red and
  is labelled 'needs human review'. That verifier doesn't care whether the adapter is my mock, OpenAI or
  a local Ollama model."*
- Click **Submit for review**. **Say:** *"Now a human owns the decision."*

---

## 2:15 — Editorial workflow (25 s)

Go to `/review`. The draft is at the top of **In review**.

- **Say:** *"Draft → In review → Approved → Published, plus Rejected. The state machine is enforced
  server-side, not just in the UI."*
- Click **Approve**. Then switch the role switcher to **Admin** and click **Publish**.
- **Say:** *"Publishing is Admin-only. Watch what happens if I try it as an Editor."* (Switch to Editor,
  show the disabled button and the note that the API returns `403 role_forbidden` independently.)
- Point at the **Audit trail** at the bottom: every actor, role, action and note, with the rejection note
  visible on the rejected Gangotri draft.

---

## 2:40 — Scheduling + dashboard (20 s)

Go to `/calendar`.

- **Drag** the newly published item to another day. The confirmation is announced to screen readers.
- **Say:** *"Dragging is optional — WCAG 2.2 criterion 2.5.7 requires a non-dragging path, so the
  ±1 day / ±1 week buttons do exactly the same thing through the same API."*
- Point at the amber warning icon: *"that day has more than three posts on one channel — we flag it."*
- Go to `/dashboard`. Finish on the numbers: assets, expeditions, awaiting review, **mean grounding
  score**, archive growth by year, and the live activity feed with your own actions at the top.

---

## Closing line

> *"The problem statement asked for outreach, a knowledge repository and media dissemination. What we
> built is one pipeline where every public sentence can be traced back to the exact paragraph of the
> expedition report it came from — and where nothing reaches the public without a human saying yes."*

---

## Backup answers (likely questions)

| Question | Answer |
|---|---|
| "What if the LLM hallucinates?" | It cannot reach outside the selected passage, and the verifier re-checks every block against that passage regardless of which model produced it. Plus a human approval gate. |
| "How does the search work without an API key?" | `polar-hash-256-v1` — deterministic hashed embeddings with a polar synonym thesaurus. Production swaps to `bge-m3` / CLIP; the call site is one repository function. |
| "Why not pgvector?" | The binary isn't available in this sandbox. Vectors are in `jsonb` with cosine in Node; the pgvector + HNSW migration is a documented one-function change. |
| "Is the role system real?" | It's mock auth via an `x-polaris-role` header, chosen deliberately for the prototype. Permissions are enforced server-side in the state machine, so replacing the header with a session claim is a one-line change. |
| "What about Hindi/Tamil output?" | The audience layer is already a lexicon pipeline; adding a language dimension is a data change, not an architectural one. Documented as Phase 9 M4. |
| "How accessible is it?" | WCAG 2.2 AA target, including the 2.2-only criteria most teams miss (2.4.11, 2.5.7, 2.5.8, 3.2.6). Full checklist in `docs/08-accessibility.md`. |
