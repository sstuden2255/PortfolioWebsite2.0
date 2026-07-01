/**
 * Shared content interfaces.
 * All site copy in src/data/content.ts is typed against these,
 * so adding/editing content gets compile-time checking.
 */

export interface Job {
  company: string;
  role: string;
  dates: string;
  location: string;
  bullets: string[];
}

export interface Project {
  title: string;
  description: string;
  stack: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

/** A link rendered as a nav anchor (href is an in-page "#section" id). */
export interface NavLink {
  label: string;
  href: string;
}

/** External profile / document links used in the hero and footer. */
export interface SocialLinks {
  github: string;
  linkedin: string;
  resume: string;
}
