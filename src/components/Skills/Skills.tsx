import { skillGroups } from '../../data/content';
import { useLinePassed } from '../../hooks/useLinePassed';
import type { SkillGroup } from '../../types';
import styles from './Skills.module.css';

/**
 * One category row hanging off The Line: a junction dot + connector
 * branch draw from the rail into the category label as the pen tip
 * passes, then the pills cascade in as one soft left-to-right wave.
 * Fully reversible — scrolling back up retracts the wave.
 */
function SkillRow({ group }: { group: SkillGroup }) {
  const { ref, passed } = useLinePassed<HTMLDivElement>(12);

  return (
    <div ref={ref} className={`${styles.row} ${passed ? styles.rowLit : ''}`}>
      <h3 className={styles.category}>
        <span className={styles.categoryMarker} aria-hidden="true">
          &gt;
        </span>
        {group.category}
      </h3>
      <ul className={styles.pills}>
        {group.skills.map((skill, i) => (
          <li
            key={skill}
            className={styles.pill}
            style={{ '--i': i } as React.CSSProperties}
          >
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Skills as labeled rows branching off The Line — the h2/h3 hierarchy
 * stays clean: h2 (section) → h3 (category) → list of skills.
 */
export default function Skills() {
  const heading = useLinePassed<HTMLHeadingElement>();

  return (
    <section id="skills" className={styles.section} aria-labelledby="skills-heading">
      <h2
        id="skills-heading"
        ref={heading.ref}
        className={`${styles.heading} ${heading.passed ? styles.headingLit : ''}`}
      >
        <span className={styles.headingIndex}>03.</span> Skills
      </h2>

      <div className={styles.rows}>
        {skillGroups.map((group) => (
          <SkillRow key={group.category} group={group} />
        ))}
      </div>
    </section>
  );
}
