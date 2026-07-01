import Nav from './components/Nav/Nav';
import Hero from './components/Hero/Hero';
import Experience from './components/Experience/Experience';
import Projects from './components/Projects/Projects';
import Skills from './components/Skills/Skills';
import { name, socials } from './data/content';
import styles from './App.module.css';

/**
 * Page shell. Layout order = nav, hero, then anchor-linked sections.
 * All copy comes from src/data/content.ts.
 */
export default function App() {
  return (
    <>
      {/* Lets keyboard users jump past the nav straight to content */}
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>

      <Nav />

      <main id="main" className={styles.main}>
        <Hero />
        <Experience />
        <Projects />
        <Skills />
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerNote}>
          Designed &amp; built by{' '}
          <a
            href={socials.github}
            className={styles.footerLink}
            target="_blank"
            rel="noreferrer"
          >
            {name}
          </a>
        </p>
        <p className={styles.footerMeta}>© {new Date().getFullYear()} · React + Vite + TypeScript</p>
      </footer>
    </>
  );
}
