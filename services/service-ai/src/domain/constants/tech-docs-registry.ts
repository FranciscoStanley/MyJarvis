/** Fonte oficial de documentação técnica — usada para buscas site:-scoped via DuckDuckGo. */
export interface TechDocSource {
  id: string;
  aliases: string[];
  site: string;
  baseUrl: string;
  label: string;
}

export const TECH_DOC_SOURCES: TechDocSource[] = [
  { id: 'nestjs', aliases: ['nest', 'nestjs', 'nest.js'], site: 'docs.nestjs.com', baseUrl: 'https://docs.nestjs.com', label: 'NestJS' },
  { id: 'nextjs', aliases: ['next', 'nextjs', 'next.js'], site: 'nextjs.org', baseUrl: 'https://nextjs.org/docs', label: 'Next.js' },
  { id: 'react', aliases: ['react', 'reactjs', 'react.js'], site: 'react.dev', baseUrl: 'https://react.dev', label: 'React' },
  { id: 'nodejs', aliases: ['node', 'nodejs', 'node.js'], site: 'nodejs.org', baseUrl: 'https://nodejs.org/docs', label: 'Node.js' },
  { id: 'typescript', aliases: ['typescript', 'ts'], site: 'typescriptlang.org', baseUrl: 'https://www.typescriptlang.org/docs', label: 'TypeScript' },
  { id: 'python', aliases: ['python', 'py'], site: 'docs.python.org', baseUrl: 'https://docs.python.org', label: 'Python' },
  { id: 'dotnet', aliases: ['dotnet', '.net', 'csharp', 'c#', 'asp.net', 'aspnet'], site: 'learn.microsoft.com', baseUrl: 'https://learn.microsoft.com/dotnet', label: '.NET / C#' },
  { id: 'java', aliases: ['java', 'spring', 'springboot', 'spring boot'], site: 'docs.spring.io', baseUrl: 'https://docs.spring.io', label: 'Java / Spring' },
  { id: 'golang', aliases: ['go', 'golang'], site: 'go.dev', baseUrl: 'https://go.dev/doc', label: 'Go' },
  { id: 'rust', aliases: ['rust'], site: 'doc.rust-lang.org', baseUrl: 'https://doc.rust-lang.org', label: 'Rust' },
  { id: 'docker', aliases: ['docker', 'container', 'containers'], site: 'docs.docker.com', baseUrl: 'https://docs.docker.com', label: 'Docker' },
  { id: 'kubernetes', aliases: ['kubernetes', 'k8s', 'kube'], site: 'kubernetes.io', baseUrl: 'https://kubernetes.io/docs', label: 'Kubernetes' },
  { id: 'postgresql', aliases: ['postgres', 'postgresql', 'pg'], site: 'postgresql.org', baseUrl: 'https://www.postgresql.org/docs', label: 'PostgreSQL' },
  { id: 'sqlserver', aliases: ['sql server', 'sqlserver', 'mssql', 't-sql', 'tsql'], site: 'learn.microsoft.com', baseUrl: 'https://learn.microsoft.com/sql', label: 'SQL Server' },
  { id: 'oracle', aliases: ['oracle', 'plsql', 'pl/sql'], site: 'docs.oracle.com', baseUrl: 'https://docs.oracle.com', label: 'Oracle' },
  { id: 'prisma', aliases: ['prisma'], site: 'prisma.io', baseUrl: 'https://www.prisma.io/docs', label: 'Prisma' },
  { id: 'typeorm', aliases: ['typeorm'], site: 'typeorm.io', baseUrl: 'https://typeorm.io', label: 'TypeORM' },
  { id: 'vitest', aliases: ['vitest'], site: 'vitest.dev', baseUrl: 'https://vitest.dev', label: 'Vitest' },
  { id: 'swagger', aliases: ['swagger', 'openapi'], site: 'swagger.io', baseUrl: 'https://swagger.io/docs', label: 'Swagger / OpenAPI' },
  { id: 'n8n', aliases: ['n8n'], site: 'docs.n8n.io', baseUrl: 'https://docs.n8n.io', label: 'n8n' },
  { id: 'fastapi', aliases: ['fastapi'], site: 'fastapi.tiangolo.com', baseUrl: 'https://fastapi.tiangolo.com', label: 'FastAPI' },
  { id: 'django', aliases: ['django'], site: 'docs.djangoproject.com', baseUrl: 'https://docs.djangoproject.com', label: 'Django' },
  { id: 'vue', aliases: ['vue', 'vuejs', 'vue.js'], site: 'vuejs.org', baseUrl: 'https://vuejs.org', label: 'Vue.js' },
  { id: 'angular', aliases: ['angular'], site: 'angular.dev', baseUrl: 'https://angular.dev', label: 'Angular' },
  { id: 'tailwind', aliases: ['tailwind', 'tailwindcss'], site: 'tailwindcss.com', baseUrl: 'https://tailwindcss.com/docs', label: 'Tailwind CSS' },
  { id: 'graphql', aliases: ['graphql', 'gql'], site: 'graphql.org', baseUrl: 'https://graphql.org/learn', label: 'GraphQL' },
  { id: 'redis', aliases: ['redis'], site: 'redis.io', baseUrl: 'https://redis.io/docs', label: 'Redis' },
  { id: 'mongodb', aliases: ['mongodb', 'mongo'], site: 'mongodb.com', baseUrl: 'https://www.mongodb.com/docs', label: 'MongoDB' },
  { id: 'owasp', aliases: ['owasp', 'segurança', 'seguranca', 'security', 'cybersecurity', 'cibersegurança', 'ciberseguranca'], site: 'owasp.org', baseUrl: 'https://owasp.org', label: 'OWASP / Segurança' },
  { id: 'aws', aliases: ['aws', 'amazon web services'], site: 'docs.aws.amazon.com', baseUrl: 'https://docs.aws.amazon.com', label: 'AWS' },
  { id: 'azure', aliases: ['azure', 'microsoft azure'], site: 'learn.microsoft.com', baseUrl: 'https://learn.microsoft.com/azure', label: 'Azure' },
  { id: 'linux', aliases: ['linux', 'ubuntu', 'debian'], site: 'ubuntu.com', baseUrl: 'https://ubuntu.com/server/docs', label: 'Linux / Ubuntu' },
];
