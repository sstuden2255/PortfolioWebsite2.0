import { useEffect, useRef } from 'react';
import {
  clamp,
  hasFinePointer,
  lerp,
  prefersReducedMotion,
  radialImpulse,
  readCssRgb,
  repelFrom,
  springStep,
  type Rgb,
} from './portraitPhysics';
import { useImageSampler, type PortraitSample } from './useImageSampler';
import styles from './Portrait.module.css';

/* ================== Tunables (Option A: particles) ==================
   Start with GRID_STEP + REPULSE_* — they change the feel the most.     */

/** Grid step over the SAMPLE_TARGET_WIDTH-wide sampled photo. At 1280px wide
 *  the MAX_PARTICLES cap auto-raises this, so density is set by the cap. */
const GRID_STEP = 2;
/** Cells darker than this get no particle (0..1). */
const BRIGHTNESS_THRESHOLD = 0.0001;
/** Hard cap — the sampler raises GRID_STEP automatically to stay under it. */
const MAX_PARTICLES = 4000;

/** Spring pull toward home per frame. Higher = snappier return. */
const SPRING = 0.002;
/** Velocity kept per frame. Lower = heavier damping, less wobble. */
const FRICTION = 0.85;
/** Cursor influence radius, CSS px. */
const REPULSE_RADIUS = 20;
/** Inverse-square repulsion scale. Raise for a bigger "shove". */
const REPULSE_STRENGTH = 600;
/** Tap (touch) impulse: blast radius (CSS px) and kick strength. */
const TAP_RADIUS = 130;
const TAP_STRENGTH = 14;

/** Load-in: wait for the hero headline, then settle center-out. */
const INTRO_DELAY = 0; // ms after mount before the first particles move
const INTRO_STAGGER = 500; // ms between center particles and edge particles
const INTRO_FADE = 500; // ms each particle takes to fade in
const INTRO_SCATTER = 80; // ±px random offset particles start from

/** Hover color reveal: accent → true photo color lerp time (ms). */
const COLOR_LERP_MS = 400;

/** Dot size range (CSS px), mapped from brightness. */
const RADIUS_MIN = 0.8;
const RADIUS_MAX = 2.2;
/** Dot opacity range, mapped from brightness. */
const ALPHA_MIN = 0.25;
const ALPHA_MAX = 1;

/** Cap devicePixelRatio so 3x phone screens don't triple the fill cost. */
const DPR_CAP = 2;

/* ==================================================================== */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number;
  hy: number;
  /** Scatter offset the particle starts at (relative to home). */
  sx: number;
  sy: number;
  /** ms after INTRO_DELAY when this particle starts settling (center-out). */
  introAt: number;
  radius: number;
  baseAlpha: number;
  /** True photo color (hover reveal target). */
  r: number;
  g: number;
  b: number;
}

/** Build particles from samples, fitted (letterboxed) into w×h CSS px. */
function buildParticles(
  samples: PortraitSample[],
  aspect: number,
  w: number,
  h: number,
): Particle[] {
  // Contain-fit the image box inside the canvas, centered.
  const drawW = Math.min(w, h * aspect);
  const drawH = drawW / aspect;
  const ox = (w - drawW) / 2;
  const oy = (h - drawH) / 2;

  return samples.map((s) => {
    const hx = ox + s.nx * drawW;
    const hy = oy + s.ny * drawH;
    // Stagger the intro by distance from the portrait center (0 = center).
    const centerDist = Math.hypot(s.nx - 0.5, s.ny - 0.5) / Math.hypot(0.5, 0.5);
    const sx = (Math.random() * 2 - 1) * INTRO_SCATTER;
    const sy = (Math.random() * 2 - 1) * INTRO_SCATTER;
    return {
      x: hx + sx,
      y: hy + sy,
      vx: 0,
      vy: 0,
      hx,
      hy,
      sx,
      sy,
      introAt: centerDist * INTRO_STAGGER,
      radius: lerp(RADIUS_MIN, RADIUS_MAX, s.brightness),
      baseAlpha: lerp(ALPHA_MIN, ALPHA_MAX, s.brightness),
      r: s.r,
      g: s.g,
      b: s.b,
    };
  });
}

/**
 * Option A — the photo as a field of accent-colored dots with spring physics.
 * Cursor pushes particles away; on hover they reveal the true photo colors;
 * taps on touch devices send a radial shockwave.
 */
export default function ParticlePortrait({ ariaLabel }: { ariaLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sampled = useImageSampler(GRID_STEP, BRIGHTNESS_THRESHOLD, MAX_PARTICLES);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sampled) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const accent: Rgb = readCssRgb('--color-accent', { r: 94, g: 242, b: 184 });

    /* ---- mutable loop state (refs-by-closure; no React state here) ---- */
    let particles: Particle[] = [];
    let cssW = 0;
    let cssH = 0;
    let rafId = 0;
    let running = false;
    let inView = true;
    // Pointer position in CSS px; active only while over the canvas.
    const pointer = { x: 0, y: 0, active: false };
    // 0 = accent color, 1 = true photo color; eased toward colorTarget.
    let colorT = 0;
    let colorTarget = 0;
    let lastFrame = 0;
    const mountedAt = performance.now();

    /* ---------------- sizing ---------------- */

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      cssW = rect.width;
      cssH = rect.height;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      // Draw in CSS px from here on; DPR is absorbed by the transform.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-derive homes from the memoized samples (no photo re-decode).
      // Keep each particle's current offset from home so an in-flight
      // animation doesn't visibly snap on resize.
      const next = buildParticles(sampled.samples, sampled.aspect, cssW, cssH);
      if (particles.length === next.length) {
        for (let i = 0; i < next.length; i++) {
          const old = particles[i];
          next[i].x = next[i].hx + (old.x - old.hx);
          next[i].y = next[i].hy + (old.y - old.hy);
          next[i].vx = old.vx;
          next[i].vy = old.vy;
        }
      }
      particles = next;
      if (reduced) drawStatic();
    };

    /* ---------------- drawing ---------------- */

    /** Reduced-motion path: everything settled at home, accent color. */
    const drawStatic = () => {
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = `rgb(${accent.r} ${accent.g} ${accent.b})`;
      for (const p of particles) {
        ctx.globalAlpha = p.baseAlpha;
        ctx.beginPath();
        ctx.arc(p.hx, p.hy, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);
      const dt = lastFrame ? Math.min(now - lastFrame, 64) : 16;
      lastFrame = now;

      // Ease the global color mix toward its target (~COLOR_LERP_MS full swing).
      colorT = clamp(colorT + ((colorTarget - colorT) * dt) / COLOR_LERP_MS, 0, 1);

      const introElapsed = now - mountedAt - INTRO_DELAY;

      ctx.clearRect(0, 0, cssW, cssH);
      for (const p of particles) {
        // Load-in: before its stagger slot, the particle is invisible and
        // parked at its scatter position — skip physics entirely.
        const life = introElapsed - p.introAt;
        if (life < 0) continue;
        const introAlpha = clamp(life / INTRO_FADE, 0, 1);

        if (pointer.active) {
          repelFrom(p, pointer.x, pointer.y, REPULSE_RADIUS, REPULSE_STRENGTH);
        }
        springStep(p, SPRING, FRICTION);

        // Mix accent → true photo color by the global hover factor.
        const r = lerp(accent.r, p.r, colorT);
        const g = lerp(accent.g, p.g, colorT);
        const b = lerp(accent.b, p.b, colorT);
        ctx.fillStyle = `rgb(${r | 0} ${g | 0} ${b | 0})`;
        ctx.globalAlpha = p.baseAlpha * introAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
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

    /* ---------------- input ---------------- */

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.offsetX;
      pointer.y = e.offsetY;
      pointer.active = true;
    };
    const onPointerEnter = () => {
      // Color reveal is desktop-only (pointer: fine).
      if (hasFinePointer()) colorTarget = 1;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      colorTarget = 0;
    };
    const onPointerDown = (e: PointerEvent) => {
      if (reduced) return;
      // Touch has no hover — a tap sends a radial shockwave instead.
      if (e.pointerType === 'touch') {
        for (const p of particles) {
          radialImpulse(p, e.offsetX, e.offsetY, TAP_RADIUS, TAP_STRENGTH);
        }
      }
    };
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerenter', onPointerEnter);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('pointercancel', onPointerLeave);
    canvas.addEventListener('pointerdown', onPointerDown);

    syncLoop();

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerenter', onPointerEnter);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointercancel', onPointerLeave);
      canvas.removeEventListener('pointerdown', onPointerDown);
    };
  }, [sampled]);

  return <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label={ariaLabel} />;
}
