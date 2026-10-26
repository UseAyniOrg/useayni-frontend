import type { MiscStatus, MiscType, MiscVisibility } from '@/services/miscellaneousService';

const TYPE_LABELS: Record<MiscType, string> = {
  project: 'Projeto',
  event: 'Evento',
  goal: 'Meta',
  meeting: 'Reunião',
  activity: 'Atividade',
  form: 'Formulário',
};

const TYPE_COLORS: Record<MiscType, string> = {
  project: 'bg-blue-100 text-blue-800',
  event: 'bg-purple-100 text-purple-800',
  goal: 'bg-green-100 text-green-800',
  meeting: 'bg-yellow-100 text-yellow-800',
  activity: 'bg-orange-100 text-orange-800',
  form: 'bg-pink-100 text-pink-800',
};

const STATUS_LABELS: Record<MiscStatus, string> = {
  draft: 'Rascunho',
  pending_approval: 'Pendente',
  under_review: 'Em revisão',
  active: 'Ativo',
  rejected: 'Rejeitado',
  archived: 'Arquivado',
};

const STATUS_COLORS: Record<MiscStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-gray-200 text-gray-600',
};

export function TypeBadge({ type }: { type: MiscType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[type]}`}>
      {TYPE_LABELS[type]}
    </span>
  );
}

export function StatusBadge({ status }: { status: MiscStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function VisibilityBadge({ visibility }: { visibility?: MiscVisibility }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${visibility === 'public' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'}`}>
      {visibility === 'public' ? 'Público' : 'Privado'}
    </span>
  );
}
