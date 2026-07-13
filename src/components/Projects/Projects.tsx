import { AppleIcon, GooglePlayIcon, SmartphoneIcon } from '../../assets/icons';
import { projects } from '../../data/content';
import { useLinePassed } from '../../hooks/useLinePassed';
import type { Project } from '../../types';
import styles from './Projects.module.css';

/**
 * Long-form project write-ups, one per row. Each card is a two-column
 * grid — a phone-framed screenshot on the left, prose on the right.
 * Until a project has a real screenshot, the frame renders a
 * "coming soon" placeholder.
 *
 * Every card hangs off The Line: when the pen tip reaches its junction,
 * a connector branch draws from the rail into the card and the card
 * powers on — border lights, phone frame glows, tags pop in 40ms apart.
 * Fully reversible: scroll back up and the card powers down.
 *
 * Store links are labeled buttons (not bare icons); projects marked
 * `comingSoon` show disabled-looking pills instead.
 */
function ProjectCard({ project }: { project: Project }) {
  const { ref, passed } = useLinePassed<HTMLLIElement>(48);

  return (
    <li ref={ref} className={`${styles.item} ${passed ? styles.itemLit : ''}`}>
      <article className={styles.card}>
        <div className={styles.phone} aria-hidden={!project.screenshot}>
          <div className={styles.phoneFrame}>
            {project.screenshot ? (
              <img
                className={styles.phoneScreen}
                src={project.screenshot.src}
                alt={project.screenshot.alt}
                loading="lazy"
              />
            ) : (
              <div className={styles.phonePlaceholder}>
                <SmartphoneIcon size={28} />
                <span>screenshot coming soon</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.content}>
          <header>
            <h3 className={styles.title}>{project.title}</h3>
            <p className={styles.platform}>{project.platform}</p>
          </header>

          <div className={styles.body}>
            {project.description.map((paragraph, i) => (
              <p key={i} className={styles.description}>
                {paragraph}
              </p>
            ))}
          </div>

          <ul className={styles.tags} aria-label={`${project.title} tech stack`}>
            {project.tags.map((tag, i) => (
              <li
                key={tag}
                className={styles.tag}
                style={{ '--i': i } as React.CSSProperties}
              >
                {tag}
              </li>
            ))}
          </ul>

          <div className={styles.storeLinks}>
            {project.comingSoon ? (
              <p className={styles.comingSoon}>
                <SmartphoneIcon size={16} />
                Coming soon to the App Store &amp; Play Store
              </p>
            ) : (
              <>
                {project.appStoreUrl && (
                  <a
                    href={project.appStoreUrl}
                    className={styles.storeButton}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.title} on the App Store`}
                  >
                    <AppleIcon size={17} />
                    App Store
                  </a>
                )}
                {project.playStoreUrl && (
                  <a
                    href={project.playStoreUrl}
                    className={styles.storeButton}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.title} on the Play Store`}
                  >
                    <GooglePlayIcon size={16} />
                    Play Store
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}

export default function Projects() {
  const heading = useLinePassed<HTMLHeadingElement>();

  return (
    <section id="projects" className={styles.section} aria-labelledby="projects-heading">
      <h2
        id="projects-heading"
        ref={heading.ref}
        className={`${styles.heading} ${heading.passed ? styles.headingLit : ''}`}
      >
        <span className={styles.headingIndex}>02.</span> Projects
      </h2>

      <ul className={styles.list}>
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </ul>
    </section>
  );
}
