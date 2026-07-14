import { useEffect, useRef } from 'react';
import {
  clamp,
  hasFinePointer,
  lerp,
  prefersReducedMotion,
  readCssRgb,
  type Rgb,
} from './portraitPhysics';
import { SAMPLE_TARGET_WIDTH, useImageSampler, type PortraitSample } from './useImageSampler';
import styles from './Portrait.module.css';

/* ================== Tunables (Option B: ASCII glyphs) ==================
   Start with GRID_STEP (density/readability) and RAMP (the voice of it),
   then RAIN_SPEED + TRAIL_MS for how the matrix cascade feels.           */

/** Grid step over the SAMPLE_TARGET_WIDTH-wide sampled photo. At 1280px wide
 *  the MAX_GLYPHS cap auto-raises this, so density is set by the cap. */
const GRID_STEP = 3;
/** Cells darker than this get no glyph (0..1). */
const BRIGHTNESS_THRESHOLD = 0.18;
/** Hard cap — the sampler raises GRID_STEP automatically to stay under it. */
const MAX_GLYPHS = 2500;

/** Character ramp, dim → bright. Code-flavored on purpose.
 *  Reorder/replace freely; length can be anything ≥ 2. */
const RAMP = '.:;<>{}#@';

/* ---- Matrix rain ----
   A "drop" is a bright head that falls down one glyph column. Every glyph
   the head passes flashes near-white, churns through random ramp chars for
   a beat, then settles into its true character. The intro rains the whole
   portrait in column by column; the cursor and taps spawn extra drops. */

/** Head fall speed, CSS px per second (each drop varies ±25% around this). */
const RAIN_SPEED = 550;
/** How long a flashed glyph takes to cool back to its resting state (ms).
 *  Longer = longer glowing trail behind each head. */
const TRAIL_MS = 500;
/** Portion of the cooldown (1 → 0) during which a glyph still churns
 *  through random characters. Below this it settles onto trueChar. */
const CHURN_CUTOFF = 0.55;
/** ms between character swaps while churning. Lower = franticer. */
const CHURN_INTERVAL = 70;
/** How far toward white the head flash pushes a glyph's color (0..1). */
const HEAD_WHITEN = 0.85;

/** Cursor: columns within this horizontal distance (CSS px) spawn drops. */
const CASCADE_RADIUS = 5;
/** Minimum ms between drops in the same column (keeps trails readable). */
const COLUMN_COOLDOWN = 320;
/** Tap (touch): spawn drops in every column within this radius (CSS px). */
const TAP_RADIUS = 20;

/** Intro: wait for the hero headline, then rain the columns in. */
const INTRO_DELAY = 0; // ms after the first frame before any column starts
const INTRO_STAGGER = 900; // each column starts at a random point in this window

/** Hover-hold: after this many ms of hovering, photo color ghosts through. */
const HOLD_DELAY = 500;
/** Accent → true photo color lerp time (ms), and back on leave. */
const COLOR_LERP_MS = 400;

/** Glyph size as a fraction of one grid cell. >1 lets glyphs touch. */
const FONT_SCALE = 1.05;
/** Glyph opacity range, mapped from brightness. */
const ALPHA_MIN = 0.2;
const ALPHA_MAX = 1;

/** Cap devicePixelRatio so 3x phone screens don't triple the fill cost. */
const DPR_CAP = 2;

/* ======================================================================= */

interface Glyph {
  /** Home position in CSS px (glyphs don't move — only their char/color do). */
  x: number;
  y: number;
  /** The glyph's true character (brightness-mapped into RAMP). */
  trueChar: string;
  /** What's drawn this frame — differs from trueChar while churning. */
  displayChar: string;
  baseAlpha: number;
  /** Invisible until the first rain head passes over it (intro reveal). */
  revealed: boolean;
  /** When a head last passed (0 = never). Drives the flash/churn cooldown. */
  flashAt: number;
  /** True photo color (hover-hold reveal target). */
  r: number;
  g: number;
  b: number;
}

/** A falling rain head, bound to one column. */
interface Drop {
  col: number;
  /** Index (within the column) of the next glyph the head will flash. */
  i: number;
  /** Head position in CSS px. */
  y: number;
  /** px per ms. */
  speed: number;
}

/** Build glyphs from samples, fitted (letterboxed) into w×h CSS px.
 *  Also groups them into columns (indices into `glyphs`, sorted top→bottom)
 *  so rain drops can walk a column cheaply. */
function buildGlyphs(
  samples: PortraitSample[],
  aspect: number,
  step: number,
  targetWidth: number,
  w: number,
  h: number,
): { glyphs: Glyph[]; columns: number[][]; fontSize: number } {
  const drawW = Math.min(w, h * aspect);
  const drawH = drawW / aspect;
  const ox = (w - drawW) / 2;
  const oy = (h - drawH) / 2;
  // One grid cell of the downscaled photo, projected to CSS px.
  const cell = (drawW / targetWidth) * step;

  const glyphs = samples.map((s) => {
    const char = RAMP[Math.min(RAMP.length - 1, Math.floor(s.brightness * RAMP.length))];
    return {
      x: ox + s.nx * drawW,
      y: oy + s.ny * drawH,
      trueChar: char,
      displayChar: char,
      baseAlpha: lerp(ALPHA_MIN, ALPHA_MAX, s.brightness),
      revealed: false,
      flashAt: 0,
      r: s.r,
      g: s.g,
      b: s.b,
    };
  });

  // Samples are emitted row-major, so grouping by x keeps each column
  // sorted by y for free. Keying on the exact nx-derived x is safe: every
  // sample in a column gets the identical value.
  const byX = new Map<number, number[]>();
  for (let i = 0; i < glyphs.length; i++) {
    const col = byX.get(glyphs[i].x);
    if (col) col.push(i);
    else byX.set(glyphs[i].x, [i]);
  }
  const columns = [...byX.values()];

  return { glyphs, columns, fontSize: cell * FONT_SCALE };
}

function randomRampChar(): string {
  return RAMP[Math.floor(Math.random() * RAMP.length)];
}

/** Per-drop speed in px/ms, varied ±25% so columns don't fall in lockstep. */
function dropSpeed(): number {
  return (RAIN_SPEED * (0.75 + Math.random() * 0.5)) / 1000;
}

/**
 * Option B — the photo as a grid of mono glyphs (fillText on canvas, no DOM
 * spans). The portrait rains in matrix-style, column by column; moving the
 * cursor (or tapping, on touch) spawns fresh drops that cascade down nearby
 * columns. Hover-holding lets the true photo colors ghost through.
 */
export default function AsciiPortrait({ ariaLabel }: { ariaLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sampled = useImageSampler(GRID_STEP, BRIGHTNESS_THRESHOLD, MAX_GLYPHS);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sampled) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const accent: Rgb = readCssRgb('--color-accent', { r: 94, g: 242, b: 184 });
    // Resolve the site's mono stack once; fall back if the var is missing.
    const fontFamily =
      getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() ||
      'monospace';

    /* ---- mutable loop state (refs-by-closure; no React state here) ---- */
    let glyphs: Glyph[] = [];
    let columns: number[][] = [];
    let fontSize = 10;
    let cssW = 0;
    let cssH = 0;
    let rafId = 0;
    let running = false;
    let inView = true;
    // Active rain heads + per-column spawn throttle timestamps.
    let drops: Drop[] = [];
    let lastSpawnAt: number[] = [];
    // Pointer position in CSS px; while active, the frame loop keeps raining
    // under it (COLUMN_COOLDOWN paces the drip), even if the cursor is still.
    const pointer = { x: 0, y: 0, active: false };
    // Intro: one queued drop per column, offset (ms) from the first frame.
    let pendingIntro: { col: number; at: number }[] = [];
    let introBase = 0; // set on the first frame so a paused start still staggers
    // Hover-hold reveal: 0 = accent, 1 = photo color.
    let colorT = 0;
    let hoverStart = 0; // 0 = not hovering (fine pointers only)
    let lastSwap = 0; // last churn-tick timestamp
    let lastFrame = 0;

    /* ---------------- sizing ---------------- */

    // Font metrics are derived here once per resize — never per glyph.
    const applyFont = () => {
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      cssW = rect.width;
      cssH = rect.height;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-derive positions from the memoized samples (no photo re-decode).
      // The sampler may have auto-raised the step to respect MAX_GLYPHS, so
      // use sampled.step (not GRID_STEP) for cell spacing.
      const prev = glyphs;
      const built = buildGlyphs(
        sampled.samples,
        sampled.aspect,
        sampled.step,
        SAMPLE_TARGET_WIDTH,
        cssW,
        cssH,
      );
      glyphs = built.glyphs;
      columns = built.columns;
      fontSize = built.fontSize;

      if (prev.length === glyphs.length) {
        // Same samples, new geometry: carry reveal/flash state across so a
        // resize mid-rain doesn't blank the portrait or replay the intro.
        for (let i = 0; i < glyphs.length; i++) {
          glyphs[i].revealed = prev[i].revealed;
          glyphs[i].flashAt = prev[i].flashAt;
          glyphs[i].displayChar = prev[i].displayChar;
        }
        // Re-anchor in-flight heads to their next glyph's new position.
        drops = drops.filter((d) => d.i < columns[d.col].length);
        for (const d of drops) d.y = glyphs[columns[d.col][d.i]].y - fontSize;
      } else {
        drops = [];
      }

      // First build only: queue one intro drop per column at a random point
      // in the stagger window. (Columns rain in individually, matrix-style.)
      if (lastSpawnAt.length === 0) {
        pendingIntro = columns
          .map((_, col) => ({ col, at: INTRO_DELAY + Math.random() * INTRO_STAGGER }))
          .sort((a, b) => a.at - b.at);
      }
      lastSpawnAt = new Array(columns.length).fill(-Infinity);

      applyFont(); // canvas state resets when its bitmap is resized
      if (reduced) drawStatic();
    };

    /* ---------------- rain ---------------- */

    /** Start a head in `col` at height `y`, flashing every glyph below it. */
    const spawnDrop = (col: number, y: number, now: number) => {
      const colGlyphs = columns[col];
      let i = 0;
      while (i < colGlyphs.length && glyphs[colGlyphs[i]].y < y) i++;
      if (i >= colGlyphs.length) return; // nothing below this point
      lastSpawnAt[col] = now;
      drops.push({ col, i, y, speed: dropSpeed() });
    };

    /** Spawn drops in every column within `radius` of x (cursor + taps). */
    const spawnNear = (x: number, y: number, radius: number) => {
      const now = performance.now();
      for (let col = 0; col < columns.length; col++) {
        if (columns[col].length === 0) continue;
        if (Math.abs(glyphs[columns[col][0]].x - x) > radius) continue;
        if (now - lastSpawnAt[col] < COLUMN_COOLDOWN) continue;
        spawnDrop(col, y, now);
      }
    };

    /* ---------------- drawing ---------------- */

    /** Reduced-motion path: fully settled portrait, no rain, no churn. */
    const drawStatic = () => {
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = `rgb(${accent.r} ${accent.g} ${accent.b})`;
      for (const g of glyphs) {
        ctx.globalAlpha = g.baseAlpha;
        ctx.fillText(g.trueChar, g.x, g.y);
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);
      const dt = lastFrame ? Math.min(now - lastFrame, 64) : 16;
      lastFrame = now;

      // Intro stagger is measured from the first *rendered* frame, so a
      // page loaded with the hero off-screen still rains in on arrival.
      if (introBase === 0) introBase = now;
      while (pendingIntro.length > 0 && now - introBase >= pendingIntro[0].at) {
        const { col } = pendingIntro.shift()!;
        if (columns[col].length > 0) {
          spawnDrop(col, glyphs[columns[col][0]].y - fontSize, now);
        }
      }

      // Advance heads; every glyph a head passes flashes and is revealed.
      for (const d of drops) {
        d.y += d.speed * dt;
        const colGlyphs = columns[d.col];
        while (d.i < colGlyphs.length && glyphs[colGlyphs[d.i]].y <= d.y) {
          const g = glyphs[colGlyphs[d.i]];
          g.flashAt = now;
          g.revealed = true;
          d.i++;
        }
      }
      drops = drops.filter((d) => d.i < columns[d.col].length);

      // Continuous hover rain: as long as the pointer is over the canvas,
      // keep seeding drops beneath it — the per-column cooldown sets the pace.
      if (pointer.active) spawnNear(pointer.x, pointer.y, CASCADE_RADIUS);

      // Hover-hold: only after HOLD_DELAY ms of continuous hover does the
      // photo color start bleeding in; it drains back out on leave.
      const colorTarget = hoverStart !== 0 && now - hoverStart >= HOLD_DELAY ? 1 : 0;
      colorT = clamp(colorT + ((colorTarget - colorT) * dt) / COLOR_LERP_MS, 0, 1);

      // Churn tick: all cooling glyphs swap characters together every
      // CHURN_INTERVAL ms (cheaper + reads better than per-glyph timers).
      const swapNow = now - lastSwap >= CHURN_INTERVAL;
      if (swapNow) lastSwap = now;

      ctx.clearRect(0, 0, cssW, cssH);
      for (const g of glyphs) {
        if (!g.revealed) continue; // still waiting for its first rain head

        // Cooldown after a head passes: 1 at the flash → 0 fully settled.
        const e = g.flashAt !== 0 ? clamp(1 - (now - g.flashAt) / TRAIL_MS, 0, 1) : 0;

        if (e > CHURN_CUTOFF) {
          // Hot: churn through random ramp characters.
          if (swapNow || g.displayChar === g.trueChar) g.displayChar = randomRampChar();
        } else if (g.displayChar !== g.trueChar) {
          g.displayChar = g.trueChar; // cooled: settle onto the real glyph
        }

        // Base color (accent, or photo color under hover-hold), then pushed
        // toward white by the head flash — brightest right under the head.
        const whiten = e * e * HEAD_WHITEN;
        const rr = lerp(lerp(accent.r, g.r, colorT), 255, whiten);
        const gg = lerp(lerp(accent.g, g.g, colorT), 255, whiten);
        const bb = lerp(lerp(accent.b, g.b, colorT), 255, whiten);
        ctx.fillStyle = `rgb(${rr | 0} ${gg | 0} ${bb | 0})`;
        ctx.globalAlpha = lerp(g.baseAlpha, 1, e);
        ctx.fillText(g.displayChar, g.x, g.y);
      }
      ctx.globalAlpha = 1;
    };

    /* ---------------- run/pause ---------------- */

    // Single rAF loop; fully stopped while off-viewport or tab-hidden.
    const syncLoop = () => {
      const shouldRun = !reduced && inView && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        lastFrame = 0;
        rafId = requestAnimationFrame(frame);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncLoop();
    });
    io.observe(canvas);
    const onVisibility = () => syncLoop();
    document.addEventListener('visibilitychange', onVisibility);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // DM Mono may still be loading on first paint; the static path needs one
    // more draw once real font metrics exist. (The live loop redraws anyway.)
    if (reduced) document.fonts?.ready.then(() => drawStatic());

    /* ---------------- input ---------------- */

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.offsetX;
      pointer.y = e.offsetY;
      pointer.active = true; // the frame loop rains beneath this position
    };
    const onPointerEnter = () => {
      if (hasFinePointer()) hoverStart = performance.now();
    };
    const clearPointer = () => {
      pointer.active = false;
      hoverStart = 0;
    };
    const onPointerDown = (e: PointerEvent) => {
      if (reduced) return;
      // Touch has no hover — a tap rains a wider burst of columns instead.
      if (e.pointerType === 'touch') {
        spawnNear(e.offsetX, e.offsetY, TAP_RADIUS);
      }
    };
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerenter', onPointerEnter);
    canvas.addEventListener('pointerleave', clearPointer);
    canvas.addEventListener('pointercancel', clearPointer);
    canvas.addEventListener('pointerdown', onPointerDown);

    syncLoop();

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerenter', onPointerEnter);
      canvas.removeEventListener('pointerleave', clearPointer);
      canvas.removeEventListener('pointercancel', clearPointer);
      canvas.removeEventListener('pointerdown', onPointerDown);
    };
  }, [sampled]);

  return <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label={ariaLabel} />;
}
