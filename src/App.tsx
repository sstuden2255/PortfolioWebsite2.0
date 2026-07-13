import { useCallback } from 'react';
import Nav from './components/Nav/Nav';
import Hero from './components/Hero/Hero';
import Experience from './components/Experience/Experience';
import Projects from './components/Projects/Projects';
import Skills from './components/Skills/Skills';
import { name, socials } from './data/content';
import { useLinePassed } from './hooks/useLinePassed';
import { useScrollProgress } from './hooks/useScrollProgress';
import styles from './App.module.css';

/**
 * The Line's terminal cap: a node + mono label where the rail ends.
 * Purely decorative — lights up when the line finishes drawing.
 */
function TerminalCap() {
  const { ref, passed } = useLinePassed<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${styles.terminal} ${passed ? styles.terminalLit : ''}`}
      aria-hidden="true"
    >
      <span className={styles.terminalLabel}>{'// end of line'}</span>
    </div>
  );
}

/**
 * Page shell. Layout order = nav, hero, then anchor-linked sections.
 * All copy comes from src/data/content.ts.
 *
 * The rail zone hosts "The Line": a single accent rail running down the
 * left edge of every section after the hero (which contributes the stub
 * it hands off from). The rail's scaleY is bound per-frame to scroll
 * progress; sections hang their own nodes/branches on it via
 * useLinePassed and the shared --rail-gutter geometry.
 */
export default function App() {
  const handleProgress = useCallback((progress: number, el: HTMLElement) => {
    el.style.setProperty('--line-progress', String(progress));
  }, []);
  const railRef = useScrollProgress<HTMLDivElement>(handleProgress);

  return (
    <>
      {/* Lets keyboard users jump past the nav straight to content */}
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>

      <Nav />

      <main id="main" className={styles.main}>
        <Hero />

        <div ref={railRef} className={styles.railZone}>
          <div className={styles.railTrack} aria-hidden="true" />
          <div className={styles.railLine} aria-hidden="true" />

          <Experience />
          <Projects />
          <Skills />

          <TerminalCap />
        </div>
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
