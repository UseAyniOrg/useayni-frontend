import { api } from '@/lib/api';
import type { MemberPosition } from '@/contexts/AuthContext';

// --- Enums (espelham o backend) ---
// Declarados como objetos const por causa de `erasableSyntaxOnly` (sem `enum`).
export const MiscellaneousType = {
  PROJETO: 'projeto',
  EVENTO: 'evento',
  META: 'meta',
  REUNIAO: 'reuniao',
  ATIVIDADE: 'atividade',
  FORMULARIO: 'formulario',
} as const;
export type MiscellaneousType = (typeof MiscellaneousType)[keyof typeof MiscellaneousType];

export const MiscellaneousVisibility = {
  PUBLICO: 'publico',
  PRIVADO: 'privado',
} as const;
export type MiscellaneousVisibility =
  (typeof MiscellaneousVisibility)[keyof typeof MiscellaneousVisibility];

export const MiscellaneousScope = {
  MEU_NIVEL: 'meu_nivel',
  CAR: 'car',
  CAE: 'cae',
  GERAL: 'geral',
  SELECAO_INDIVIDUAL: 'selecao_individual',
} as const;
export type MiscellaneousScope =
  (typeof MiscellaneousScope)[keyof typeof MiscellaneousScope];

export const MiscellaneousStatus = {
  RASCUNHO: 'rascunho',
  ATIVA: 'ativa',
  PENDENTE_APROVACAO: 'pendente_aprovacao',
} as const;
export type MiscellaneousStatus =
  (typeof MiscellaneousStatus)[keyof typeof MiscellaneousStatus];

export const TYPE_LABELS: Record<MiscellaneousType, string> = {
  [MiscellaneousType.PROJETO]: 'Projeto',
  [MiscellaneousType.EVENTO]: 'Evento',
  [MiscellaneousType.META]: 'Meta',
  [MiscellaneousType.REUNIAO]: 'Reunião',
  [MiscellaneousType.ATIVIDADE]: 'Atividade',
  [MiscellaneousType.FORMULARIO]: 'Formulário / Votação',
};

export const TYPE_DESCRIPTIONS: Record<MiscellaneousType, string> = {
  [MiscellaneousType.PROJETO]: 'Iniciativa ampla que agrupa eventos, metas e atividades.',
  [MiscellaneousType.EVENTO]: 'Acontecimento com data, local e participantes.',
  [MiscellaneousType.META]: 'Objetivo mensurável (data de término opcional).',
  [MiscellaneousType.REUNIAO]: 'Encontro para alinhamento e decisões.',
  [MiscellaneousType.ATIVIDADE]: 'Tarefa ou ação pontual.',
  [MiscellaneousType.FORMULARIO]: 'Coleta de respostas ou votação.',
};

export const SCOPE_LABELS: Record<MiscellaneousScope, string> = {
  [MiscellaneousScope.MEU_NIVEL]: 'Meu nível',
  [MiscellaneousScope.CAR]: 'CAR',
  [MiscellaneousScope.CAE]: 'CAE',
  [MiscellaneousScope.GERAL]: 'Geral',
  [MiscellaneousScope.SELECAO_INDIVIDUAL]: 'Seleção individual',
};

export const STATUS_LABELS: Record<MiscellaneousStatus, string> = {
  [MiscellaneousStatus.RASCUNHO]: 'Rascunho',
  [MiscellaneousStatus.ATIVA]: 'Ativa',
  [MiscellaneousStatus.PENDENTE_APROVACAO]: 'Pendente de aprovação',
};

// --- Regras espelhadas para feedback em tempo real ---
export const NESTING_RULES: Record<MiscellaneousType, MiscellaneousType[]> = {
  [MiscellaneousType.PROJETO]: [
    MiscellaneousType.EVENTO,
    MiscellaneousType.META,
    MiscellaneousType.REUNIAO,
    MiscellaneousType.ATIVIDADE,
    MiscellaneousType.FORMULARIO,
  ],
  [MiscellaneousType.EVENTO]: [
    MiscellaneousType.REUNIAO,
    MiscellaneousType.ATIVIDADE,
    MiscellaneousType.FORMULARIO,
  ],
  [MiscellaneousType.META]: [MiscellaneousType.ATIVIDADE, MiscellaneousType.FORMULARIO],
  [MiscellaneousType.REUNIAO]: [MiscellaneousType.ATIVIDADE, MiscellaneousType.FORMULARIO],
  [MiscellaneousType.ATIVIDADE]: [MiscellaneousType.FORMULARIO],
  [MiscellaneousType.FORMULARIO]: [],
};

export function isNestingAllowed(
  parentType: MiscellaneousType,
  childType: MiscellaneousType,
): boolean {
  if (childType === MiscellaneousType.FORMULARIO) return true;
  return (NESTING_RULES[parentType] ?? []).includes(childType);
}

export const SCOPE_LEVEL: Record<MiscellaneousScope, number> = {
  [MiscellaneousScope.SELECAO_INDIVIDUAL]: 0,
  [MiscellaneousScope.MEU_NIVEL]: 1,
  [MiscellaneousScope.CAR]: 2,
  [MiscellaneousScope.CAE]: 3,
  [MiscellaneousScope.GERAL]: 4,
};

export function getCreatorLevel(positions: MemberPosition[] = [], roles: string[] = []): number {
  if (roles.includes('EQUIPE_TECNICA')) return 4;
  let level = 1;
  for (const p of positions) {
    if (p.type === 'CAE') level = Math.max(level, 3);
    else if (p.type === 'CAR') level = Math.max(level, 2);
  }
  return level;
}

/** Prevê o status resultante (espelha a lógica do backend) para feedback. */
export function predictStatus(
  scope: MiscellaneousScope,
  isDraft: boolean,
  creatorLevel: number,
): MiscellaneousStatus {
  if (isDraft) return MiscellaneousStatus.RASCUNHO;
  if (scope === MiscellaneousScope.SELECAO_INDIVIDUAL) return MiscellaneousStatus.ATIVA;
  if (SCOPE_LEVEL[scope] > creatorLevel) return MiscellaneousStatus.PENDENTE_APROVACAO;
  return MiscellaneousStatus.ATIVA;
}

// --- Tipos de payload/resposta ---
export interface CreateMiscellaneousPayload {
  type: MiscellaneousType;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  visibility: MiscellaneousVisibility;
  scope: MiscellaneousScope;
  ownerIds?: string[];
  memberIds?: string[];
  cep?: string;
  bairro?: string;
  rua?: string;
  numero?: string;
  cidade?: string;
  estado?: string;
  cover_photo_url?: string;
  banner_url?: string;
  parentId?: string;
  isDraft?: boolean;
}

export interface Miscellaneous {
  id: string;
  type: MiscellaneousType;
  title: string;
  description: string;
  start_date: string;
  end_date?: string | null;
  visibility: MiscellaneousVisibility;
  scope: MiscellaneousScope;
  status: MiscellaneousStatus;
  parent_id?: string | null;
  creator_id: string;
  created_at: string;
}

interface CreateResponse {
  message: string;
  status: MiscellaneousStatus;
  data: Miscellaneous;
}

export async function createMiscellaneous(payload: CreateMiscellaneousPayload) {
  const { data } = await api.post<CreateResponse>('/miscellaneous', payload);
  return data;
}

export async function listMiscellaneous() {
  const { data } = await api.get<Miscellaneous[] | { data: Miscellaneous[] }>('/miscellaneous');
  // Compatível com resposta paginada ({ data, total, ... }) ou lista crua.
  return Array.isArray(data) ? data : data.data;
}

/** Formata um valor de data (ISO ou datetime-local) para pt-BR: dd/mm/aaaa hh:mm. */
export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
