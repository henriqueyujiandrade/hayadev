import type { ArticleCategory, ProjectStatus, ProjectType } from '@config/taxonomy';

/**
 * Shape every locale dictionary must satisfy.
 *
 * Declaring it explicitly (rather than inferring it from one locale) means a
 * missing or misspelled key fails `astro check` instead of silently rendering
 * `undefined` in production.
 */
export interface UIDictionary {
  nav: {
    projects: string;
    articles: string;
    lab: string;
    about: string;
    /** Accessible name of the primary navigation landmark. */
    primaryLabel: string;
    openMenu: string;
    closeMenu: string;
    menu: string;
    skipToContent: string;
    home: string;
  };

  theme: {
    label: string;
    toLight: string;
    toDark: string;
  };

  language: {
    label: string;
    /** Announced name of the language switcher. */
    switcherLabel: string;
    unavailable: string;
  };

  home: {
    metaTitle: string;
    heroIntro: string;
    /** A separate second line: the unusual part of the profile, kept out of the main sentence. */
    heroGames: string;
    ctaProjects: string;
    ctaArticles: string;
    ctaAbout: string;
    selectedProjectsTitle: string;
    selectedProjectsLead: string;
    experienceTitle: string;
    experienceLead: string;
    stackTitle: string;
    stackLead: string;
    latestArticlesTitle: string;
    latestArticlesLead: string;
    labTitle: string;
    labLead: string;
    contactTitle: string;
    contactLead: string;
    allProjects: string;
    allArticles: string;
    allExperiments: string;
  };

  articles: {
    title: string;
    lead: string;
    metaDescription: string;
    featured: string;
    all: string;
    empty: string;
    emptyLead: string;
    searchLabel: string;
    searchPlaceholder: string;
    filterAll: string;
    noResults: string;
    /** `{count}` is replaced with the number of matches. */
    resultsCount: string;
    resultsCountOne: string;
    clearFilters: string;
    readArticle: string;
  };

  article: {
    publishedOn: string;
    updatedOn: string;
    /** `{minutes}` is replaced with the estimated reading time. */
    readingTime: string;
    /** Plain label for the reading-time term; never shown with a placeholder. */
    readingTimeLabel: string;
    tableOfContents: string;
    backToList: string;
    previous: string;
    next: string;
    relatedArticles: string;
    relatedProjects: string;
    draftNotice: string;
    canonicalNotice: string;
    inCategory: string;
    tags: string;
    shareLabel: string;
  };

  projects: {
    title: string;
    lead: string;
    metaDescription: string;
    featured: string;
    all: string;
    empty: string;
    emptyLead: string;
    filterLabel: string;
    filterAll: string;
    noResults: string;
    viewProject: string;
  };

  project: {
    overview: string;
    role: string;
    year: string;
    status: string;
    type: string;
    technologies: string;
    viewLive: string;
    playGame: string;
    viewSource: string;
    backToList: string;
    relatedArticles: string;
    gallery: string;
    confidentialNotice: string;
    draftNotice: string;
    summaryLabel: string;
  };

  lab: {
    title: string;
    lead: string;
    metaDescription: string;
    empty: string;
    emptyLead: string;
  };

  about: {
    title: string;
    lead: string;
    metaDescription: string;
    experienceTitle: string;
    stackTitle: string;
    approachTitle: string;
    interestsTitle: string;
    contactTitle: string;
    contactLead: string;
    present: string;
    remote: string;
    languagesTitle: string;
  };

  notFound: {
    title: string;
    heading: string;
    lead: string;
    goHome: string;
    goProjects: string;
    goArticles: string;
  };

  footer: {
    navigationLabel: string;
    socialLabel: string;
    rss: string;
    /** `{year}` is replaced with the current year. */
    copyright: string;
    builtWith: string;
    backToTop: string;
  };

  breadcrumbs: {
    label: string;
  };

  categories: Record<ArticleCategory, string>;
  projectTypes: Record<ProjectType, string>;
  projectStatuses: Record<ProjectStatus, string>;

  stack: {
    backend: string;
    frontend: string;
    database: string;
    cloud: string;
    tools: string;
    games: string;
  };
}
