import { useEffect, useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { useAuthContext } from '@/contexts/AuthContext';
import { memberService, type PendingMember } from '@/services/memberService';

function MemberCard({
  member,
  onApprove,
  onReject,
  onEdit,
  acting,
}: {
  member: PendingMember;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  acting: boolean;
}) {
  const activeCourse = member.memberCourses?.find(mc => mc.status === 'active') ?? member.memberCourses?.[0];
  const course = activeCourse?.courseUniversity?.course?.name;
  const university = activeCourse?.courseUniversity?.university?.name;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start gap-3">
        {member.profile_picture_url ? (
          <img src={member.profile_picture_url} alt={member.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="font-medium text-sm">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.email_personal}</p>
          <p className="text-xs text-muted-foreground">RA: {member.ra} · Tel: {member.phone}</p>
          {(course || university) && (
            <p className="text-xs text-muted-foreground">
              {course}{university ? ` — ${university}` : ''}
              {member.current_semester ? ` · ${member.current_semester}º sem.` : ''}
            </p>
          )}
          {member.city && <p className="text-xs text-muted-foreground">{member.city.name}</p>}
        </div>
        <span className="rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs font-medium shrink-0">
          Pendente
        </span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" disabled={acting} onClick={onApprove}>Aprovar</Button>
        <Button size="sm" variant="outline" disabled={acting} onClick={onEdit}>Editar e aprovar</Button>
        <Button size="sm" variant="outline" className="text-destructive" disabled={acting} onClick={onReject}>Rejeitar</Button>
      </div>
    </div>
  );
}

function EditApproveDialog({
  member,
  open,
  onClose,
  onConfirm,
  acting,
}: {
  member: PendingMember | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<PendingMember>) => void;
  acting: boolean;
}) {
  const [form, setForm] = useState<Partial<PendingMember>>({});

  useEffect(() => {
    if (member) setForm({ name: member.name, phone: member.phone, email_personal: member.email_personal });
  }, [member]);

  const set = (key: keyof PendingMember, value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar e aprovar cadastro</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input value={form.name ?? ''} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Telefone</Label>
            <Input value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>E-mail pessoal</Label>
            <Input value={form.email_personal ?? ''} onChange={e => set('email_personal', e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={acting}>Cancelar</Button>
          <Button onClick={() => onConfirm(form)} disabled={acting}>Aprovar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ApprovalsPage() {
  const { data: rolesAndPermissions, isLoading: rolesLoading } = useRolesAndPermissions();
  const { user } = useAuthContext();

  const [pending, setPending] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<PendingMember | null>(null);

  const isMemberOnly = user?.roles.length === 1 && user.roles[0] === 'MEMBRO';

  const load = () => {
    setLoading(true);
    memberService.getPendingMembers().then(setPending).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    setActing(id);
    try { await memberService.approve(id); load(); } finally { setActing(null); }
  };

  const handleReject = async (id: string) => {
    setActing(id);
    try { await memberService.reject(id); load(); } finally { setActing(null); }
  };

  const handleEditApprove = async (data: Partial<PendingMember>) => {
    if (!editTarget) return;
    setActing(editTarget.id);
    try { await memberService.editAndApprove(editTarget.id, data); setEditTarget(null); load(); } finally { setActing(null); }
  };

  if (isMemberOnly) return null;

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={rolesLoading} />
      <SidebarInset>
        <AppHeader title="Aprovações de cadastro" />
        <main className="flex-1 overflow-auto p-4 space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Carregando…</p>}

          {!loading && pending.length === 0 && (
            <div className="flex flex-col items-center py-20 gap-3 text-center">
              <span className="text-4xl">✅</span>
              <p className="text-muted-foreground text-sm">Nenhum cadastro pendente de aprovação.</p>
            </div>
          )}

          {pending.map(m => (
            <MemberCard
              key={m.id}
              member={m}
              acting={acting === m.id}
              onApprove={() => handleApprove(m.id)}
              onReject={() => handleReject(m.id)}
              onEdit={() => setEditTarget(m)}
            />
          ))}
        </main>
      </SidebarInset>

      <EditApproveDialog
        member={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onConfirm={handleEditApprove}
        acting={!!acting}
      />
    </SidebarProvider>
  );
}
