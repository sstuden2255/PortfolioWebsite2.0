import { useEffect, useRef, useState } from 'react';
import { name } from '../../../data/content';
import AsciiPortrait from './AsciiPortrait';
import ParticlePortrait from './ParticlePortrait';
import { prefersReducedMotion } from './portraitPhysics';
import styles from './Portrait.module.css';

/**
 * Interactive hero portrait with two competing render modes:
 *   'particle' — accent dots with spring physics (ParticlePortrait)
 *   'ascii'    — mono glyphs with cursor scramble (AsciiPortrait)
 *
 * The dots/glyphs switcher is a TEMPORARY A/B control for picking a winner;
 * see the deletion notes at the bottom of this file. The chosen mode is
 * persisted to localStorage so it survives reloads while comparing.
 *
 * Only the active mode is mounted (one rAF loop max). Switching fades the
 * stage out (~150ms), swaps the component, and fades back in — a sequential
 * crossfade that never runs two loops at once.
 */

type PortraitMode = 'particle' | 'ascii';

const STORAGE_KEY = 'portrait-mode';
/** Half of the total ~300ms mode crossfade (out, swap, in). */
const FADE_MS = 150;

function loadStoredMode(): PortraitMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'ascii' || stored === 'particle' ? stored : 'particle';
  } catch {
    return 'particle'; // storage blocked (private mode etc.) — just default
  }
}

function storeMode(mode: PortraitMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Non-fatal: the toggle still works, it just won't survive a reload.
  }
}

export default function Portrait() {
  const [mode, setMode] = useState<PortraitMode>(loadStoredMode);
  const [fading, setFading] = useState(false);
  const fadeTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(fadeTimer.current), []);

  const select = (next: PortraitMode) => {
    if (next === mode || fading) return;
    storeMode(next);
    if (prefersReducedMotion()) {
      setMode(next); // instant swap, no crossfade
      return;
    }
    setFading(true);
    fadeTimer.current = window.setTimeout(() => {
      setMode(next);
      setFading(false);
    }, FADE_MS);
  };

  const ariaLabel = `Stylized interactive portrait of ${name}`;

  return (
    <div className={styles.portrait}>
      <div className={`${styles.stage} ${fading ? styles.stageFading : ''}`}>
        {mode === 'particle' ? (
          <ParticlePortrait ariaLabel={ariaLabel} />
        ) : (
          <AsciiPortrait ariaLabel={ariaLabel} />
        )}
      </div>

      {/* Temporary A/B switcher — quiet terminal tabs, bottom-right */}
      <div className={styles.switcher} role="group" aria-label="Portrait render mode">
        <button
          type="button"
          className={`${styles.switchButton} ${mode === 'particle' ? styles.switchActive : ''}`}
          aria-pressed={mode === 'particle'}
          onClick={() => select('particle')}
        >
          dots
        </button>
        <button
          type="button"
          className={`${styles.switchButton} ${mode === 'ascii' ? styles.switchActive : ''}`}
          aria-pressed={mode === 'ascii'}
          onClick={() => select('ascii')}
        >
          glyphs
        </button>
      </div>
    </div>
  );
}

/*
 * ---- Deleting the losing mode ----
 * 1. Delete the loser's file (ParticlePortrait.tsx or AsciiPortrait.tsx).
 * 2. In this file: remove the loser's import, the PortraitMode type, the
 *    STORAGE_KEY/FADE_MS constants, loadStoredMode/storeMode, all state,
 *    and the switcher <div>. Render the winner directly inside .stage.
 * 3. In Portrait.module.css: remove .switcher/.switchButton/.switchActive
 *    and .stageFading.
 * 4. If ASCII loses, portraitPhysics.ts keeps only what particles use;
 *    if particles lose, springStep/repelFrom/radialImpulse become dead code
 *    there — delete them.
 */
