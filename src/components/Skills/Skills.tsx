import { skillGroups } from '../../data/content';
import styles from './Skills.module.css';

/**
 * Skills grouped by category, rendered as labeled pill clusters.
 * Each group is its own card with an <h3> so the hierarchy stays
 * clean: h2 (section) → h3 (category) → list of skills.
 */
export default function Skills() {
  return (
    <section id="skills" className={styles.section} aria-labelledby="skills-heading">
      <h2 id="skills-heading" className={styles.heading}>
        <span className={styles.headingIndex}>03.</span> Skills
      </h2>

      <div className={styles.grid}>
        {skillGroups.map((group) => (
          <div key={group.category} className={styles.group}>
            <h3 className={styles.category}>
              <span className={styles.categoryMarker} aria-hidden="true">
                &gt;
              </span>
              {group.category}
            </h3>
            <ul className={styles.pills}>
              {group.skills.map((skill) => (
                <li key={skill} className={styles.pill}>
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
