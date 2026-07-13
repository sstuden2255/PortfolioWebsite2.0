# Development Journal

Chronological log of features and notable changes to the portfolio site. Newest entries at the top.

---

## 2026-07-10 — "The Line" v2: one continuous rail, fully scrubbed

Reworked the scroll narrative after feedback that v1 wasn't involved enough: the line is now a single continuous rail from the hero to a terminal cap after Skills, and every section physically hangs off it. All activation is **reversible** — scroll back up and the UI powers back down, so the page scrubs like a mechanism driven by the scroll position.

- **Shared engine (`src/hooks/scrollLine.ts`):** one passive scroll/resize/load listener set + a single rAF feeds all subscribers (instead of per-hook listeners). Subscribers split `measure` (layout reads — mount/resize/load only) from `update` (per-frame, `scrollY` + cached values only). Pen tip at 75% viewport height (`TIP_RATIO`).
- **Hooks:** `useScrollProgress` rebuilt on the engine; new `useLinePassed(offset)` gives any element a reversible "the line has reached me" boolean (state updates only on flips, not per frame). `useReveal` (IntersectionObserver, one-shot) deleted — everything now binds to the line.
- **Rail (`App.tsx`/`App.module.css`):** post-hero sections wrap in a `railZone` (left padding `--rail-gutter`, new token in `globals.css`, responsive at 560px). A faint track + accent line (scaleY = `--line-progress`) run its full height at x = 5..6px. All rail furniture (dots, connectors) positions itself with calcs against `--rail-gutter`, so one token realigns every section. Ends in a `TerminalCap` ("// end of line") that lights when the line completes.
- **Hero:** stub is now absolutely anchored to the hero's bottom edge (`min(18svh, 10rem)`, transparent→accent gradient) so it meets the rail track exactly.
- **Experience:** internal timeline line removed (rail replaces it); entries simplified to per-entry `useLinePassed` (no more offset caching in the component). Section headings across all three sections carry a 13px node on the rail that fills when passed.
- **Projects:** each card gets a junction dot on the rail + a connector branch that draws (`scaleX`) into the card as the line passes; the card "powers on" — fades up from 40% opacity, border lights to a new `--color-accent-border` token, phone frame glows, tags pop in 40ms apart. Powers off in reverse on scroll-up.
- **Skills restructured:** boxed grid cards replaced by full-width rows branching off the rail — `15rem 1fr` grid (category label | pills), junction + connector per row, label fades in as its branch connects, pills cascade left-to-right (reveal delays are per-property so pill hover stays instant). Stacks at 720px.
- **Reduced motion:** base CSS is the fully-lit look; every unlit/hidden state lives only behind `(prefers-reduced-motion: no-preference)`, and both hooks short-circuit (progress 1 / passed immediately). All power cycles are opacity/transform/color only — no layout shift.
- **Verified:** `tsc -b` clean, `oxlint` clean, `vite build` succeeds.

### Follow-ups
- [ ] Tune pen-tip ratio (0.75), connector timing, and unpowered card opacity (0.4) by eye in the browser

---

## 2026-07-10 — Scroll narrative: "The Line"

The site's signature motion: content draws itself as the user scrolls. Hooks + CSS only — no animation library. All reveals are opacity/transform, so they never cause layout shift.

- **`src/hooks/useScrollProgress.ts`:** binds a callback to an element's scroll progress (0→1 as a "pen tip" at 75% viewport height crosses it). rAF-coalesced passive scroll listener; layout reads (`getBoundingClientRect`) happen only on mount/resize/load, never in the scroll hot path. Under reduced motion it fires once with progress 1.
- **`src/hooks/useReveal.ts`:** one-shot IntersectionObserver reveal (threshold 0.25, disconnects after firing) exposing an `isVisible` flag that components map to a CSS-module "visible" class. All transitions live in CSS (0.5–0.7s, `--ease-out` token added to `globals.css`: `cubic-bezier(0.22, 1, 0.36, 1)`).
- **Experience:** accent line (`.timeline::after`) draws top-to-bottom, `scaleY` bound to `--line-progress` set per-frame by the hook. As the line tip passes each entry it activates once (one-way, stays lit scrolling back up): node dot glows on, header then summary fade up 16px on a 60ms stagger. (Spec said "bullets stagger" — entries are prose now, so the stagger applies to header/summary.)
- **Projects:** on reveal, card fades up, tech-stack tags stagger in 40ms apart (`--i` inline var), then the card border glows on via a one-shot keyframe delayed past the last tag (`--tag-count` inline var) — "assemble from the stack."
- **Skills:** each group's pills cascade in as a left-to-right wave (fade + translateX, per-pill delay; reveal delays are per-property so pill hover colors stay instant).
- **Hero:** a short vertical accent line stub draws in after the load stagger (`--stagger: 6`), pointing toward the Experience timeline.
- **Reduced motion:** every hidden initial state is gated behind `@media (prefers-reduced-motion: no-preference)`; under `reduce` all content renders fully visible and the line fully drawn (CSS default + both hooks short-circuit). No exceptions.
- **Verified:** `tsc -b` clean, `oxlint` clean, `vite build` succeeds.

### Follow-ups
- [ ] Eyeball the timing/stagger values in the browser and tune to taste

---

## 2026-07-10 — Real content + Experience/Projects restructure

Replaced the placeholder copy with Simon's real experience, projects, and skills, and reshaped the UI to fit the new content.

- **Type contracts (`src/types/index.ts`):** `Job.bullets: string[]` → `Job.summary: string` (roles are now single prose paragraphs) and `Job.location` is optional. `Project` reworked: dropped `description: string` + `stack[]` + `liveUrl`/`githubUrl`, added `platform`, `description: string[]` (multi-paragraph), `availability`, and `appStoreUrl`/`playStoreUrl`.
- **Content (`src/data/content.ts`):** four real roles (Sporcle, Able Opportunities, Akkompany, Juni Learning) and three real projects (Shop Autonomy, Sporcle App, Sporcle Party). Skills regrouped into Programming Languages, AI Engineering, Backend & Systems, Mobile & Frontend, Tools & Engineering Practices.
- **Experience UI:** timeline entry now renders a flowing prose `summary` paragraph instead of a bullet list; meta line guards the now-optional location.
- **Projects UI:** switched from a multi-column card grid to a single-column stack of long-form write-ups — platform label under the title, prose paragraphs capped at ~62ch for readability, an accent availability pill, and App/Play Store link icons (replacing GitHub/live-demo links).
- **Verified:** `tsc -b` clean, `oxlint` clean.

### Outstanding placeholders
- [ ] Replace `public/resume.pdf` with the real resume
- [ ] Fill in the `#` App Store / Play Store URLs for Sporcle App and Sporcle Party in `content.ts`
- [ ] Set `og:url` / `og:image` in `index.html` once deployed

---

## 2026-07-01 — Initial site build

Scaffolded and built the full portfolio site from an empty repo.

- **Stack:** React + Vite + TypeScript, CSS Modules for styling (no Tailwind, no UI kit, no animation library).
- **Design tokens:** `src/globals.css` — dark/near-black palette with a single mint accent (`#5ef2b8`), DM Mono (display/mono) + Outfit (body) fonts, 4px spacing scale, reset, global `prefers-reduced-motion` handling.
- **Content architecture:** all copy lives in `src/data/content.ts`, typed against `src/types/index.ts` (`Job`, `Project`, `SkillGroup`, `NavLink`, `SocialLinks`). Components render data only.
- **Sections built:** `Nav` (fixed, scroll-aware blur, blinking-cursor logo), `Hero` (staggered fade-up load-in, GitHub/LinkedIn/Resume buttons), `Experience` (timeline for Sporcle + Able Opportunities), `Projects` (card grid — Trailhead, Setlist, Pocket Pantry placeholders), `Skills` (grouped pill tags).
- **Extras:** hand-written inline SVG icons (`src/assets/icons.tsx`), skip-to-content link, SEO + Open Graph meta in `index.html`, custom SVG favicon, placeholder `public/resume.pdf`.
- **Verified:** `tsc -b` type-check clean, `npm run build` succeeds, `oxlint` clean, dev server serves the page and static assets correctly.
- Real GitHub/LinkedIn URLs were filled in shortly after (`src/data/content.ts`); resume PDF and the three project entries are still placeholders — see `TODO` comments in `content.ts`.

### Outstanding placeholders
- [ ] Replace `public/resume.pdf` with the real resume
- [ ] Replace the three placeholder projects (Trailhead, Setlist, Pocket Pantry) with real projects + links
- [ ] Set `og:url` / `og:image` in `index.html` once deployed
