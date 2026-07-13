/**
 * Shared scroll engine for "The Line" — the accent rail that draws itself
 * down the page and powers UI on/off as it passes.
 *
 * One passive scroll/resize/load listener set feeds every subscriber
 * through a single rAF, instead of each hook attaching its own listeners.
 *
 * Contract: `measure` is the only place subscribers may read layout
 * (getBoundingClientRect etc.) — it runs on subscribe/resize/load.
 * `update` runs per animation frame during scroll and must only read
 * `window.scrollY` / cached values and write transforms or CSS variables.
 */

/** The line's "pen tip" sits this far down the viewport (0–1). */
export const TIP_RATIO = 0.75;

/** Document-space Y coordinate of the pen tip right now. */
export const lineTipY = () => window.scrollY + window.innerHeight * TIP_RATIO;

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Subscriber {
  /** Cache layout reads. Called on subscribe, resize, and window load. */
  measure: () => void;
  /** Apply state for the current scroll position. Called once per frame. */
  update: () => void;
}

const subscribers = new Set<Subscriber>();
let frame = 0;
let listening = false;

const flush = () => {
  frame = 0;
  for (const sub of subscribers) sub.update();
};

const requestFlush = () => {
  if (!frame) frame = requestAnimationFrame(flush);
};

const remeasureAll = () => {
  for (const sub of subscribers) sub.measure();
  requestFlush();
};

/** Register a subscriber; returns its cleanup function. */
export function subscribeToLine(sub: Subscriber): () => void {
  subscribers.add(sub);
  if (!listening) {
    listening = true;
    window.addEventListener('scroll', requestFlush, { passive: true });
    window.addEventListener('resize', remeasureAll);
    // Fonts/images settling can shift offsets after mount.
    window.addEventListener('load', remeasureAll);
  }
  sub.measure();
  sub.update();

  return () => {
    subscribers.delete(sub);
    if (subscribers.size === 0 && listening) {
      listening = false;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      window.removeEventListener('scroll', requestFlush);
      window.removeEventListener('resize', remeasureAll);
      window.removeEventListener('load', remeasureAll);
    }
  };
}
