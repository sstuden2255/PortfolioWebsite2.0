import { jobs } from '../../data/content';
import { useLinePassed } from '../../hooks/useLinePassed';
import type { Job } from '../../types';
import styles from './Experience.module.css';

/**
 * One timeline entry. Lights up (reversibly) when The Line's pen tip
 * passes its node dot: dot glows on, header then summary fade up on a
 * 60ms stagger. Scrolling back up powers it back down.
 */
function Entry({ job }: { job: Job }) {
  const { ref, passed } = useLinePassed<HTMLLIElement>(12);

  return (
    <li ref={ref} className={`${styles.entry} ${passed ? styles.entryLit : ''}`}>
      {/* Timeline node dot, drawn by CSS ::before on .entry */}
      <div className={styles.entryHeader}>
        <h3 className={styles.role}>
          {job.role} <span className={styles.company}>@ {job.company}</span>
        </h3>
        <p className={styles.meta}>
          <span className={styles.dates}>{job.dates}</span>
          {job.location && (
            <>
              <span className={styles.metaDivider} aria-hidden="true">
                ·
              </span>
              <span>{job.location}</span>
            </>
          )}
        </p>
      </div>

      <p className={styles.summary}>{job.summary}</p>
    </li>
  );
}

/**
 * Chronological timeline of roles hanging off The Line (the page rail
 * drawn by the App shell). The section heading carries a node on the
 * rail; each entry's dot sits on it and activates as the line passes.
 */
export default function Experience() {
  const heading = useLinePassed<HTMLHeadingElement>();

  return (
    <section id="experience" className={styles.section} aria-labelledby="experience-heading">
      <h2
        id="experience-heading"
        ref={heading.ref}
        className={`${styles.heading} ${heading.passed ? styles.headingLit : ''}`}
      >
        <span className={styles.headingIndex}>01.</span> Experience
      </h2>

      <ol className={styles.timeline}>
        {jobs.map((job) => (
          <Entry key={`${job.company}-${job.role}`} job={job} />
        ))}
      </ol>
    </section>
  );
}
