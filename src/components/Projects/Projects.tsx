import { ExternalLinkIcon, GitHubIcon } from '../../assets/icons';
import { projects } from '../../data/content';
import styles from './Projects.module.css';

/**
 * Card grid of projects. Each card is an <article> with its own
 * heading; icon links get aria-labels naming the project so screen
 * readers hear more than "GitHub, GitHub, GitHub".
 */
export default function Projects() {
  return (
    <section id="projects" className={styles.section} aria-labelledby="projects-heading">
      <h2 id="projects-heading" className={styles.heading}>
        <span className={styles.headingIndex}>02.</span> Projects
      </h2>

      <ul className={styles.grid}>
        {projects.map((project) => (
          <li key={project.title}>
            <article className={styles.card}>
              <div className={styles.cardTop}>
                <h3 className={styles.title}>{project.title}</h3>

                <div className={styles.links}>
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      className={styles.iconLink}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.title} source on GitHub`}
                    >
                      <GitHubIcon size={19} />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      className={styles.iconLink}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.title} live demo`}
                    >
                      <ExternalLinkIcon size={19} />
                    </a>
                  )}
                </div>
              </div>

              <p className={styles.description}>{project.description}</p>

              <ul className={styles.stack} aria-label={`${project.title} tech stack`}>
                {project.stack.map((tech) => (
                  <li key={tech} className={styles.tag}>
                    {tech}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
