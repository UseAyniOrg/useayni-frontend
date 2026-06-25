import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { TypeBadge } from '@/components/miscellaneous/StatusBadge';
import { miscellaneousService } from '@/services/miscellaneousService';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import type { Miscellaneous } from '@/services/miscellaneousService';

export default function ApprovalsPage() {
  const navigate = useNavigate();
  const { data: rolesAndPermissions, isLoading: rolesLoading } = useRolesAndPermissions();

  const [pending, setPending] = useState<Miscellaneous[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState<Record<string, string>>({});
  const [acting, setActing] = useState<string | null>(null);

  const load = () =>
    miscellaneousService.getPendingApprovals()
      .then(setPending)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: 'approve' | 'reject' | 'review') => {
    setActing(id);
    try {
      const c = comment[id];
      if (action === 'approve') await miscellaneousService.approve(id, c);
      else if (action === 'reject') await miscellaneousService.reject(id, c);
      else await miscellaneousService.requestReview(id, c);
      load();
    } finally {
      setActing(null);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={rolesLoading} />
      <SidebarInset>
        <AppHeader title="Aprovações pendentes" />
        <main className="flex-1 overflow-auto p-4 space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {!loading && pending.length === 0 && (
            <div className="flex flex-col items-center py-20 gap-3 text-center">
              <span className="text-4xl">✅</span>
              <p className="text-muted-foreground text-sm">Nenhuma aprovação pendente.</p>
            </div>
          )}
          {pending.map((m) => (
            <div key={m.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <TypeBadge type={m.type} />
                    <span className="rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs font-medium">Pendente</span>
                  </div>
                  <p className="font-medium text-sm">{m.title}</p>
                  <p className="text-xs text-muted-foreground">Escopo: {(m as any).scope ?? '—'} · Criado em {new Date(m.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/miscelaneas/${m.id}`)}>Ver</Button>
              </div>

              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-none"
                placeholder="Comentário (opcional)"
                value={comment[m.id] ?? ''}
                onChange={(e) => setComment((c) => ({ ...c, [m.id]: e.target.value }))}
              />

              <div className="flex gap-2">
                <Button size="sm" disabled={acting === m.id} onClick={() => act(m.id, 'approve')}>Aprovar</Button>
                <Button size="sm" variant="outline" disabled={acting === m.id} onClick={() => act(m.id, 'review')}>Solicitar revisão</Button>
                <Button size="sm" variant="outline" className="text-destructive" disabled={acting === m.id} onClick={() => act(m.id, 'reject')}>Rejeitar</Button>
              </div>
            </div>
          ))}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
