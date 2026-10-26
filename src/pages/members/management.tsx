import { useEffect, useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { useAuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';

const ALL_ROLES = ['MEMBRO', 'LIDER', 'DIRIGENTE', 'CA', 'EQUIPE_TECNICA', 'ESTADUAL', 'CAR', 'EXTERNO'];

const ROLE_LABELS: Record<string, string> = {
  MEMBRO: 'Membro',
  LIDER: 'Líder',
  DIRIGENTE: 'Dirigente',
  CA: 'CA',
  EQUIPE_TECNICA: 'Equipe Técnica',
  ESTADUAL: 'Estadual',
  CAR: 'CAR',
  EXTERNO: 'Externo',
};

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
}

interface Member {
  id: string;
  name: string;
  email_personal: string;
  profile_picture_url?: string;
  slug?: string;
  roles?: Array<{ id: string; name: string }>;
  registration_status?: string;
}

export default function MembersManagementPage() {
  const { data: rolesAndPermissions, isLoading: rolesLoading } = useRolesAndPermissions();
  const { user } = useAuthContext();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Member | null>(null);
  const [acting, setActing] = useState(false);

  const isTechTeam = user?.roles.includes('EQUIPE_TECNICA');

  const load = () => {
    setLoading(true);
    api.get('/members').then(res => setMembers(res.data ?? [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const memberRoles = selected?.roles?.map(r => r.name) ?? [];

  const toggleRole = async (roleName: string) => {
    if (!selected) return;
    setActing(true);
    try {
      const has = memberRoles.includes(roleName);
      if (has) {
        await api.delete(`/members/${selected.id}/roles/${roleName}`);
      } else {
        await api.post(`/members/${selected.id}/roles`, { roleName });
      }
      // Atualiza localmente
      const updated = await api.get(`/members/${selected.id}`);
      setSelected(updated.data);
      setMembers(prev => prev.map(m => m.id === selected.id ? updated.data : m));
    } finally {
      setActing(false);
    }
  };

  if (!isTechTeam) {
    return (
      <SidebarProvider>
        <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={rolesLoading} />
        <SidebarInset>
          <AppHeader title="Gestão de Membros" />
          <main className="p-8 text-sm text-muted-foreground">Acesso restrito à Equipe Técnica.</main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={rolesLoading} />
      <SidebarInset>
        <AppHeader title="Gestão de Membros" />
        <main className="flex-1 overflow-auto p-4 space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {!loading && <DataTable rows={members} label="gestão de papéis" search={member => `${member.name} ${member.email_personal ?? ''} ${member.roles?.map(role => ROLE_LABELS[role.name] ?? role.name).join(' ') ?? ''}`}
            columns={[
              { key: 'name', header: 'Nome', cell: member => <div className="flex items-center gap-2"><Avatar className="size-8 shrink-0"><AvatarImage src={member.profile_picture_url} alt="" /><AvatarFallback>{getInitials(member.name)}</AvatarFallback></Avatar>{member.name}</div> },
              { key: 'email', header: 'Email', cell: member => member.email_personal },
              { key: 'roles', header: 'Papéis', cell: member => member.roles?.map(role => ROLE_LABELS[role.name] ?? role.name).join(', ') },
              { key: 'actions', header: 'Ações', cell: member => <Button size="sm" variant="outline" onClick={() => setSelected(member)}>Gerenciar roles</Button> },
            ]} />}
        </main>
      </SidebarInset>

      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Roles de {selected?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {ALL_ROLES.map(role => {
              const has = memberRoles.includes(role);
              return (
                <div key={role} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${has ? 'border-primary/40 bg-primary/5' : ''}` }>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${has ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                    <span className="text-sm font-medium">{ROLE_LABELS[role]}</span>
                    {has && <span className="text-xs text-primary">atribuída</span>}
                  </div>
                  <Button
                    size="sm"
                    variant={has ? 'destructive' : 'outline'}
                    disabled={acting}
                    onClick={() => toggleRole(role)}
                  >
                    {has ? 'Remover' : 'Adicionar'}
                  </Button>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
