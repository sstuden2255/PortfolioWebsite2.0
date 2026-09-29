# Simon Studen — Portfolio

Personal portfolio site. React + Vite + TypeScript, styled with CSS Modules (no UI kits, no Tailwind).

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run lint
```

## Where things live

- `src/data/content.ts` — **all** site copy (jobs, projects, skills, links), typed against `src/types/index.ts`. Edit content here, not in components.
- `src/globals.css` — design tokens (colors, fonts, spacing) + reset. Components consume the CSS variables.
- `src/components/*` — one folder per section (`Nav`, `Hero`, `Experience`, `Projects`, `Skills`), each with a `.tsx` + `.module.css`.
- `public/resume.pdf` — current resume. `public/screenshots/` — project screenshots.
- `docs/JOURNAL.md` — dated development log of every feature.

## Deploy

Firebase Hosting (project `portfolio-website-97d95`). GitHub Actions builds and deploys to the live channel on every push to `main`, and posts a preview channel on pull requests. Live at https://sstuden.me (custom domain; also served at https://portfolio-website-97d95.web.app).

## Status

**Built**

- [x] Sections: Nav, Hero, Experience, Projects, Skills, footer — all with real content
- [x] "The Line" scroll rail — continuous, reversible, scroll-driven section power-on
- [x] Interactive hero portrait (particles + ASCII matrix rain), reduced-motion safe
- [x] Real GitHub / LinkedIn URLs, resume, and App/Play Store links
- [x] Screenshots for Sporcle Party and Sporcle App
- [x] Mobile overflow fixes (hero glow, narrow viewports)
- [x] CI deploys to Firebase Hosting, live on sstuden.me

**Remaining before launch**

- [ ] Pick a winning portrait mode and delete the loser + the temporary A/B switcher
- [ ] Tune animation constants by eye (portrait physics, rail pen-tip / connector timing)
- [ ] Set `og:url` (https://sstuden.me) / `og:image` in `index.html`
- [ ] Cross-browser + mobile QA pass
- [ ] Accessibility audit (keyboard, VoiceOver, accent contrast)
- [ ] Lighthouse performance check on production
- [ ] Shop Autonomy: screenshot + availability once it launches
