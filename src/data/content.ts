/**
 * content.ts — single source of truth for all site copy.
 * Components import from here and render; nothing is hardcoded in JSX.
 *
 * TODO(Simon): add real app screenshots to the projects (drop images in
 * public/screenshots/ and set `screenshot: { src, alt }` — the phone
 * frame shows a placeholder until then). Resume lives at public/resume.pdf.
 */

import type { Job, NavLink, Project, SkillGroup, SocialLinks } from '../types';

/* ============ Identity / hero ============ */

export const name = 'Simon Studen';

export const title = 'Full-Stack Software Engineer';

export const location = 'Seattle, WA';

/** Short punchy hero one-liner. */
export const tagline =
  'I build web and mobile apps people actually use — from trivia played by millions to tools that make technology more accessible.';

export const education =
  'B.S. Computer Science — Paul G. Allen School, University of Washington (2023)';

/* ============ Links ============ */

export const socials: SocialLinks = {
  github: 'https://github.com/sstuden2255',
  linkedin: 'https://www.linkedin.com/in/simon-studen',
  resume: '/resume.pdf', // TODO: this is just a placeholder resume right now
};

export const navLinks: NavLink[] = [
  { label: 'experience', href: '#experience' },
  { label: 'projects', href: '#projects' },
  { label: 'skills', href: '#skills' },
];

/* ============ Experience ============ */

export const jobs: Job[] = [
  {
    company: 'Sporcle',
    role: 'Web & Mobile App Developer',
    dates: 'Sep 2023 — Present',
    location: 'Seattle, WA',
    summary:
      'Collaborating closely with product managers and designers, I bring features to life on Sporcle trivia platforms that touch millions of users. I work across the full stack, owning projects end-to-end. This includes everything from our backend and data models to our web and mobile clients. Some of my notable projects include full redesigns of our Acrostic puzzle game and quiz category page UI, monetization and localization improvements to our Sporcle Party app, and revitalizing our flagship Sporcle app on Android. I also do maintenance work that keeps products this size healthy: refactoring legacy code, fixing bugs, and improving performance.',
  },
  {
    company: 'Able Opportunities',
    role: 'Mobile Software Engineer',
    dates: 'Oct 2025 — Present',
    location: 'Seattle, WA · Contract',
    summary:
      "As a contractor for Able Opportunities, I build and maintain mobile apps for individuals with intellectual and developmental disabilities. Accessibility is at the forefront of the work I do, designing apps around Web Content Accessibility Guidelines (WCAG) and other unique accessibility standards catered to our users. My most recent project has been building Shop Autonomy, a cross-platform budget planning tool for shopping trips. Here, I own the entire app development process; planning the app architecture and data layer, building out the UI and functionality, and maintaining a smooth deployment and release pipeline. To do this efficiently, I've put together an agentic development workflow, which I continue to evolve and refine. Before starting the cross-platform work, I also spent time refactoring and stabilizing a legacy iOS codebase for the existing Work Autonomy app.",
  },
  {
    company: 'Akkompany',
    role: 'Software Engineer Intern',
    dates: 'Jun 2022 — Sep 2022',
    summary:
      "As a summer intern at an AI startup, this was my first professional software experience and my introduction to agile development and the software development lifecycle. Working closely with the founders, I was tasked with building out an automated testing and continuous integration setup for their desktop application. I also wrote a Node.js package to profile the application's CPU and memory usage on long-running scripts.",
  },
  {
    company: 'Juni Learning',
    role: 'Computer Science Instructor',
    dates: 'Dec 2021 — Oct 2022',
    location: 'Remote',
    summary:
      'I taught computer science one-on-one, working with up to six high school students on a data structures and algorithms curriculum in various programming languages. Most of the job involved reviewing their code, giving feedback, and asking questions that guided them to the answer instead of just handing it over.',
  },
];

/* ============ Projects ============ */

export const projects: Project[] = [
  {
    title: 'Shop Autonomy',
    platform: 'iOS & Android',
    description: [
      'Shop Autonomy is a cross-platform budget tracker catered towards users with intellectual and developmental disabilities. As a solo developer, I’m building the app primarily through an agentic coding workflow. I treat Claude Code as a collaborator governed by a strict, self-authored rulebook. This rulebook encodes the tech stack as well as guardrails to keep the AI agents productive without letting them make unilateral product decisions. Rather than accepting first drafts, I work iteratively through design specs, written implementation plans, and dated development-journal entries for every session. This deliberate loop of experimenting, verifying against real user needs, documenting the reasoning, and correcting course keeps the codebase clean and consistent, and ensures I understand every decision and change.',
      'For Shop Autonomy, accessibility is an engineering requirement, not an afterthought. Since the app serves users who may have limited reading ability, low vision, or motor difficulties, I use a design-token system that enforces WCAG and other unique accessibility standards at the code level, such as screen-reader support on every interactive element or blocking text/background color combinations that fall below accessible contrast ratios. For a population that depends on predictable, legible, high-contrast interfaces, these choices are the difference between an app that empowers autonomy and one that’s unusable.',
    ],
    tags: ['React Native', 'TypeScript'],
    comingSoon: true,
  },
  {
    title: 'Sporcle App',
    platform: 'Android',
    description: [
      "I serve as the primary Android engineer on Sporcle's official Android app, a native Kotlin/Jetpack Compose shell wrapping the Sporcle web experience. I have driven multiple sustained modernizations of the codebase: migrating the UI from Material 2 to Material 3, converting the build system from Groovy to the Kotlin DSL with a centralized version catalog, and continually upgrading the Android Gradle Plugin, Kotlin, and target SDK (through API 36) alongside dozens of dependency updates. I led several significant platform migrations end-to-end, replacing the deprecated Accompanist WebView with a raw Android WebKit WebView integration, moving authentication from the legacy Google Sign-In SDK to the modern Credential Manager API, and upgrading Google Play Billing to the latest version, each backed by written design specs and implementation plans. Beyond feature work, I focus heavily on app stability and performance: resolving memory leaks, lifecycle bugs, and purchase-flow race conditions; hardening network and notification handling; implementing full edge-to-edge display support; and standing up a Macrobenchmark module to profile app performance.",
    ],
    tags: ['Kotlin', 'Jetpack Compose'],
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.sporcle.geneva',
  },
  {
    title: 'Sporcle Party',
    platform: 'iOS & Android',
    description: [
      'As part of a small engineering team, I helped build and evolve Sporcle Party, a real-time multiplayer trivia app, working across the full front-end stack while contributing heavily to product and design decisions during rapid sprint cycles. My most significant work came during a push to better monetize the app following a large surge of new users in the Middle East: I designed and shipped a system for purchasable avatar hats as a new revenue stream, spanning the asset pipeline and in-app store. I also led a full app localization effort to make the product feel native to our growing international audience. Beyond monetization, I redesigned core surfaces of the app, including the home screen and bottom-tab navigation, the profile and settings pages, and the in-game lobby and gameplay screens. Throughout, I owned release management and continuously resolved cross-platform UI and stability bugs to keep the experience polished across both iOS and Android.',
    ],
    tags: ['React Native', 'JavaScript', 'PHP', 'SQL'],
    appStoreUrl: 'https://apps.apple.com/us/app/sporcle-party-social-trivia/id1484143447',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.sporcle.party',
  },
];

/* ============ Skills ============ */

export const skillGroups: SkillGroup[] = [
  {
    category: 'Programming Languages',
    skills: [
      'JavaScript',
      'TypeScript',
      'Python',
      'Swift',
      'Kotlin',
      'Java',
      'PHP',
      'SQL',
      'HTML/CSS',
    ],
  },
  {
    category: 'AI Engineering',
    skills: [
      'Agentic Development',
      'AI Workflow Design',
      'Context Engineering'
    ],
  },
  {
    category: 'Backend & Systems',
    skills: ['REST API Design', 'Node.js', 'SQL Data Models', 'Caching'],
  },
  {
    category: 'Mobile & Frontend',
    skills: [
      'iOS',
      'Android',
      'React / React Native / Expo',
      'Design Systems',
      'Accessibility-First Design',
      'End-to-End Mobile Delivery',
      'Mobile/Web Architecture',
    ],
  },
  {
    category: 'Tools & Engineering Practices',
    skills: [
      'Git',
      'Bash',
      'CI/CD',
      'Test-Driven Development',
      'Automated Testing',
      'Performance Optimization',
      'Logging/Error Handling',
    ],
  },
];
