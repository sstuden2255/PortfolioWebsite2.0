import { jobs } from '../../data/content';
import styles from './Experience.module.css';

/**
 * Chronological timeline of roles. Rendered as an ordered list
 * (semantic: entries have a meaningful newest-first order) with a
 * vertical rule + node markers drawn in CSS.
 */
export default function Experience() {
  return (
    <section id="experience" className={styles.section} aria-labelledby="experience-heading">
      <h2 id="experience-heading" className={styles.heading}>
        <span className={styles.headingIndex}>01.</span> Experience
      </h2>

      <ol className={styles.timeline}>
        {jobs.map((job) => (
          <li key={`${job.company}-${job.role}`} className={styles.entry}>
            {/* Timeline node dot, drawn by CSS ::before on .entry */}
            <div className={styles.entryHeader}>
              <h3 className={styles.role}>
                {job.role} <span className={styles.company}>@ {job.company}</span>
              </h3>
              <p className={styles.meta}>
                <span className={styles.dates}>{job.dates}</span>
                <span className={styles.metaDivider} aria-hidden="true">
                  ·
                </span>
                <span>{job.location}</span>
              </p>
            </div>

            <ul className={styles.bullets}>
              {job.bullets.map((bullet) => (
                <li key={bullet} className={styles.bullet}>
                  {bullet}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
