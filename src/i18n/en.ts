import type { UIDictionary } from './types';

export const en: UIDictionary = {
  nav: {
    projects: 'Projects',
    articles: 'Articles',
    lab: 'Lab',
    about: 'About',
    contact: 'Contact',
    primaryLabel: 'Primary navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menu: 'Menu',
    skipToContent: 'Skip to content',
    home: 'Home',
  },

  theme: {
    label: 'Theme',
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
  },

  language: {
    label: 'Language',
    switcherLabel: 'Change language',
    unavailable: 'Translation unavailable',
  },

  home: {
    metaTitle: 'Backend and Full Stack Developer',
    heroIntro:
      'I develop REST APIs and multi-tenant SaaS platforms with Python, Django, Django REST Framework, Node.js, NestJS, TypeScript, PostgreSQL and AWS, including Stripe payment integrations and web and mobile applications with React and React Native.',
    heroGames:
      'I also build 2D games and interactive experiences with biofeedback, using Bluetooth sensors.',
    ctaProjects: 'View projects',
    ctaArticles: 'Read articles',
    ctaAbout: 'About me',
    selectedProjectsTitle: 'Selected projects',
    selectedProjectsLead:
      'Systems, APIs and interactive experiences — with the technical decisions behind each one.',
    experienceTitle: 'Experience',
    experienceLead: 'Where I have worked and what I have built.',
    stackTitle: 'Technical stack',
    stackLead: 'The technologies I work with day to day, grouped by layer.',
    latestArticlesTitle: 'Latest articles',
    latestArticlesLead: 'Notes on architecture, backend work and software engineering.',
    labTitle: 'Lab',
    labLead: 'Prototypes, games and technical experiments.',
    contactTitle: 'Get in touch',
    contactLead:
      'Open to conversations about backend work, system architecture and full stack development.',
    allProjects: 'All projects',
    allArticles: 'All articles',
    allExperiments: 'Visit the Lab',
  },

  articles: {
    title: 'Articles',
    lead: 'Architecture decisions, real engineering problems and the reasoning behind the solutions.',
    metaDescription:
      'Technical articles on backend engineering, system architecture, APIs, performance and web development.',
    featured: 'Featured',
    all: 'All articles',
    empty: 'No articles published yet.',
    emptyLead:
      'The first pieces are in progress. In the meantime, the projects tell part of the story.',
    searchLabel: 'Search articles',
    searchPlaceholder: 'Search by title, topic or technology',
    filterAll: 'All',
    noResults: 'No articles match your search.',
    resultsCount: '{count} articles',
    resultsCountOne: '1 article',
    clearFilters: 'Clear filters',
    readArticle: 'Read article',
  },

  article: {
    publishedOn: 'Published on',
    updatedOn: 'Updated on',
    readingTime: '{minutes} min read',
    readingTimeLabel: 'Reading time',
    tableOfContents: 'On this page',
    backToList: 'Back to articles',
    previous: 'Previous',
    next: 'Next',
    relatedArticles: 'Related articles',
    relatedProjects: 'Related projects',
    draftNotice: 'Draft — visible in development only.',
    canonicalNotice: 'Originally published at',
    inCategory: 'Category',
    tags: 'Tags',
    shareLabel: 'Share this article',
  },

  projects: {
    title: 'Projects',
    lead: 'Systems, APIs, games and experiments — with the problem, the architecture and the technical decisions.',
    metaDescription:
      'Backend projects, APIs, SaaS platforms, web games and technical experiments built by Henrique.',
    featured: 'Featured',
    all: 'All projects',
    empty: 'No projects published yet.',
    emptyLead: 'The case studies are being written.',
    filterLabel: 'Filter by type',
    filterAll: 'All',
    noResults: 'No projects in this filter.',
    viewProject: 'View project',
  },

  project: {
    overview: 'Overview',
    role: 'Role',
    year: 'Year',
    status: 'Status',
    type: 'Type',
    technologies: 'Technologies',
    viewLive: 'View live',
    playGame: 'Play',
    viewSource: 'Source code',
    backToList: 'Back to projects',
    relatedArticles: 'Related articles',
    gallery: 'Screenshots',
    confidentialNotice:
      'This project is covered by confidentiality. The page describes only the technical nature of the work, with no internal details, data or proprietary code.',
    draftNotice: 'Draft — visible in development only.',
    summaryLabel: 'Project summary',
  },

  lab: {
    title: 'Lab',
    lead: 'Prototypes, web games and technical experiments. A place to test ideas outside the scope of a production project.',
    metaDescription:
      'Prototypes, web games and technical experiments in TypeScript, Canvas and React.',
    empty: 'No experiments published yet.',
    emptyLead: 'Work in progress shows up here once it is ready to look at.',
  },

  about: {
    title: 'About',
    lead: 'Backend and full stack developer focused on APIs, business rules and system architecture.',
    metaDescription:
      'Henrique is a backend and full stack developer based in São Paulo, working with Python, Django, Node.js, React, PostgreSQL and AWS.',
    experienceTitle: 'Experience',
    stackTitle: 'Technical stack',
    approachTitle: 'How I work',
    interestsTitle: 'Technical interests',
    contactTitle: 'Contact',
    contactLead: 'For conversations about work, architecture or collaboration.',
    present: 'present',
    remote: 'Remote',
    languagesTitle: 'Languages',
  },

  contact: {
    title: 'Contact',
    lead: 'A job offer, a question about a project or just a chat about backend — pick whichever channel suits you.',
    metaDescription:
      'Get in touch with Henrique by email, WhatsApp, LinkedIn or GitHub. Backend and full stack developer in São Paulo.',
    cta: 'Send a message',
    formTitle: 'Send an email',
    formLead:
      'Write a subject and a message. When you send it, your mail app opens with everything filled in — just review and send.',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'e.g. Project proposal',
    messageLabel: 'Message',
    messagePlaceholder: 'Tell me a little about what you need.',
    submit: 'Open in my email',
    fallback:
      'If nothing opened, your device may not have a mail app set up. Copy the address and write from your provider:',
    noScript: 'The form needs JavaScript. You can write directly to:',
    copyEmail: 'Copy email',
    copied: 'Email copied',
    channelsTitle: 'Channels',
    emailLabel: 'Email',
    emailHint: 'For proposals and longer conversations',
    whatsappLabel: 'WhatsApp',
    whatsappHint: 'For a quick chat',
    whatsappGreeting: 'Hi Henrique! I found you through your website.',
  },

  notFound: {
    title: 'Page not found',
    heading: 'This page does not exist',
    lead: 'The address may have changed, or it may never have existed. The paths below still work.',
    goHome: 'Go to the home page',
    goProjects: 'View projects',
    goArticles: 'Read articles',
  },

  footer: {
    navigationLabel: 'Footer navigation',
    socialLabel: 'Profiles',
    rss: 'RSS',
    copyright: '© {year} Henrique',
    builtWith: 'Built with Astro. Static, no backend.',
    backToTop: 'Back to top',
  },

  breadcrumbs: {
    label: 'Breadcrumb',
  },

  categories: {
    engineering: 'Engineering',
    backend: 'Backend',
    frontend: 'Frontend',
    architecture: 'Architecture',
    games: 'Games',
    performance: 'Performance',
  },

  projectTypes: {
    website: 'Website',
    system: 'System',
    saas: 'SaaS',
    api: 'API',
    game: 'Game',
    experiment: 'Experiment',
    library: 'Library',
    tool: 'Tool',
  },

  projectStatuses: {
    active: 'In development',
    completed: 'Completed',
    archived: 'Archived',
    experimental: 'Experimental',
  },

  stack: {
    backend: 'Backend',
    frontend: 'Frontend and mobile',
    database: 'Databases',
    cloud: 'Cloud',
    tools: 'Tooling',
    games: 'Games',
  },
};
