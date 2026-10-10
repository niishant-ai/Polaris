import { cn } from "@/lib/utils";

/**
 * Decorative background pattern layers.
 *
 * Rendered once in the root layout as fixed, non-interactive layers beneath
 * the page content. Each pattern is a single tiled SVG/gradient with an
 * edge mask, so the cost is one composited layer per pattern — no JS, no
 * layout work, and no re-paint on scroll.
 *
 * Layers are hidden for reduced motion and print via `globals.css`, and are
 * marked `aria-hidden` so they never reach assistive technology.
 */
export function PagePatterns() {
  return (
    <div className="pattern-stack" aria-hidden="true">
      <div className={cn("pattern pattern-polar", "pattern-soft")} />
      <div className={cn("pattern pattern-crystal", "pattern-soft")} />
      <div className={cn("pattern pattern-contour", "pattern-soft")} />
      <div className={cn("pattern pattern-dot", "pattern-soft")} />
      <div className={cn("pattern pattern-rules", "pattern-soft")} />
    </div>
  );
}
