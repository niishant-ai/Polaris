# 03 — End-to-End User Flows

The master flow: **Ingest → Catalogue → Search → Read → Select → Generate → Review → Approve → Publish → Schedule → Measure.**

---

## Flow A — Depositor: Ingest & Catalogue (Dr. Ananya Rao)

```
/ingest
 1. Drop 3 files (report.pdf, ice_core_04.jpg, maitri_timelapse.mp4)
 2. Dropzone validates type/size → files appear as "queued"
 3. Progress bar animates: uploading (0→100 %)  → "extracting" (spinner) → "catalogued ✓"
 4. Extraction panel per file:
      • report.pdf   → Title "41st Indian Antarctic Expedition …", Expedition auto-matched
                       (IAE-41, 2022, Bharati), kind=report, tags=[glaciology, ice core, sea ice], confidence 0.87
      • ice_core_04.jpg  → kind=image, EXIF-stub lat/lng, tags=[ice core, sampling]
      • maitri_timelapse.mp4 → kind=video, duration stub, tags=[timelapse, station]
 5. Ananya corrects the expedition for the image (dropdown), fixes a tag, clicks "Commit to archive"
 6. POST /api/assets  (x3, sequential)  → each returns { asset, passages[], embedding }
 7. Activity entries written: "ingested", "catalogued"
 8. Success panel: 3 deep links → /archive/[publicId]
```

**Failure paths:** unsupported type → inline red message, file rejected, others continue. Empty state
before any drop → illustration + "Try sample files" button that loads a demo file.

---

## Flow B — Public / Student: Discover (Meera)

```
/ (landing)
 1. Hero: "India's polar science, made legible."
 2. Scroll → pinned GSAP sequence: Archive → Search → Generate → Review → Publish (the pipeline)
 3. "Explore the archive" CTA → /archive
/archive
 4. Types natural language: "how does melting ice affect krill"
 5. Mode = Hybrid (default). Filters = All kinds
 6. Results: report snippets ranked by meaning, with <mark> highlights + score bars
 7. Opens top result → /archive/iae-41-krill-biomass-report
 8. Reads; clicks "Plain-language summary" → audience=public explainer card rendered inline
```

**Failure paths:** no results → suggested queries + "clear filters". Network error → retry card.

---

## Flow C — Sci-comm: Citation-locked generation (Vikram)

```
/archive/[publicId]
 1. Vikram selects a passage with the mouse (or keyboard: focus passage, press Enter to select)
 2. Floating action bar appears at the selection: [Generate from selection] [Copy] [Clear]
 3. Click → /studio?asset=…&passage=…  (Studio drawer opens, source excerpt pinned at top)
 4. Choose Format = Social post, Audience = Student
 5. POST /api/generate { passageId, format, audience }
    → adapter composes ONLY from the passage text
    → returns { headline, dek, blocks[], citations[], grounding: { score, unsupported[] }, hashtags[] }
 6. Grounding panel: "3 blocks · 3 cited · 0 unsupported · score 0.94"
 7. He tweaks the headline inline (contenteditable)
 8. POST /api/drafts  { status: 'in_review' }
 9. Toast: "Submitted for review" → link to /review
```

**Rule enforced server-side:** if the request contains no `passageId`, the adapter is never called and a
`422 citation_source_required` is returned. This is the product's core integrity guarantee.

---

## Flow D — Editor: Review (S. Krishnan)

```
/review  (role = Editor or Admin)
 1. Queue: tabs In review (n) · Approved (n) · Published (n) · Rejected (n)
 2. Select a draft → split view
      LEFT  : rendered draft with numbered citation chips
      RIGHT : source passage, auto-scrolled and highlighted; metadata
 3. Click citation chip ① → right pane scrolls to passage, flashes
 4. Verdict:
      • Approve        → PATCH /api/drafts/:id { status:'approved' }  (allowed: editor, admin)
      • Request changes→ PATCH { status:'draft', note }               (allowed: editor, admin)
      • Reject         → PATCH { status:'rejected', note } (note mandatory) (allowed: editor, admin)
      • Publish        → PATCH { status:'published', channel, scheduledFor } (allowed: admin only)
 5. Each transition writes to activities + draft.audit[]
```

**Failure path:** Editor tries Publish → button disabled with tooltip "Admin role required",
and the API independently returns `403 role_forbidden` (defence in depth).

---

## Flow E — Admin: Publish & Schedule

```
/calendar
 1. Approved-but-unscheduled drafts sit in the right-hand "Ready to publish" tray
 2. Admin drags a draft onto a calendar day (or selects item → "Shift +1 day" for keyboard users)
 3. PUT /api/schedule/:id { scheduledFor } → item re-renders with layout animation
 4. Channel colour coding: website / x / instagram / linkedin / newsletter
 5. Day with > 3 items → amber "channel crowded" badge
 6. Publishing an approved draft auto-creates a schedule item on the next free slot
```

---

## Flow F — Admin: Measure

```
/dashboard
 1. KPI row: assets, expeditions, drafts in review, mean grounding score
 2. Sparkline of archive growth by year
 3. Pending reviews (top 5) with one-click approve
 4. Activity feed (last 12) with actor, role, action, entity, relative time
 5. "Open review queue" CTA
```

---

## State machine (draft)

```
                 ┌──────────┐  request changes
   draft  ──────▶│ in_review│──────────────────▶ draft
     ▲           └────┬─────┘
     │  generate       │ approve (editor/admin)
     │                 ▼
     │            ┌──────────┐   publish (admin)   ┌───────────┐
     └────────────│ approved │────────────────────▶│ published │
       reject     └──────────┘                     └───────────┘
     (editor/admin, note required)
     rejected is terminal for the draft version.
```

Transitions are validated in `src/lib/draft-state.ts`, not just in the UI.
