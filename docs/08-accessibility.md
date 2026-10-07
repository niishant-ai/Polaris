# 08 — Accessibility Plan (WCAG 2.2 AA)

Accessibility is a build gate, not a pass at the end. Every component below was authored against this
document.

## 1. Conformance target

**WCAG 2.2 Level AA**, plus the 2.2-specific criteria that most teams miss:
- **2.4.11 Focus Not Obscured (Minimum)** — the sticky top bar is `pointer-events: none` on its padding
  zone and the page has `scroll-margin-top` on every `id` target, so focus never hides behind chrome.
- **2.5.7 Dragging Movements** — the calendar supports drag-to-reschedule **and** a keyboard path
  ("Shift ± 1 day / ± 1 week" buttons + `aria-live` confirmation). The dropzone has a click-to-browse
  button and an "Add sample file" action.
- **2.5.8 Target Size (Minimum)** — all interactive targets are ≥ 24 × 24 px; primary actions ≥ 44 px.
- **3.2.6 Consistent Help** — the help entry point (the "?" in the top bar) is in the same position on
  every page.
- **3.3.7 Redundant Entry** — the ingest form remembers the last used expedition and licence; the studio
  remembers the last audience.

## 2. Perceivable
- Colour tokens verified for **4.5:1 (body)** and **3:1 (large / UI borders)** in both themes. Status is
  **never** conveyed by colour alone — every status badge carries a text label and an icon.
- `mark` highlights use a 30 % `--ice` fill **plus** a 2 px ink underline, so the highlight survives
  monochrome / high-contrast modes.
- All non-decorative images have `alt`; the aurora canvas and decorative SVGs are `aria-hidden` with
  `role="presentation"`.
- Text resizes to 200 % without loss of content or functionality (fluid `clamp()` type, no fixed-height
  text containers).
- No content flashes more than 3 times per second.

## 3. Operable
- **Keyboard:** everything is reachable. Global skip link ("Skip to content") is the first focusable
  element. Tab order follows DOM order = visual order.
- **Focus:** a 2 px `--brand` ring with 3 px offset on every focusable element; `:focus-visible` only, so
  mouse clicks don't show rings.
- **Selection toolbar:** a passage can be selected by keyboard (focus the passage, press
  <kbd>Enter</kbd>) — never mouse-only.
- **Tabs** in the review queue use `role="tablist"` with roving tabindex and Arrow/Home/End keys.
- **Dialogs** trap focus, close on <kbd>Escape</kbd>, and restore focus to the trigger.
- **Live regions:** search result counts, upload progress, generation status, and drag-reschedule results
  announce via `aria-live="polite"`. Errors announce via `role="alert"`.
- **Time limits:** none. The upload "pipeline" simulation is presentational only and its result is
  announced when complete.

## 4. Understandable
- Every input has a persistent visible `<label>`, a hint, and an error bound via `aria-describedby`.
- Errors identify the field in text (`aria-invalid="true"`).
- The role switcher announces the active role and what it unlocks.
- Generated content exposes a machine-readable citation list under the rendered body.

## 5. Robust
- Valid semantic landmarks: `header`, `nav[aria-label]`, `main`, `aside`, `footer`.
- Heading hierarchy is strictly nested (h1 → h2 → h3), one h1 per route.
- Interactive non-button elements are real `<button>` / `<a>` elements.
- All API contracts are typed end-to-end; no `any` in the codebase.

## 6. Reduced motion
`usePrefersReducedMotion()` (single `matchMedia` listener) drives every animated component:
- Lenis is never mounted.
- GSAP timelines are replaced with `gsap.set()` (final state, no tween).
- Framer Motion variants swap to `{ duration: 0 }`.
- The aurora canvas renders a single static frame.
- Skeletons become static blocks.

## 7. Verification checklist (executed)
- [x] Keyboard-only walk of: landing → archive → search → open document → select passage → generate → submit → review → approve (admin) → schedule.
- [x] Skip link present and functional on every route.
- [x] All images have appropriate `alt`.
- [x] Contrast spot-checked for text tokens in both themes.
- [x] `prefers-reduced-motion` honoured (aurora, parallax, reveals, drag animations).
- [x] Zoom 200 % and 320 px viewport: no horizontal scroll, no clipped content.
- [x] Screen-reader labels for icon-only buttons (theme toggle, close, drag handle).
- [x] Form fields labelled; errors announced.
- [x] Drag operations have keyboard equivalents.
- [x] Lighthouse Accessibility ≥ 95 on the production build.
