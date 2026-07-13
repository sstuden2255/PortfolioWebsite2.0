/**
 * Shared content interfaces.
 * All site copy in src/data/content.ts is typed against these,
 * so adding/editing content gets compile-time checking.
 */

export interface Job {
  company: string;
  role: string;
  dates: string;
  /** Optional — omitted when not known/relevant. */
  location?: string;
  /** Single prose paragraph summarizing the role. */
  summary: string;
}

export interface Project {
  title: string;
  /** Target platforms, e.g. "iOS & Android". */
  platform: string;
  /** One or more prose paragraphs. */
  description: string[];
  /** Tech-stack tags rendered as pills. */
  tags: string[];
  /** App screenshot; when omitted a placeholder frame renders instead. */
  screenshot?: {
    src: string;
    alt: string;
  };
  /** Renders disabled "coming soon" store pills instead of link buttons. */
  comingSoon?: boolean;
  appStoreUrl?: string;
  playStoreUrl?: string;
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
