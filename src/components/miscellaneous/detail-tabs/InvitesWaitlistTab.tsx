import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { miscellaneousService } from '@/services/miscellaneousService';
import { memberService } from '@/services/memberService';
import { Search, UserPlus, Clock, ArrowUp, X } from 'lucide-react';
import { DataTable, PaginatedList } from '@/components/ui/data-table';

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('');
}

interface Invite {
  id: string;
  invited_user_id: string;
  status: string;
  expires_at: string;
  invitedUser?: { name: string; profile_picture_url?: string };
}

interface WaitlistEntry {
  id: string;
  position: number;
  member: { id: string; name: string; profile_picture_url?: string };
  created_at: string;
}

interface Props {
  miscId: string;
  isOwner: boolean;
  waitlistEnabled: boolean;
}

export function InvitesWaitlistTab({ miscId, isOwner, waitlistEnabled }: Props) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state for member to invite
  const [memberQuery, setMemberQuery] = useState('');
  const [memberResults, setMemberResults] = useState<Awaited<ReturnType<typeof memberService.search>>>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sending, setSending] = useState(false);

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

  // Debounced member search
  useEffect(() => {
    const t = setTimeout(async () => {
      if (memberQuery.length >= 2) {
        const results = await memberService.search(memberQuery);
        setMemberResults(results);
      } else {
        setMemberResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [memberQuery]);

  const handleSelectMember = (id: string, name: string) => {
    setSelectedMemberId(id);
    setSelectedMemberName(name);
    setMemberQuery(name);
    setMemberResults([]);
  };

  const sendInvite = async () => {
    if (!selectedMemberId) return;
    setSending(true);
    try {
      await miscellaneousService.createInvite(miscId, {
        invited_user_id: selectedMemberId,
        message: inviteMessage || undefined,
      });
      setSelectedMemberId('');
      setSelectedMemberName('');
      setMemberQuery('');
      setInviteMessage('');
      load();
    } finally {
      setSending(false);
    }
  };

  const cancelInvite = async (inviteId: string) => {
    await miscellaneousService.cancelInvite(miscId, inviteId);
    load();
  };

  const promote = async (userId: string) => {
    await miscellaneousService.promoteFromWaitlist(miscId, userId);
    load();
  };

  if (!isOwner) {
    return <p className="text-sm text-muted-foreground">Apenas donos podem ver esta aba.</p>;
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Send invite ──────────────────────────────────────────────────── */}
      <section className="rounded-lg border p-4 space-y-3">
        <h4 className="flex items-center gap-1.5 text-sm font-semibold">
          <UserPlus className="h-3.5 w-3.5" /> Convidar membro
        </h4>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar por nome ou email…"
            value={memberQuery}
            onChange={(e) => {
              setMemberQuery(e.target.value);
              if (e.target.value !== selectedMemberName) {
                setSelectedMemberId('');
                setSelectedMemberName('');
              }
            }}
          />
        </div>

        {/* Search results dropdown */}
        {memberResults.length > 0 && (
          <div className="rounded-lg border shadow-sm bg-popover overflow-hidden">
            <PaginatedList items={memberResults} label="membros encontrados" resetKey={memberQuery}>
            {visibleMembers => <>{visibleMembers.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectMember(m.id, m.name)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={m.avatar_url} />
                  <AvatarFallback className="text-[10px]">{getInitials(m.name)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{m.name}</span>
                <span className="text-xs text-muted-foreground ml-auto truncate">{m.email}</span>
              </button>
            ))}</>}
            </PaginatedList>
          </div>
        )}

        {selectedMemberId && (
          <Input
            placeholder="Mensagem opcional para o convidado…"
            value={inviteMessage}
            onChange={(e) => setInviteMessage(e.target.value)}
          />
        )}

        <Button
          size="sm"
          onClick={sendInvite}
          disabled={!selectedMemberId || sending}
          className="w-full sm:w-auto"
        >
          {sending ? 'Enviando…' : 'Enviar convite'}
        </Button>
      </section>

      {/* ─── Pending invites ──────────────────────────────────────────────── */}
      <section className="space-y-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Clock className="h-3 w-3" /> Convites pendentes
          <Badge variant="secondary" className="ml-1 text-[10px]">{invites.length}</Badge>
        </h4>

        {invites.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">Nenhum convite pendente.</p>
        )}

        <DataTable rows={invites} label="convites" search={invite => `${invite.invitedUser?.name ?? invite.invited_user_id} ${invite.status}`}
          columns={[
            { key: 'name', header: 'Pessoa convidada', cell: invite => invite.invitedUser?.name ?? invite.invited_user_id },
            { key: 'date', header: 'Vencimento', cell: invite => new Date(invite.expires_at).toLocaleDateString('pt-BR') },
            { key: 'status', header: 'Status', cell: invite => <Badge variant="outline">{invite.status}</Badge> },
            { key: 'actions', header: 'Ações', cell: invite => <Button variant="ghost" size="icon" title="Cancelar convite" aria-label={`Cancelar convite de ${invite.invitedUser?.name ?? invite.invited_user_id}`} onClick={() => cancelInvite(invite.id)}><X className="size-4" /></Button> },
          ]} />
      </section>

      {/* ─── Waitlist ─────────────────────────────────────────────────────── */}
      {waitlistEnabled && (
        <section className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock className="h-3 w-3" /> Lista de espera
            <Badge variant="secondary" className="ml-1 text-[10px]">{waitlist.length}</Badge>
          </h4>

          {waitlist.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">Nenhum usuário em espera.</p>
          )}

          <DataTable rows={waitlist} label="lista de espera" search={entry => entry.member.name}
            columns={[
              { key: 'position', header: 'Posição', cell: entry => entry.position },
              { key: 'name', header: 'Pessoa', cell: entry => entry.member.name },
              { key: 'date', header: 'Desde', cell: entry => new Date(entry.created_at).toLocaleDateString('pt-BR') },
              { key: 'actions', header: 'Ações', cell: entry => <Button size="sm" onClick={() => promote(entry.member.id)}><ArrowUp className="size-4" />Promover</Button> },
            ]} />
        </section>
      )}
    </div>
  );
}
