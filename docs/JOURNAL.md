# Development Journal

Chronological log of features and notable changes to the portfolio site. Newest entries at the top.

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
