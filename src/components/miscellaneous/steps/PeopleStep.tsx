import { Label } from '@/components/ui/label';
import { MemberSearchInput } from '@/components/ui/member-search-input';
import type { MemberSearchResult } from '@/services/memberService';
import type { MiscType, MiscParticipation } from '@/services/miscellaneousService';

interface Props {
  type: MiscType;
  participation: MiscParticipation;
  coOwners: MemberSearchResult[];
  initialMembers: MemberSearchResult[];
  onAddCoOwner: (m: MemberSearchResult) => void;
  onRemoveCoOwner: (id: string) => void;
  onAddMember: (m: MemberSearchResult) => void;
  onRemoveMember: (id: string) => void;
}

const MEMBER_LABEL: Record<MiscType, string> = {
  project:  'Membros do projeto',
  event:    'Participantes confirmados',
  goal:     'Membros responsáveis',
  meeting:  'Participantes da reunião',
  activity: 'Responsáveis pela atividade',
  form:     '', // not shown
};

const MEMBER_DESC: Partial<Record<MiscType, string>> = {
  project:  'Membros que já farão parte do projeto ao criar.',
  event:    'Pessoas que já estão confirmadas no evento.',
  goal:     'Membros que já estarão atrelados a esta meta.',
  meeting:  'Pessoas que já estão confirmadas na reunião.',
  activity: 'Responsáveis diretos por esta atividade.',
};

export function PeopleStep({
  type, participation,
  coOwners, initialMembers,
  onAddCoOwner, onRemoveCoOwner,
  onAddMember, onRemoveMember,
}: Props) {
  const showMembers = type !== 'form';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Co-responsáveis</Label>
        <p className="text-xs text-muted-foreground">
          Membros com permissão de gestão — podem aprovar solicitações, convidar e editar.
        </p>
        <MemberSearchInput
          selected={coOwners}
          onAdd={onAddCoOwner}
          onRemove={onRemoveCoOwner}
          placeholder="Buscar por nome ou e-mail…"
        />
      </div>

      {showMembers && (
        <div className="space-y-2">
          <Label>{MEMBER_LABEL[type]}</Label>
          <p className="text-xs text-muted-foreground">
            {MEMBER_DESC[type]}
            {participation === 'private' && ' São pré-aprovados mesmo com participação fechada.'}
          </p>
          <MemberSearchInput
            selected={initialMembers}
            onAdd={onAddMember}
            onRemove={onRemoveMember}
            placeholder="Buscar por nome ou e-mail…"
          />
        </div>
      )}
    </div>
  );
}
