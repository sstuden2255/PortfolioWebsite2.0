import { useEffect, useRef } from 'react';
import { lineTipY, prefersReducedMotion, subscribeToLine } from './scrollLine';

/**
 * Binds a callback to an element's scroll progress: 0 when the line's
 * "pen tip" (see scrollLine.ts) reaches the element's top, 1 when it
 * passes the bottom. Fully reversible — progress follows the scroll
 * position in both directions, every frame.
 *
 * Layout reads happen only in the shared engine's measure phase
 * (mount/resize/load); callers should apply the value as a transform or
 * CSS variable, never a layout property.
 *
 * Under prefers-reduced-motion no listeners attach and the callback
 * fires once with progress 1 (fully drawn).
 */
export function useScrollProgress<T extends HTMLElement>(
  onProgress: (progress: number, el: T) => void,
) {
  const ref = useRef<T>(null);

  // Keep the latest callback without re-subscribing.
  const callbackRef = useRef(onProgress);
  callbackRef.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      // rAF so sibling effects (offset caches) have run before we fire.
      const frame = requestAnimationFrame(() => callbackRef.current(1, el));
      return () => cancelAnimationFrame(frame);
    }

    let top = 0;
    let height = 1;

    return subscribeToLine({
      measure: () => {
        const rect = el.getBoundingClientRect();
        top = rect.top + window.scrollY;
        height = Math.max(rect.height, 1);
      },
      update: () => {
        const progress = Math.min(1, Math.max(0, (lineTipY() - top) / height));
        callbackRef.current(progress, el);
      },
    });
  }, []);

  return ref;
}
