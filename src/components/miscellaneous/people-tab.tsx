import { useState } from 'react';
import { UserPlus, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InviteMemberModal } from '@/components/invites/InviteMemberModal';
import { PendingInvitesList } from '@/components/invites/PendingInvitesList';

interface PeopleTabProps {
  miscellaneousId: string;
  canManage?: boolean;
}

const PLACEHOLDER_OWNERS = [
  { id: 'owner-001', name: 'Você', role: 'Dono' as const },
];

const PLACEHOLDER_MEMBERS = [
  { id: 'member-001', name: 'Carlos Souza', role: 'Membro' as const },
  { id: 'member-002', name: 'Juliana Rocha', role: 'Membro' as const },
];

export function PeopleTab({ miscellaneousId, canManage = true }: PeopleTabProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pessoas</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie donos, membros e convites desta miscelânea.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setInviteModalOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Convidar membros
          </Button>
        )}
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-600" />
          <h4 className="font-medium">Donos</h4>
        </div>
        <ul className="divide-y rounded-md border">
          {PLACEHOLDER_OWNERS.map(owner => (
            <li key={owner.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium">{owner.name}</span>
              <Badge variant="warning">{owner.role}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium">Membros</h4>
        </div>
        <ul className="divide-y rounded-md border">
          {PLACEHOLDER_MEMBERS.map(member => (
            <li key={member.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm">{member.name}</span>
              <Badge variant="secondary">{member.role}</Badge>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Gestão completa de donos e membros será implementada na issue #14.
        </p>
      </section>

      <section className="space-y-3">
        <h4 className="font-medium">Convites</h4>
        <PendingInvitesList
          miscellaneousId={miscellaneousId}
          canManage={canManage}
          refreshKey={refreshKey}
        />
      </section>

      <InviteMemberModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        miscellaneousId={miscellaneousId}
        onInviteSent={() => setRefreshKey(k => k + 1)}
      />
    </div>
  );
}
