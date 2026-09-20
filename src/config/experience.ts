import type { Locale } from './locales';

export interface ExperienceEntry {
  id: string;
  organization: string;
  /** Optional employer website. The organization name is only linked when set. */
  url?: string;
  /** ISO `YYYY-MM`. */
  start: string;
  /** ISO `YYYY-MM`, or `null` while ongoing. */
  end: string | null;
  remote: boolean;
  role: Record<Locale, string>;
  summary: Record<Locale, string>;
  highlights: Record<Locale, readonly string[]>;
  technologies: readonly string[];
}

/**
 * Professional history.
 *
 * Descriptions stay at the level of technologies and responsibilities. Nothing
 * here discloses internal architecture, client data or business metrics.
 */
export const experience: readonly ExperienceEntry[] = [
  {
    id: 'self',
    organization: 'Self Intelligence for Life',
    start: '2023-04',
    end: null,
    remote: true,
    role: {
      'pt-BR': 'Desenvolvedor Backend',
      en: 'Backend Developer',
      es: 'Desarrollador Backend',
    },
    summary: {
      'pt-BR':
        'Desenvolvimento e manutenção de APIs e aplicações web em uma startup de tecnologia, com atuação principal no backend e participação no frontend.',
      en: 'Building and maintaining APIs and web applications at a technology startup, working mainly on the backend and contributing to the frontend.',
      es: 'Desarrollo y mantenimiento de APIs y aplicaciones web en una startup de tecnología, con foco principal en el backend y participación en el frontend.',
    },
    highlights: {
      'pt-BR': [
        'Desenvolvimento de APIs REST com Django REST Framework.',
        'Implementação de regras de negócio e integrações entre sistemas.',
        'Aplicações frontend em React e TypeScript.',
        'Infraestrutura na AWS: EC2, Lambda, RDS, S3 e DynamoDB.',
        'Integração de pagamentos com Stripe e processamento de webhooks.',
        'Automação de fluxos com n8n e containerização com Docker.',
      ],
      en: [
        'REST API development with Django REST Framework.',
        'Implementation of business rules and system-to-system integrations.',
        'Frontend applications in React and TypeScript.',
        'AWS infrastructure: EC2, Lambda, RDS, S3 and DynamoDB.',
        'Stripe payment integration and webhook processing.',
        'Workflow automation with n8n and containerization with Docker.',
      ],
      es: [
        'Desarrollo de APIs REST con Django REST Framework.',
        'Implementación de reglas de negocio e integraciones entre sistemas.',
        'Aplicaciones frontend en React y TypeScript.',
        'Infraestructura en AWS: EC2, Lambda, RDS, S3 y DynamoDB.',
        'Integración de pagos con Stripe y procesamiento de webhooks.',
        'Automatización de flujos con n8n y contenedores con Docker.',
      ],
    },
    technologies: [
      'Python',
      'Django',
      'Django REST Framework',
      'PostgreSQL',
      'DynamoDB',
      'AWS',
      'Docker',
      'Zappa',
      'Stripe',
      'React',
      'TypeScript',
      'n8n',
    ],
  },
  {
    id: 'kenzie',
    organization: 'Kenzie Academy Brasil',
    start: '2022-02',
    end: '2022-08',
    remote: true,
    role: {
      'pt-BR': 'Monitor',
      en: 'Teaching Assistant',
      es: 'Monitor',
    },
    summary: {
      'pt-BR':
        'Acompanhamento técnico de alunos em formação em desenvolvimento web, com apoio na resolução de problemas de código e revisão de exercícios.',
      en: 'Technical support for students training in web development, helping them work through coding problems and reviewing exercises.',
      es: 'Acompañamiento técnico de estudiantes en formación en desarrollo web, con apoyo en la resolución de problemas de código y revisión de ejercicios.',
    },
    highlights: {
      'pt-BR': [
        'Acompanhamento de turmas de 40 a 50 alunos.',
        'Suporte técnico em JavaScript, HTML e CSS.',
        'Revisão de código e orientação na resolução de exercícios.',
      ],
      en: [
        'Supported groups of 40 to 50 students.',
        'Technical support in JavaScript, HTML and CSS.',
        'Code review and guidance on exercise solutions.',
      ],
      es: [
        'Acompañamiento de grupos de 40 a 50 estudiantes.',
        'Soporte técnico en JavaScript, HTML y CSS.',
        'Revisión de código y orientación en la resolución de ejercicios.',
      ],
    },
    technologies: ['JavaScript', 'HTML', 'CSS'],
  },
];

/** Spoken languages, shown on the About page. */
export const languages: readonly {
  id: string;
  name: Record<Locale, string>;
  level: Record<Locale, string>;
}[] = [
  {
    id: 'pt',
    name: { 'pt-BR': 'Português', en: 'Portuguese', es: 'Portugués' },
    level: { 'pt-BR': 'Nativo', en: 'Native', es: 'Nativo' },
  },
  {
    id: 'en',
    name: { 'pt-BR': 'Inglês', en: 'English', es: 'Inglés' },
    level: { 'pt-BR': 'Avançado', en: 'Advanced', es: 'Avanzado' },
  },
];
