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
import { DataTable } from '@/components/ui/data-table';

function academicDetails(member: PendingMember) {
  const activeCourse = member.memberCourses?.find(mc => mc.status === 'active') ?? member.memberCourses?.[0];
  const course = activeCourse?.courseUniversity?.course?.name;
  const university = activeCourse?.courseUniversity?.university?.name;
  return [course, university, member.current_semester ? `${member.current_semester}º sem.` : ''].filter(Boolean).join(' · ');
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

          {!loading && <DataTable rows={pending} label="aprovações de cadastro"
            search={member => `${member.name} ${member.email_personal} ${member.ra ?? ''} ${member.phone ?? ''} ${member.city?.name ?? ''} ${academicDetails(member)}`}
            columns={[
              { key: 'name', header: 'Nome', cell: member => <div className="flex items-center gap-2">{member.profile_picture_url && <img src={member.profile_picture_url} alt="" className="size-8 shrink-0 rounded-full object-cover" />}{member.name}</div> },
              { key: 'email', header: 'Email', cell: member => member.email_personal },
              { key: 'phone', header: 'Telefone', cell: member => member.phone },
              { key: 'ra', header: 'RA', cell: member => member.ra },
              { key: 'academic', header: 'Curso / instituição / semestre', cell: academicDetails },
              { key: 'city', header: 'Cidade', cell: member => member.city?.name },
              { key: 'status', header: 'Status', cell: () => 'Pendente' },
              { key: 'actions', header: 'Ações', cell: member => <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={acting === member.id} onClick={() => handleApprove(member.id)}>Aprovar</Button>
                <Button size="sm" variant="outline" disabled={acting === member.id} onClick={() => setEditTarget(member)}>Editar e aprovar</Button>
                <Button size="sm" variant="outline" className="text-destructive" disabled={acting === member.id} onClick={() => handleReject(member.id)}>Rejeitar</Button>
              </div> },
            ]} />}
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
