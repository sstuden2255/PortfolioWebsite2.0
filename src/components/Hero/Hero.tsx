import { DownloadIcon, GitHubIcon, LinkedInIcon, MapPinIcon } from '../../assets/icons';
import { education, location, name, socials, tagline, title } from '../../data/content';
import styles from './Hero.module.css';

/**
 * Full-height hero with a staggered load-in.
 * Each line gets a `--stagger` index; the CSS animation-delay is
 * computed from it, so reordering lines never means retuning delays.
 */
export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Introduction">
      {/* Decorative background glow, ignored by assistive tech */}
      <div className={styles.glow} aria-hidden="true" />

      <p className={styles.kicker} style={{ '--stagger': 0 } as React.CSSProperties}>
        <span className={styles.kickerComment}>{'// hello, my name is'}</span>
      </p>

      <h1 className={styles.name} style={{ '--stagger': 1 } as React.CSSProperties}>
        {name}
      </h1>

      <p className={styles.title} style={{ '--stagger': 2 } as React.CSSProperties}>
        {title}
      </p>

      <p className={styles.tagline} style={{ '--stagger': 3 } as React.CSSProperties}>
        {tagline}
      </p>

      <p className={styles.meta} style={{ '--stagger': 4 } as React.CSSProperties}>
        <MapPinIcon size={15} />
        <span>{location}</span>
        <span className={styles.metaDivider} aria-hidden="true">
          ·
        </span>
        <span>{education}</span>
      </p>

      <div className={styles.actions} style={{ '--stagger': 5 } as React.CSSProperties}>
        <a
          href={socials.github}
          className={styles.button}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub profile"
        >
          <GitHubIcon size={18} />
          GitHub
        </a>
        <a
          href={socials.linkedin}
          className={styles.button}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn profile"
        >
          <LinkedInIcon size={18} />
          LinkedIn
        </a>
        <a
          href={socials.resume}
          className={`${styles.button} ${styles.buttonPrimary}`}
          download
          aria-label="Download resume as PDF"
        >
          <DownloadIcon size={18} />
          Resume
        </a>
      </div>

      {/* Line stub: draws in last, visually handing off to the
          Experience timeline's accent line below */}
      <div
        className={styles.lineStub}
        style={{ '--stagger': 6 } as React.CSSProperties}
        aria-hidden="true"
      />
    </section>
  );
}
