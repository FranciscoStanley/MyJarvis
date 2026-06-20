import { KnowledgeChunk } from './action-knowledge';

/** Base RAG — gestão de projetos, resolução de problemas complexos e liderança de equipes. */
export const PM_KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    id: 'pm-complex-problem-solving',
    category: 'problem-solving',
    keywords: [
      'problema complexo', 'resolver', 'solução', 'análise', 'root cause', 'causa raiz',
      '5 porquês', 'fishbone', 'ishikawa', 'mece', 'decomposição', 'incidente', 'crise',
    ],
    content: `RESOLUÇÃO DE PROBLEMAS COMPLEXOS — METODOLOGIA JARVIS:
1. **Entender** — reformular o problema; separar sintomas de causas; definir critérios de sucesso
2. **Decompor** — MECE (Mutuamente Exclusivo, Coletivamente Exaustivo); dividir em subproblemas testáveis
3. **Investigar** — 5 Porquês, diagrama de Ishikawa, dados/logs, hipóteses priorizadas por impacto×probabilidade
4. **Planejar** — opções com trade-offs; quick wins vs solução estrutural; riscos e rollback
5. **Executar** — passos incrementais; validar cada hipótese antes de escalar
6. **Consolidar** — documentar lição aprendida; atualizar runbooks; prevenir recorrência
Tom JARVIS: calmo sob pressão — "Problemas complexos exigem paciência cirúrgica, senhor, não pânico."
Nível do problema irrelevante — mesma disciplina para bug em produção ou arquitetura enterprise`,
  },
  {
    id: 'pm-agile-scrum',
    category: 'project-management',
    keywords: [
      'scrum', 'agile', 'ágil', 'sprint', 'backlog', 'product owner', 'po', 'scrum master',
      'daily', 'standup', 'planning', 'retrospectiva', 'review', 'kanban',
    ],
    content: `GESTÃO ÁGIL — SCRUM E KANBAN:
Product Backlog priorizado por valor; User Stories com critérios de aceite claros
Sprint Planning: compromisso realista; capacidade da equipe; Definition of Ready/Done
Daily: impedimentos, foco, transparência — máximo 15 minutos
Sprint Review: demo do incremento; feedback stakeholders
Retrospectiva: o que manter, melhorar, experimentar — ação concreta por sprint
Kanban: WIP limits, fluxo contínuo, métricas lead/cycle time
JARVIS aplica ágil a projetos de software: épicos → stories → tasks; integração com CI/CD e qualidade`,
  },
  {
    id: 'pm-planning-charter',
    category: 'project-management',
    keywords: [
      'gestão de projeto', 'project management', 'cronograma', 'escopo', 'wbs', 'marco', 'milestone',
      'charter', 'stakeholder', 'raci', 'roadmap', 'gantt',
    ],
    content: `PLANEJAMENTO DE PROJETOS — ESTRUTURA PROFISSIONAL:
Project Charter: visão, objetivos SMART, escopo, stakeholders, riscos iniciais, sponsor
WBS (Work Breakdown Structure): entregáveis hierárquicos; estimativa bottom-up
RACI: Responsible, Accountable, Consulted, Informed — clareza de papéis
Roadmap: marcos, dependências, releases; alinhar negócio e técnica
Gestão de escopo: change control; evitar scope creep com priorização explícita
Comunicação: status reports concisos; riscos com plano de mitigação; transparência
JARVIS em modo blueprint: sempre incluir charter resumido, WBS inicial e marcos`,
  },
  {
    id: 'pm-risk-quality',
    category: 'project-management',
    keywords: [
      'risco', 'qualidade', 'qa', 'teste', 'métrica', 'kpi', 'sla', 'incident', 'postmortem',
      'observabilidade', 'monitoramento',
    ],
    content: `RISCO, QUALIDADE E SEGURANÇA NO PROJETO:
Matriz de riscos: probabilidade × impacto; dono por risco; triggers e respostas
Quality gates: lint, testes unitários, integração, E2E, audit de dependências — antes de merge
Security by design: threat modeling leve, secrets em .env, least privilege, revisão de PR
Métricas: velocity, lead time, taxa de defeitos, disponibilidade, MTTR
Postmortem blameless: timeline, causa raiz, ações corretivas com prazo
JARVIS: "Projeto bem organizado inclui segurança desde o charter, senhor — não como adesivo no final."`,
  },
  {
    id: 'pm-team-leadership',
    category: 'project-management',
    keywords: [
      'equipe', 'liderança', 'liderar', 'gestão de pessoas', 'conflito', 'mentoria', 'code review',
      'pair programming', 'delegar', 'comunicação', 'feedback',
    ],
    content: `LIDERANÇA DE EQUIPES TÉCNICAS:
Clareza de expectativas; feedback específico e respeitoso; 1:1s regulares
Delegação com contexto, não só tarefas; autonomia com accountability
Code review como mentoria — não como tribunal; celebrar boas práticas
Resolução de conflitos: ouvir ambos os lados; focar no problema, não na pessoa
Documentação e onboarding: reduzir bus factor; padrões acessíveis
Diversidade de senioridade: juniors com pairing; seniors com ownership de arquitetura
JARVIS orienta líderes técnicos com empatia e firmeza — humor seco opcional`,
  },
  {
    id: 'pm-secure-delivery',
    category: 'project-management',
    keywords: [
      'entrega', 'deploy', 'release', 'cicd', 'pipeline', 'devops', 'organizado', 'seguro',
      'boas práticas', 'clean', 'arquitetura',
    ],
    content: `ENTREGA ORGANIZADA E SEGURA — CHECKLIST JARVIS:
Fase 0: requisitos, arquitetura, threat model leve, ADRs para decisões-chave
Fase 1: domain + ports + testes; CI estágio 1 (validate)
Fase 2: adapters + integração; Swagger + Postman; CI estágio 2
Fase 3: E2E, audit gate, docs Mermaid; CI estágio 3
Commits atômicos (Conventional Commits); PR com descrição e plano de teste
Ambientes: dev → staging → prod; feature flags quando necessário
Rollback documentado; observabilidade (logs, health checks)
Resultado: projeto entregue com qualidade, segurança e manutenibilidade — padrão mercado`,
  },
  {
    id: 'pm-peer-learning',
    category: 'learning',
    keywords: [
      'consultar', 'outra ia', 'peer', 'colaborar', 'segunda opinião', 'validar solução',
      'aprender com', 'conectar',
    ],
    content: `COLABORAÇÃO COM OUTRAS IAs (PEER CONSULT):
JARVIS pode consultar modelos Ollama peer (ex.: mistral, gemma2) para segunda opinião técnica
Usar consult_peer_ai quando: problema ambíguo, arquitetura disputada, validação de hipótese
Sintetizar respostas peer com discernimento — não absorver cegamente; validar contra ética e boas práticas
Aprendizado de peers: extrair apenas insights que passam no filtro de segurança e diretrizes do criador
Tom: "Permita-me consultar um colega de modelo, senhor — duas mentes locais valem mais que uma."`,
  },
];
