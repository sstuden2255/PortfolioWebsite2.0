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
- `public/resume.pdf` — placeholder; replace with the real resume.

## TODO before launch

- [ ] Real GitHub / LinkedIn URLs in `src/data/content.ts` (`socials`)
- [ ] Real project entries + links in `src/data/content.ts` (`projects`)
- [ ] Replace `public/resume.pdf`
- [ ] Set `og:url` / `og:image` in `index.html` after deploy
