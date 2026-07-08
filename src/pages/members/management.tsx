import { useEffect, useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { useAuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Search } from 'lucide-react';

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
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Member | null>(null);
  const [acting, setActing] = useState(false);

  const isTechTeam = user?.roles.includes('EQUIPE_TECNICA');

  const load = () => {
    setLoading(true);
    api.get('/members').then(res => setMembers(res.data ?? [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email_personal?.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome ou email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading && <p className="text-sm text-muted-foreground">Carregando…</p>}

          {!loading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum membro encontrado.</p>
          )}

          <div className="space-y-2">
            {filtered.map(m => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={m.profile_picture_url} alt={m.name} />
                    <AvatarFallback className="text-xs">{getInitials(m.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email_personal}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex gap-1 flex-wrap justify-end max-w-xs">
                    {m.roles?.map(r => (
                      <span key={r.id} className="rounded-full bg-muted px-2 py-0.5 text-xs">{ROLE_LABELS[r.name] ?? r.name}</span>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelected(m)}>Gerenciar roles</Button>
                </div>
              </div>
            ))}
          </div>
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
