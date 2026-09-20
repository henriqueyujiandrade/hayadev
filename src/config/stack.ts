import type { UIDictionary } from '@i18n/types';

export interface StackGroup {
  /** Key into the `stack` section of the UI dictionary. */
  id: keyof UIDictionary['stack'];
  items: readonly string[];
}

/**
 * Technical stack, grouped by layer.
 *
 * Technology names are proper nouns and are not translated. The group headings
 * come from the UI dictionary. Only technologies that are part of real working
 * experience belong here.
 */
export const stack: readonly StackGroup[] = [
  {
    id: 'backend',
    items: [
      'Python',
      'Django',
      'Django REST Framework',
      'Node.js',
      'NestJS',
      'TypeScript',
      'REST APIs',
      'OpenAPI',
      'JWT',
    ],
  },
  {
    id: 'frontend',
    items: [
      'React',
      'React Native',
      'Expo',
      'TypeScript',
      'JavaScript',
      'TanStack Query',
      'Tailwind CSS',
      'Vite',
      'Astro',
      'HTML',
      'CSS',
    ],
  },
  {
    id: 'database',
    items: ['PostgreSQL', 'DynamoDB', 'TypeORM'],
  },
  {
    id: 'cloud',
    items: [
      'AWS',
      'Lambda',
      'API Gateway',
      'S3',
      'SES',
      'RDS',
      'EC2',
      'Serverless Framework',
      'Zappa',
    ],
  },
  {
    id: 'tools',
    items: ['Git', 'GitHub', 'Docker', 'Stripe', 'n8n', 'Azure DevOps', 'Jest', 'Playwright'],
  },
  {
    id: 'games',
    items: ['TypeScript', 'React', 'Canvas', 'Web Bluetooth', 'Styled Components'],
  },
];

/** Technologies surfaced in the hero, kept short on purpose. */
export const primaryTechnologies: readonly string[] = [
  'Python',
  'Django',
  'Node.js',
  'NestJS',
  'TypeScript',
  'PostgreSQL',
  'React',
  'AWS',
];
