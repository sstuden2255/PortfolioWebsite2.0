/**
 * content.ts — single source of truth for all site copy.
 * Components import from here and render; nothing is hardcoded in JSX.
 *
 * TODO(Simon): replace the "#" placeholder URLs and the invented
 * project entries with real ones. Resume lives at public/resume.pdf.
 */

import type { Job, NavLink, Project, SkillGroup, SocialLinks } from '../types';

/* ============ Identity / hero ============ */

export const name = 'Simon Studen';

export const title = 'Full-Stack Software Engineer';

export const location = 'Seattle, WA';

/** Short punchy hero one-liner. */
export const tagline =
  'I build web and mobile apps people actually use — from trivia played by millions to iOS tools that make technology more accessible.';

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
    dates: '2023 — Present',
    location: 'Seattle, WA',
    bullets: [
      'Ship features across a trivia platform serving millions of monthly quiz plays, working the full stack: React on the web, React Native on mobile, and PHP/SQL services behind them.',
      'Build and maintain shared TypeScript components used by both the web app and the React Native apps, cutting duplicated UI work across platforms.',
      'Improve quiz gameplay performance and reliability by profiling render bottlenecks and tightening SQL queries on high-traffic endpoints.',
      'Collaborate with design and content teams to launch new game modes end-to-end — from data model and API to polished, responsive UI.',
    ],
  },
  {
    company: 'Able Opportunities',
    role: 'iOS Contract Developer',
    dates: '2023 — Present',
    location: 'Seattle, WA · Contract',
    bullets: [
      'Design and build native iOS apps in Swift that support people with disabilities in daily work and communication.',
      'Implement accessibility-first interfaces — VoiceOver support, Dynamic Type, high-contrast modes, and simplified navigation — validated with real users.',
      'Own the full delivery cycle: requirements with stakeholders, architecture, implementation, TestFlight betas, and App Store releases.',
      'Translate feedback from caregivers and job coaches into concrete UX improvements that make features usable without assistance.',
    ],
  },
];

/* ============ Projects ============
   Three realistic placeholders matching my stack (RN, full-stack web,
   native iOS). Swap in real projects + URLs when ready. */

export const projects: Project[] = [
  {
    title: 'Trailhead',
    description:
      'A React Native hiking companion for the Pacific Northwest. Browse trails offline, log hikes with GPS tracks and photos, and keep a personal stats dashboard — elevation climbed, miles, streaks.',
    stack: ['React Native', 'TypeScript', 'Expo', 'SQLite'],
    liveUrl: '#', // TODO: App Store / demo link
    githubUrl: '#', // TODO
  },
  {
    title: 'Setlist',
    description:
      'A full-stack web app for concert lovers: track shows you\'ve attended, build a live-music history, and get notified when artists you follow announce nearby dates. REST API with auth, caching, and a job queue for notifications.',
    stack: ['React', 'Node.js', 'Express', 'PostgreSQL'],
    liveUrl: '#', // TODO
    githubUrl: '#', // TODO
  },
  {
    title: 'Pocket Pantry',
    description:
      'A native iOS app that tracks what\'s in your kitchen and what\'s about to expire. Scan barcodes to add items, get smart reminders, and generate grocery lists — built with SwiftUI and fully VoiceOver accessible.',
    stack: ['Swift', 'SwiftUI', 'Core Data', 'AVFoundation'],
    githubUrl: '#', // TODO
  },
];

/* ============ Skills ============ */

export const skillGroups: SkillGroup[] = [
  {
    category: 'Languages',
    skills: ['TypeScript', 'JavaScript', 'Swift', 'Kotlin', 'PHP', 'SQL'],
  },
  {
    category: 'Frontend',
    skills: ['React', 'HTML', 'CSS', 'Vite', 'Responsive Design', 'Accessibility'],
  },
  {
    category: 'Mobile',
    skills: ['React Native', 'SwiftUI', 'UIKit', 'Expo', 'App Store / TestFlight'],
  },
  {
    category: 'Backend & Data',
    skills: ['Node.js', 'Express', 'PHP', 'MySQL', 'PostgreSQL', 'REST APIs'],
  },
];
