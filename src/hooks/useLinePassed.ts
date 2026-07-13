import { useEffect, useRef, useState } from 'react';
import { lineTipY, prefersReducedMotion, subscribeToLine } from './scrollLine';

/**
 * Reversible line activation: `passed` is true whenever the line's pen
 * tip is at or below `offset` px past the element's top, and flips back
 * to false when the user scrolls back up — the UI scrubs with the
 * scroll. Components map it to a CSS-module "lit" class; the actual
 * power-on/off transitions live in CSS.
 *
 * State only updates when the boolean flips, so scrolling doesn't
 * re-render subscribed components per frame.
 *
 * Under prefers-reduced-motion it reports passed immediately (and the
 * CSS side keeps all of its unlit states behind no-preference).
 */
export function useLinePassed<T extends HTMLElement>(offset = 0) {
  const ref = useRef<T>(null);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      setPassed(true);
      return;
    }

    let top = 0;
    let current: boolean | null = null;

    return subscribeToLine({
      measure: () => {
        top = el.getBoundingClientRect().top + window.scrollY;
      },
      update: () => {
        const next = lineTipY() >= top + offset;
        if (next !== current) {
          current = next;
          setPassed(next);
        }
      },
    });
  }, [offset]);

  return { ref, passed };
}
