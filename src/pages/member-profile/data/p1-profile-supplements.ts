import type {
  MemberProfileViewModel,
  ProfileGoal,
  ProfileMetric,
  ProfileProject,
  ProfileRecommendation,
  ProfileSkill,
} from '../../../types/profile';

/** Dados complementares até os endpoints dedicados estarem disponíveis no backend. */
export const P1_PROFILE_SKILLS: ProfileSkill[] = [
  { id: '1', name: 'Gestão de projetos', category: 'GESTÃO' },
  { id: '2', name: 'Scrum', category: 'GESTÃO' },
  { id: '3', name: 'Liderança', category: 'SOFT SKILLS' },
  { id: '4', name: 'Comunicação', category: 'SOFT SKILLS' },
  { id: '5', name: 'Postgres SQL', category: 'TÉCNICA' },
  { id: '6', name: 'Java Script', category: 'TÉCNICA' },
  { id: '7', name: 'TypeScript', category: 'TÉCNICA' },
  { id: '8', name: 'Trabalho em equipe', category: 'SOFT SKILLS' },
];

export const P1_PROFILE_GOALS: ProfileGoal[] = [
  { id: '1', name: 'Líder de Projeto', type: 'achievement', progress: 100 },
  { id: '2', name: 'Embaixador CreaJR', type: 'achievement', progress: 100 },
  {
    id: '3',
    name: 'Especialista Técnico',
    description: 'Concluir 10 capacitações técnicas.',
    type: 'in_progress',
    progress: 70,
  },
  {
    id: '4',
    name: 'Impacto Social',
    description: 'Participar de 4 projetos pro-bono.',
    type: 'in_progress',
    progress: 25,
  },
];

export const P1_PROFILE_METRICS: ProfileMetric[] = [
  { id: '1', label: 'Projetos', value: 3, icon: 'projects' },
  { id: '2', label: 'Tarefas concluídas', value: 4, icon: 'tasks' },
  { id: '3', label: 'Eventos', value: 4, icon: 'events' },
  { id: '4', label: 'Reuniões', value: 12, icon: 'meetings' },
  { id: '5', label: 'Metas atingidas', value: 2, icon: 'goals' },
];

export const P1_PROFILE_PROJECTS: ProfileProject[] = [
  {
    id: '1',
    name: 'Sistema de reserva de salas e laboratórios - UTFPR',
    status: 'active',
    statusLabel: 'Ativo',
    periodLabel: '20 mar. 2025 - atual',
    roleLabel: 'Colaborador',
  },
  {
    id: '2',
    name: 'Plataforma divulgação de oportunidades acadêmicas',
    status: 'closed',
    statusLabel: 'Encerrado',
    periodLabel: '20 mar. 2024 - 16 fev. 2025',
    roleLabel: 'Colaborador',
  },
  {
    id: '3',
    name: 'Workshop engenharia 2023',
    status: 'closed',
    statusLabel: 'Encerrado',
    periodLabel: '3 ago. 2023 - 10 ago. 2023',
    roleLabel: 'Líder',
  },
];

export const P1_PROFILE_RECOMMENDATIONS: ProfileRecommendation[] = [
  {
    id: '1',
    authorName: 'Marcos Andrade',
    authorRole: 'Conselheiro',
    text: 'João Paulo é um líder excepcional. Sua capacidade de organizar e mobilizar equipes transformou nossos projetos mais complexos. Recomendo fortemente.',
    dateLabel: '11 de agosto de 2025',
  },
  {
    id: '2',
    authorName: 'Ana Paula Lima',
    authorRole: 'Diretora de Eventos',
    text: 'Profissional dedicado, com excelente comunicação e visão estratégica. Sempre entrega além do esperado nos projetos em que participa.',
    dateLabel: '3 de julho de 2025',
  },
  {
    id: '3',
    authorName: 'Ricardo Mendes',
    authorRole: 'Membro',
    text: 'Referência técnica para a equipe. Domina bem as tecnologias e compartilha conhecimento de forma clara e acessível.',
    dateLabel: '18 de junho de 2025',
  },
];

export const P1_DEFAULTS: Pick<
  MemberProfileViewModel,
  | 'skills'
  | 'hiddenSkillsCount'
  | 'goals'
  | 'metrics'
  | 'projects'
  | 'taskSummary'
  | 'meetingAttendanceRate'
  | 'events'
  | 'recommendations'
> = {
  skills: P1_PROFILE_SKILLS.slice(0, 6),
  hiddenSkillsCount: 2,
  goals: P1_PROFILE_GOALS,
  metrics: P1_PROFILE_METRICS,
  projects: P1_PROFILE_PROJECTS,
  taskSummary: { completed: 4, inProgress: 2 },
  meetingAttendanceRate: 87,
  events: [
    {
      id: '1',
      name: 'Conexão Empresa Júnior PR',
      typeLabel: 'Encontro Regional',
      dateLabel: '13/03/2026',
    },
    {
      id: '2',
      name: 'Feira de Informática UTFPR',
      typeLabel: 'Acadêmico',
      dateLabel: '21/08/2025',
    },
    {
      id: '3',
      name: 'FliSol',
      typeLabel: 'Evento internacional',
      dateLabel: '02/04/2025',
    },
  ],
  recommendations: P1_PROFILE_RECOMMENDATIONS,
};
