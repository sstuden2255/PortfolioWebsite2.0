import { useEffect, useState } from 'react';
import portraitUrl from '../../../assets/portrait.jpeg';

/**
 * useImageSampler — shared brightness-grid sampler for both portrait modes.
 *
 * The photo is decoded exactly ONCE per page load (module-level promise),
 * scaled to SAMPLE_TARGET_WIDTH on an offscreen canvas, and its pixels are read
 * into memory. Each mode then asks for a grid of samples at its own step /
 * threshold; those results are memoized too, so switching modes back and
 * forth never re-decodes or re-reads the image.
 *
 * Samples use NORMALIZED coordinates (0..1 within the image). The canvas
 * components map them to device pixels on every resize, which is why a
 * resize never needs to touch this module.
 */

/** Width (px) the photo is downscaled to before pixel reads. Higher = more
 *  potential samples and finer detail, but more memory and sampling work.
 *  Exported so consumers can convert grid steps into on-canvas cell sizes. */
export const SAMPLE_TARGET_WIDTH = 1280;
const TARGET_WIDTH = SAMPLE_TARGET_WIDTH;

/** Default: skip cells darker than this (0..1). Raise to carve away more of
 *  the background; lower to let shadow detail into the portrait. */
const DEFAULT_THRESHOLD = 0.18;

/** Aspect (w/h) of the procedural fallback drawn if the photo fails to load. */
const FALLBACK_ASPECT = 4 / 5;

export interface PortraitSample {
  /** Position normalized to the image box: 0..1 from the left / top edge. */
  nx: number;
  ny: number;
  /** Perceptual luminance, 0 (black) .. 1 (white). */
  brightness: number;
  /** True sampled photo color. */
  r: number;
  g: number;
  b: number;
}

export interface SampledPortrait {
  samples: PortraitSample[];
  /** Image aspect ratio (width / height) — used to letterbox-fit the grid. */
  aspect: number;
  /** Grid step actually used (may be larger than requested; see maxSamples). */
  step: number;
}

interface Pixels {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

/* ------------------------------------------------------------------ */
/* Decode (once)                                                       */
/* ------------------------------------------------------------------ */

let pixelsPromise: Promise<Pixels> | null = null;

function decodePortrait(): Promise<Pixels> {
  if (!pixelsPromise) {
    pixelsPromise = new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(rasterize(img));
      // Photo missing/corrupt: fall back to a procedural gradient so the
      // portrait (and the rest of the site) still renders.
      img.onerror = () => resolve(fallbackPixels());
      img.src = portraitUrl;
    });
  }
  return pixelsPromise;
}

/** Downscale the decoded image onto an offscreen canvas and read its pixels. */
function rasterize(img: HTMLImageElement): Pixels {
  const width = TARGET_WIDTH;
  const height = Math.max(1, Math.round(width * (img.naturalHeight / img.naturalWidth)));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return fallbackPixels();
  ctx.drawImage(img, 0, 0, width, height);
  return { data: ctx.getImageData(0, 0, width, height).data, width, height };
}

/** Soft radial gradient stand-in — bright center fading to dark edges, so
 *  the threshold still yields an oval "portrait-ish" cloud of samples. */
function fallbackPixels(): Pixels {
  const width = TARGET_WIDTH;
  const height = Math.round(width / FALLBACK_ASPECT);
  const data = new Uint8ClampedArray(width * height * 4);
  const cx = width / 2;
  const cy = height * 0.42; // bias the bright blob toward "head" height
  const maxDist = Math.hypot(cx, cy);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = 1 - Math.min(1, Math.hypot(x - cx, y - cy) / maxDist);
      const v = Math.round(230 * t * t); // quadratic falloff, dark corners
      const i = (y * width + x) * 4;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  return { data, width, height };
}

/* ------------------------------------------------------------------ */
/* Sampling (memoized per configuration)                               */
/* ------------------------------------------------------------------ */

const sampleCache = new Map<string, SampledPortrait>();

function sampleAtStep(px: Pixels, step: number, threshold: number): PortraitSample[] {
  const samples: PortraitSample[] = [];
  // Sample cell centers so the grid stays visually centered at any step.
  const half = step / 2;
  for (let y = half; y < px.height; y += step) {
    for (let x = half; x < px.width; x += step) {
      const i = (Math.floor(y) * px.width + Math.floor(x)) * 4;
      const r = px.data[i];
      const g = px.data[i + 1];
      const b = px.data[i + 2];
      // Rec. 709 luma — perceptual enough for thresholding/opacity mapping.
      const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      if (brightness < threshold) continue;
      samples.push({ nx: x / px.width, ny: y / px.height, brightness, r, g, b });
    }
  }
  return samples;
}

/**
 * Sample the (already decoded) portrait on a grid.
 * If the result would exceed `maxSamples`, the step is raised automatically
 * until it fits — this is the particle/glyph cap enforcement.
 */
async function samplePortrait(
  step: number,
  threshold: number,
  maxSamples: number,
): Promise<SampledPortrait> {
  const key = `${step}:${threshold}:${maxSamples}`;
  const cached = sampleCache.get(key);
  if (cached) return cached;

  const px = await decodePortrait();
  let usedStep = step;
  let samples = sampleAtStep(px, usedStep, threshold);
  while (samples.length > maxSamples && usedStep < px.width) {
    usedStep += 1;
    samples = sampleAtStep(px, usedStep, threshold);
  }

  const result: SampledPortrait = { samples, aspect: px.width / px.height, step: usedStep };
  sampleCache.set(key, result);
  return result;
}

/**
 * React hook wrapper: returns `null` until the photo is decoded and sampled,
 * then the memoized sample set. Args are primitives on purpose so callers
 * can pass constants without memo gymnastics.
 */
export function useImageSampler(
  step: number,
  threshold: number = DEFAULT_THRESHOLD,
  maxSamples: number = Infinity,
): SampledPortrait | null {
  const [sampled, setSampled] = useState<SampledPortrait | null>(null);

  useEffect(() => {
    let alive = true;
    samplePortrait(step, threshold, maxSamples).then((result) => {
      if (alive) setSampled(result);
    });
    return () => {
      alive = false;
    };
  }, [step, threshold, maxSamples]);

  return sampled;
}
