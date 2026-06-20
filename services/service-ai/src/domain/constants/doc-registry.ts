/** Registro de documentações oficiais — busca com site: via DuckDuckGo (gratuito). */
export interface DocRegistryEntry {
  id: string;
  name: string;
  aliases: string[];
  domain: string;
  baseUrl: string;
}

export const DOC_REGISTRY: DocRegistryEntry[] = [
  { id: 'nestjs', name: 'NestJS', aliases: ['nest', 'nestjs'], domain: 'docs.nestjs.com', baseUrl: 'https://docs.nestjs.com' },
  { id: 'nextjs', name: 'Next.js', aliases: ['next', 'nextjs', 'next.js'], domain: 'nextjs.org', baseUrl: 'https://nextjs.org/docs' },
  { id: 'nodejs', name: 'Node.js', aliases: ['node', 'nodejs', 'node.js'], domain: 'nodejs.org', baseUrl: 'https://nodejs.org/docs' },
  { id: 'typescript', name: 'TypeScript', aliases: ['typescript', 'ts'], domain: 'typescriptlang.org', baseUrl: 'https://www.typescriptlang.org/docs' },
  { id: 'python', name: 'Python', aliases: ['python', 'py'], domain: 'docs.python.org', baseUrl: 'https://docs.python.org' },
  { id: 'dotnet', name: '.NET', aliases: ['dotnet', '.net', 'c#', 'csharp', 'asp.net', 'aspnet'], domain: 'learn.microsoft.com', baseUrl: 'https://learn.microsoft.com/dotnet' },
  { id: 'react', name: 'React', aliases: ['react', 'reactjs'], domain: 'react.dev', baseUrl: 'https://react.dev' },
  { id: 'angular', name: 'Angular', aliases: ['angular'], domain: 'angular.dev', baseUrl: 'https://angular.dev' },
  { id: 'vue', name: 'Vue.js', aliases: ['vue', 'vuejs', 'vue.js'], domain: 'vuejs.org', baseUrl: 'https://vuejs.org' },
  { id: 'docker', name: 'Docker', aliases: ['docker'], domain: 'docs.docker.com', baseUrl: 'https://docs.docker.com' },
  { id: 'kubernetes', name: 'Kubernetes', aliases: ['kubernetes', 'k8s'], domain: 'kubernetes.io', baseUrl: 'https://kubernetes.io/docs' },
  { id: 'postgresql', name: 'PostgreSQL', aliases: ['postgres', 'postgresql', 'pg'], domain: 'postgresql.org', baseUrl: 'https://www.postgresql.org/docs' },
  { id: 'prisma', name: 'Prisma', aliases: ['prisma'], domain: 'prisma.io', baseUrl: 'https://www.prisma.io/docs' },
  { id: 'vitest', name: 'Vitest', aliases: ['vitest'], domain: 'vitest.dev', baseUrl: 'https://vitest.dev' },
  { id: 'swagger', name: 'Swagger / OpenAPI', aliases: ['swagger', 'openapi'], domain: 'swagger.io', baseUrl: 'https://swagger.io/docs' },
  { id: 'n8n', name: 'n8n', aliases: ['n8n'], domain: 'docs.n8n.io', baseUrl: 'https://docs.n8n.io' },
  { id: 'java', name: 'Java', aliases: ['java', 'jdk'], domain: 'docs.oracle.com', baseUrl: 'https://docs.oracle.com/en/java' },
  { id: 'go', name: 'Go', aliases: ['go', 'golang'], domain: 'go.dev', baseUrl: 'https://go.dev/doc' },
  { id: 'rust', name: 'Rust', aliases: ['rust'], domain: 'doc.rust-lang.org', baseUrl: 'https://doc.rust-lang.org' },
  { id: 'flutter', name: 'Flutter', aliases: ['flutter', 'dart'], domain: 'docs.flutter.dev', baseUrl: 'https://docs.flutter.dev' },
  { id: 'tailwind', name: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss'], domain: 'tailwindcss.com', baseUrl: 'https://tailwindcss.com/docs' },
  { id: 'owasp', name: 'OWASP Security', aliases: ['owasp', 'segurança web', 'web security'], domain: 'owasp.org', baseUrl: 'https://owasp.org' },
  { id: 'redis', name: 'Redis', aliases: ['redis'], domain: 'redis.io', baseUrl: 'https://redis.io/docs' },
  { id: 'rabbitmq', name: 'RabbitMQ', aliases: ['rabbitmq', 'rabbit'], domain: 'rabbitmq.com', baseUrl: 'https://www.rabbitmq.com/docs' },
  { id: 'graphql', name: 'GraphQL', aliases: ['graphql'], domain: 'graphql.org', baseUrl: 'https://graphql.org/learn' },
  { id: 'terraform', name: 'Terraform', aliases: ['terraform', 'tf'], domain: 'developer.hashicorp.com', baseUrl: 'https://developer.hashicorp.com/terraform/docs' },
  { id: 'aws', name: 'AWS', aliases: ['aws', 'amazon web services'], domain: 'docs.aws.amazon.com', baseUrl: 'https://docs.aws.amazon.com' },
  { id: 'azure', name: 'Azure', aliases: ['azure', 'microsoft azure'], domain: 'learn.microsoft.com', baseUrl: 'https://learn.microsoft.com/azure' },
  { id: 'gcp', name: 'Google Cloud', aliases: ['gcp', 'google cloud'], domain: 'cloud.google.com', baseUrl: 'https://cloud.google.com/docs' },
];
