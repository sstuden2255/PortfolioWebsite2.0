import { useEffect, useState } from 'react';
import { name, navLinks } from '../../data/content';
import styles from './Nav.module.css';

/**
 * Fixed top nav: name/logo left, section anchors right.
 * Smooth scrolling comes from `scroll-behavior: smooth` in globals.css
 * (auto-disabled for prefers-reduced-motion), so anchors need no JS.
 * The only state here is a scroll listener that adds a backdrop once
 * the page is scrolled, so the nav starts transparent over the hero.
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); // catch pages restored mid-scroll
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={styles.inner} aria-label="Primary">
        {/* Logo: terminal-prompt take on my initials */}
        <a href="#main" className={styles.logo} aria-label={`${name} — back to top`}>
          <span className={styles.logoPrompt}>~/</span>simon<span className={styles.logoCursor} />
        </a>

        <ul className={styles.links}>
          {navLinks.map((link, i) => (
            <li key={link.href}>
              <a href={link.href} className={styles.link}>
                {/* Numbered mono labels give the "hand-coded" feel */}
                <span className={styles.linkIndex}>0{i + 1}.</span>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
