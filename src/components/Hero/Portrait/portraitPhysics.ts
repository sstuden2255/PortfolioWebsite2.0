/**
 * portraitPhysics — tiny shared toolbox for both portrait modes.
 *
 * Pure functions only: spring/repulsion integration, color parsing/mixing,
 * and a couple of media-query helpers. No React, no canvas — both modes call
 * these from inside their own rAF loops.
 *
 * The spring/friction constants both modes pass in are PER-FRAME factors
 * (tuned for ~60fps), not per-second rates — matching how the tunables are
 * specified at the top of each mode file.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Anything the spring/repulsion helpers can push around:
 *  current position + velocity + a fixed "home" to return to. */
export interface SpringBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number;
  hy: number;
}

/* ------------------------------------------------------------------ */
/* Math                                                                */
/* ------------------------------------------------------------------ */

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/* ------------------------------------------------------------------ */
/* Physics                                                             */
/* ------------------------------------------------------------------ */

/**
 * One integration step of a damped spring pulling the body home.
 * `spring` = pull strength per frame (0.08 ≈ snappy but soft),
 * `friction` = velocity kept per frame (0.85 ≈ settles in ~15 frames).
 */
export function springStep(p: SpringBody, spring: number, friction: number): void {
  p.vx += (p.hx - p.x) * spring;
  p.vy += (p.hy - p.y) * spring;
  p.vx *= friction;
  p.vy *= friction;
  p.x += p.vx;
  p.y += p.vy;
}

/**
 * Inverse-square repulsion away from (px, py), applied only within `radius`.
 * The denominator is floored (d² ≥ 25) so bodies sitting on the cursor
 * don't receive an explosive kick.
 */
export function repelFrom(
  p: SpringBody,
  px: number,
  py: number,
  radius: number,
  strength: number,
): void {
  const dx = p.x - px;
  const dy = p.y - py;
  const d2 = dx * dx + dy * dy;
  if (d2 >= radius * radius || d2 === 0) return;
  const d = Math.sqrt(d2);
  const force = strength / Math.max(d2, 25);
  p.vx += (dx / d) * force;
  p.vy += (dy / d) * force;
}

/**
 * One-shot radial kick away from (cx, cy) — used for taps on touch devices.
 * Falls off linearly to zero at `radius`.
 */
export function radialImpulse(
  p: SpringBody,
  cx: number,
  cy: number,
  radius: number,
  strength: number,
): void {
  const dx = p.x - cx;
  const dy = p.y - cy;
  const d = Math.hypot(dx, dy);
  if (d >= radius || d === 0) return;
  const falloff = 1 - d / radius;
  p.vx += (dx / d) * strength * falloff;
  p.vy += (dy / d) * strength * falloff;
}

/* ------------------------------------------------------------------ */
/* Color                                                               */
/* ------------------------------------------------------------------ */

/** Parse `#rgb` / `#rrggbb` (what our design tokens use). */
export function hexToRgb(hex: string): Rgb | null {
  const s = hex.trim().replace(/^#/, '');
  if (s.length === 3) {
    const r = parseInt(s[0] + s[0], 16);
    const g = parseInt(s[1] + s[1], 16);
    const b = parseInt(s[2] + s[2], 16);
    if (Number.isNaN(r + g + b)) return null;
    return { r, g, b };
  }
  if (s.length === 6) {
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    if (Number.isNaN(r + g + b)) return null;
    return { r, g, b };
  }
  return null;
}

/** Read a CSS custom property color off :root (e.g. '--color-accent'). */
export function readCssRgb(varName: string, fallback: Rgb): Rgb {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName);
  return hexToRgb(raw) ?? fallback;
}

/* ------------------------------------------------------------------ */
/* Environment                                                         */
/* ------------------------------------------------------------------ */

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True for mouse/trackpad devices — gates the hover color-reveal effects. */
export function hasFinePointer(): boolean {
  return window.matchMedia('(pointer: fine)').matches;
}
