import { useEffect, useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, UserCheck, UserX, Users, RefreshCw, Copy } from 'lucide-react';
import axios from 'axios';
import { DataTable, type DataColumn } from '@/components/ui/data-table';

function errorMessage(cause: unknown): string {
  const message = axios.isAxiosError<{ message?: string }>(cause) ? cause.response?.data.message : undefined;
  return message ?? 'Não foi possível concluir a operação.';
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('');
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
};

interface Member {
  id: string;
  name: string;
  email_personal: string;
  profile_picture_url?: string;
  slug?: string;
  registration_status?: string;
  roles?: Array<{ id: string; name: string }>;
}

// ─── Invite Dialog ────────────────────────────────────────────────────────────

function InviteDialog({ open, onClose, onInvited }: { open: boolean; onClose: () => void; onInvited: () => void }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState('');

  const handleSend = async () => {
    if (!email.trim()) return;
    setSending(true);
    setResult(null);
    setTemporaryPassword('');
    try {
      const res = await api.post('/members/invite', { email: email.trim(), message: message || undefined });
      setResult(res.data?.message ?? 'Convite enviado!');
      setTemporaryPassword(res.data?.temporary_password ?? '');
      setEmail('');
      setMessage('');
      onInvited();
    } catch (cause: unknown) {
      setResult(`Erro: ${errorMessage(cause)}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar acesso de membro</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            O email não será enviado automaticamente. Entregue a senha temporária por um canal seguro.
            Contas existentes continuam usando a senha atual.
          </p>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="membro@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Mensagem (opcional)</label>
            <Input
              placeholder="Bem-vindo à nossa organização!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          {result && (
            <p className={`whitespace-pre-wrap text-sm rounded-lg px-3 py-2 ${result.startsWith('Erro') ? 'bg-destructive/10 text-destructive' : 'bg-green-50 text-green-700'}`}>
              {result}
            </p>
          )}
          {temporaryPassword && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Senha temporária · exibida somente agora</p>
                <code className="break-all font-mono text-sm">{temporaryPassword}</code>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => {
                void navigator.clipboard.writeText(temporaryPassword).catch(() => setResult('Erro: não foi possível copiar. Copie a senha manualmente.'));
              }}>
                <Copy className="mr-2 h-4 w-4" />Copiar
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={handleSend} disabled={sending || !email.trim()}>
            {sending ? 'Criando acesso…' : 'Criar acesso'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminMembersPage() {
  const { data: rolesAndPermissions, isLoading: rolesLoading } = useRolesAndPermissions();
  const { isTechTeam, user } = useAuthContext();
  const { tenant } = useTenant();

  const [members, setMembers] = useState<Member[]>([]);
  const [pending, setPending] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState<Member | null>(null);
  const [error, setError] = useState('');
  const canManage = isTechTeam || Boolean(user?.roles.includes('organization.admin'));

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [all, pend] = await Promise.all([
        api.get('/members').then((r) => r.data ?? []),
        tenant?.features.some((feature) => feature.slug === 'registration_approval')
          ? api.get('/members/pending').then((r) => r.data ?? [])
          : Promise.resolve([]),
      ]);
      setMembers(all);
      setPending(pend);
    } catch (cause: unknown) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [tenant?.id]);

  const memberColumns: DataColumn<Member>[] = [
    { key: 'name', header: 'Nome', cell: member => <div className="flex items-center gap-2">
      <Avatar className="size-8 shrink-0"><AvatarImage src={member.profile_picture_url} alt="" /><AvatarFallback>{getInitials(member.name)}</AvatarFallback></Avatar>{member.name}
    </div> },
    { key: 'email', header: 'Email', cell: member => member.email_personal },
    { key: 'status', header: 'Status', cell: member => member.registration_status && <Badge variant="outline" className={STATUS_COLOR[member.registration_status]}>{member.registration_status}</Badge> },
    { key: 'roles', header: 'Papéis', cell: member => member.roles?.map(role => role.name).join(', ') || 'Não informado' },
  ];

  const handleApprove = async (member: Member) => {
    setApproving(member.id);
    try {
      await api.patch(`/members/${member.id}/approve`);
      await load();
    } catch (cause: unknown) {
      setError(errorMessage(cause));
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejecting(rejectTarget.id);
    try {
      await api.patch(`/members/${rejectTarget.id}/reject`, { reason: rejectReason });
      setRejectTarget(null);
      setRejectReason('');
      await load();
    } catch (cause: unknown) {
      setError(errorMessage(cause));
    } finally {
      setRejecting(null);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={rolesLoading} />
      <SidebarInset>
        <AppHeader title="Gestão de Membros" />
        <main className="flex-1 overflow-auto p-4 space-y-4">
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {tenant && (
            <p className="text-xs text-muted-foreground">
              Organização: <span className="font-medium text-foreground">{tenant.name}</span>
            </p>
          )}

          <Tabs defaultValue="all">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <TabsList>
                <TabsTrigger value="all">
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  Todos
                  <Badge variant="secondary" className="ml-1.5 text-[10px]">{members.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Pendentes
                  {pending.length > 0 && (
                    <Badge className="ml-1.5 text-[10px] bg-yellow-500 text-white">{pending.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {canManage && (
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  <Mail className="h-3.5 w-3.5 mr-1.5" />Criar acesso por email
                </Button>
              )}
            </div>

            {/* ─── All members ────────────────────────────────────────────── */}
            <TabsContent value="all">
              <div className="space-y-3">
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : <DataTable rows={members} label="membros" resetKey={tenant?.id} columns={memberColumns}
                  search={member => `${member.name} ${member.email_personal ?? ''} ${member.registration_status ?? ''} ${member.roles?.map(role => role.name).join(' ') ?? ''}`} />}
              </div>
            </TabsContent>

            {/* ─── Pending approvals ──────────────────────────────────────── */}
            <TabsContent value="pending">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : pending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <UserCheck className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum cadastro pendente.</p>
                </div>
              ) : (
                <DataTable rows={pending} label="membros pendentes" resetKey={tenant?.id} search={member => `${member.name} ${member.email_personal ?? ''}`}
                  columns={[...memberColumns, { key: 'actions', header: 'Ações', cell: member => <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => setRejectTarget(member)}><UserX className="size-4" />Rejeitar</Button>
                    <Button size="sm" disabled={approving === member.id} onClick={() => handleApprove(member)}><UserCheck className="size-4" />{approving === member.id ? 'Aprovando…' : 'Aprovar'}</Button>
                  </div> }]} />
              )}
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>

      {/* Invite dialog */}
      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={load} />

      {/* Reject reason dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(v) => !v && setRejectTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rejeitar cadastro</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Rejeitar <strong>{rejectTarget?.name}</strong>? Esta ação remove o cadastro.
            </p>
            <Input
              placeholder="Motivo (opcional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={!!rejecting}
              onClick={handleReject}
            >
              {rejecting ? 'Rejeitando…' : 'Confirmar rejeição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
