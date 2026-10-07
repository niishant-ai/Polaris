# 01 — Personas

Four primary personas, one secondary. Roles in the prototype are switchable from the top bar (mock auth).

---

## 1. Dr. Ananya Rao — Polar Researcher / Depositor

| | |
|---|---|
| **Age / role** | 38, Glaciologist, ESSO-NCPOR |
| **Technical** | Expert. Lives in Python + QGIS. |
| **Devices** | MacBook 16", external monitor, phone for review. |
| **Goal** | Deposit the 41st Indian Antarctic Expedition report and its 400 photos without filling 12 forms. |
| **Pain** | Every portal asks for metadata she already wrote inside the PDF; uploads time out; nothing tells her the item is live. |
| **Needs from POLARIS** | Drag-and-drop ingest, automatic metadata extraction she can *correct* rather than type, and a visible "catalogued ✓" state. |
| **Success** | Report + media ingested and searchable in under 2 minutes. |
| **Journey** | `/ingest` → drop files → review auto-extracted cards → fix expedition + tags → **Catalogued** → sees it in `/archive`. |

**Quote:** *"I already wrote the metadata. Just read it and let me fix what's wrong."*

---

## 2. Vikram Mehta — Science Communication Officer (power user)

| | |
|---|---|
| **Age / role** | 31, Sci-comm, MoES outreach cell |
| **Technical** | High. Writes for a living; understands citation discipline. |
| **Devices** | Laptop + phone; 60 % of his day is in a browser tab. |
| **Goal** | Produce a website story + 3 social posts from the new expedition report before the press briefing. |
| **Pain** | Copy-pasting from PDFs; losing the page number; three different reading levels to hand-write; approval happens over WhatsApp. |
| **Needs from POLARIS** | Open the report, **select the exact passage**, choose audience, generate, and get citations inline that he can hand to his editor. |
| **Success** | Draft with citations ready for review in < 5 minutes. |

**Quote:** *"If I can't point at the paragraph it came from, I can't publish it."*

---

## 3. Meera Krishnan — Student / Public visitor

| | |
|---|---|
| **Age / role** | 15, Class 10, Chennai |
| **Technical** | Medium. Phone-first, 320–430 px viewport. |
| **Goal** | Find something amazing about Antarctic research for a school project. |
| **Pain** | Government portals are text-dense, jargon-heavy, and she doesn't know the "right" keyword. |
| **Needs from POLARIS** | Natural-language search, a timeline + map that makes exploration feel like a story, and plain-language explanations. |
| **Success** | Types *"what do scientists eat in Antarctica"*-style questions and finds a real answer. |

**Quote:** *"I don't know what 'cryosphere' means, but I know what ice is."*

---

## 4. S. Krishnan — Editor / Outreach Lead

| | |
|---|---|
| **Age / role** | 47, Head of outreach, final approver |
| **Technical** | Medium-high. Approval is a legal/brand risk decision for him. |
| **Goal** | Never let an uncited or wrong claim reach the public. |
| **Pain** | He cannot verify 30 drafts a week by opening 30 PDFs. |
| **Needs from POLARIS** | A review queue where every claim shows its source, with one-click jump to the highlighted passage, plus a visible audit trail. |
| **Success** | Approve/reject with confidence in < 60 seconds per item. |

**Quote:** *"Show me the sentence in the report. Then I'll sign."*

---

## 5. Secondary — MoES Programme Officer / Admin

Wants the numbers: how much is archived, what's pending, who did what, and whether the calendar is sane.
Primary surface: `/dashboard`. Needs CSV-exportable activity, role-based visibility, and a clean
empty/loading state everywhere.

---

## Role → capability matrix

| Capability | Public | Student* | Editor | Admin |
|---|:--:|:--:|:--:|:--:|
| Browse archive, search, read documents | ✅ | ✅ | ✅ | ✅ |
| Generate drafts | ❌ | ❌ | ✅ | ✅ |
| Submit for review | ❌ | ❌ | ✅ | ✅ |
| Approve / reject | ❌ | ❌ | ✅ | ✅ |
| Publish | ❌ | ❌ | ❌ | ✅ |
| Schedule / reschedule | ❌ | ❌ | ✅ | ✅ |
| Ingest assets | ❌ | ❌ | ✅ | ✅ |
| See dashboard + audit log | ❌ | ❌ | partial | ✅ |

\* "Student" is a *reading-level audience*, not a system role; the role switcher offers Public / Editor / Admin.
