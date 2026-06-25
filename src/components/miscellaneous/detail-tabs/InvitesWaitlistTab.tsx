import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { miscellaneousService } from '@/services/miscellaneousService';

interface Invite {
  id: string;
  invited_user_id: string;
  status: string;
  expires_at: string;
  invitedUser: { name: string };
}

interface WaitlistEntry {
  id: string;
  position: number;
  member: { id: string; name: string };
  created_at: string;
}

interface Props { miscId: string; isOwner: boolean; waitlistEnabled: boolean; }

export function InvitesWaitlistTab({ miscId, isOwner, waitlistEnabled }: Props) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [inviteUserId, setInviteUserId] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      if (isOwner) {
        const [inv, wl] = await Promise.all([
          miscellaneousService.listInvites(miscId),
          waitlistEnabled ? miscellaneousService.getWaitlist(miscId) : Promise.resolve([]),
        ]);
        setInvites(inv);
        setWaitlist(wl);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [miscId, isOwner]);

  const sendInvite = async () => {
    if (!inviteUserId.trim()) return;
    await miscellaneousService.createInvite(miscId, { invited_user_id: inviteUserId.trim() });
    setInviteUserId('');
    load();
  };

  const cancelInvite = async (inviteId: string) => {
    await miscellaneousService.cancelInvite(miscId, inviteId);
    load();
  };

  const promote = async (userId: string) => {
    await miscellaneousService.promoteFromWaitlist(miscId, userId);
    load();
  };

  if (!isOwner) return <p className="text-sm text-muted-foreground">Apenas donos podem ver esta aba.</p>;
  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div className="space-y-6">
      {/* Send invite */}
      <section className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Convidar membro</h4>
        <div className="flex gap-2">
          <Input placeholder="UUID do usuário" value={inviteUserId} onChange={(e) => setInviteUserId(e.target.value)} className="flex-1" />
          <Button size="sm" onClick={sendInvite}>Convidar</Button>
        </div>
      </section>

      {/* Pending invites */}
      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Convites pendentes ({invites.length})</h4>
        {invites.length === 0 && <p className="text-sm text-muted-foreground">Nenhum convite pendente.</p>}
        {invites.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <p className="text-sm">{inv.invitedUser?.name ?? inv.invited_user_id}</p>
              <p className="text-xs text-muted-foreground">Expira: {new Date(inv.expires_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => cancelInvite(inv.id)}>Cancelar</Button>
          </div>
        ))}
      </section>

      {/* Waitlist */}
      {waitlistEnabled && (
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lista de espera ({waitlist.length})</h4>
          {waitlist.length === 0 && <p className="text-sm text-muted-foreground">Nenhum usuário em espera.</p>}
          {waitlist.map((w) => (
            <div key={w.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted w-6 h-6 flex items-center justify-center text-xs font-medium">{w.position}</span>
                <p className="text-sm">{w.member.name}</p>
              </div>
              <Button size="sm" className="h-7" onClick={() => promote(w.member.id)}>Promover</Button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
