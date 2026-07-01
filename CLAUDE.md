# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # tsc -b (project references) then vite build -> dist/
npm run lint      # oxlint
npm run preview   # serve the production build locally
```

There is no test suite configured. Type-checking runs via `tsc -b` as part of `npm run build` (uses the project references in `tsconfig.json` -> `tsconfig.app.json` / `tsconfig.node.json`); run `npx tsc -b` directly to type-check without building.

## Architecture

Single-page portfolio site: React + Vite + TypeScript, styled with CSS Modules (no Tailwind, no UI kit, no animation library — animations are hand-written CSS keyframes).

**Content/component separation is the core rule of this codebase:** all copy — jobs, projects, skills, nav links, social URLs, hero text — lives in `src/data/content.ts`, typed against interfaces in `src/types/index.ts`. Components (`src/components/*`) import from `content.ts` and render; they never hardcode copy in JSX. When adding or editing site content, edit `content.ts`, not the component files.

Each section is a folder under `src/components/` with a matching `.tsx` + `.module.css` pair (`Nav`, `Hero`, `Experience`, `Projects`, `Skills`). `src/App.tsx` composes them in order and renders the shared footer; anchor navigation (`#experience`, `#projects`, `#skills`) relies on native CSS smooth scrolling (`scroll-behavior` in `globals.css`), not JS scroll handling — the only component-level JS scroll listener is in `Nav.tsx`, used purely to toggle the frosted-blur background once the page scrolls past the hero.

`src/globals.css` defines the full design-token set (colors, fonts, spacing scale, radii, transition timing) as CSS custom properties on `:root`, plus the reset and a global `prefers-reduced-motion` override. Every `.module.css` file consumes these variables rather than hardcoding values — keep new styles consistent with that token set instead of introducing new literal colors/spacing.

`src/assets/icons.tsx` holds hand-written inline SVG icon components (GitHub, LinkedIn, download, external-link, map-pin) instead of an icon library dependency. Icons render `aria-hidden`; the parent link/button carries the accessible label.

Static files (`public/resume.pdf`, `public/favicon.svg`) are placeholders pending real content — see the TODO list in `README.md` and inline `TODO` comments in `content.ts` before treating any URL, resume, or project entry as final.

## Journal

After implementing a new feature, add a new entry to `docs/JOURNAL.md` (newest entry at the top) describing what was built and any outstanding follow-ups. This does not apply to trivial edits (typo fixes, content tweaks, dependency bumps) — only to actual feature work.
