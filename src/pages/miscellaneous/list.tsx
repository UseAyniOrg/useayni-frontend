import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable, PaginationControls } from '@/components/ui/data-table';
import { TypeBadge, StatusBadge, VisibilityBadge } from '@/components/miscellaneous/StatusBadge';
import { miscellaneousService } from '@/services/miscellaneousService';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import type { Miscellaneous, MiscFilters, MiscType, MiscStatus } from '@/services/miscellaneousService';
import { miscellaneousRoute } from '@/services/miscellaneousService';
import { Plus, Search } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'project', label: 'Projetos' },
  { value: 'event', label: 'Eventos' },
  { value: 'goal', label: 'Metas' },
  { value: 'meeting', label: 'Reuniões' },
  { value: 'activity', label: 'Atividades' },
  { value: 'form', label: 'Formulários' },
];

function ListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function MiscellaneousListPage() {
  const navigate = useNavigate();
  const { data: rolesAndPermissions, isLoading: rolesLoading } = useRolesAndPermissions();

  const [items, setItems] = useState<Miscellaneous[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const requestVersion = useRef(0);

  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError('');
    try {
      const filters: MiscFilters = {
        page,
        limit: pageSize,
        ...(search && { search }),
        ...(typeFilter && { type: typeFilter as MiscType }),
        ...(roleFilter && { myRole: roleFilter as MiscFilters['myRole'] }),
        ...(statusFilter && { status: statusFilter as MiscStatus }),
      };
      const res = await miscellaneousService.list(filters);
      if (version !== requestVersion.current) return;
      const lastPage = Math.max(1, Math.ceil(res.total / pageSize));
      if (page > lastPage) { setPage(lastPage); return; }
      setItems(res.data);
      setTotal(res.total);
    } catch {
      if (version === requestVersion.current) setError('Não foi possível carregar as miscelâneas. Verifique seu acesso e tente novamente.');
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [page, pageSize, search, typeFilter, roleFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={rolesLoading} />
      <SidebarInset>
        <AppHeader title="Miscelâneas" />
        <main className="flex-1 overflow-auto p-4 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            >
              {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            >
              <option value="">Todas</option>
              <option value="owner">Sou dono</option>
              <option value="participant">Participo</option>
              <option value="creator">Criei</option>
            </select>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="draft">Rascunho</option>
              <option value="pending_approval">Pendente</option>
              <option value="archived">Arquivado</option>
            </select>
            <Button onClick={() => navigate(miscellaneousRoute('/nova'))} className="ml-auto">
              <Plus className="h-4 w-4 mr-1" /> Nova
            </Button>
          </div>

          {error ? <div role="alert" className="space-y-3 rounded-lg border p-5 text-destructive">
            <p>{error}</p><Button variant="outline" onClick={() => void load()}>Tentar novamente</Button>
          </div> : loading ? (
            <ListSkeleton />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <span className="text-5xl">🗂️</span>
              <p className="text-muted-foreground">Nenhuma miscelânea encontrada.</p>
              <Button onClick={() => navigate(miscellaneousRoute('/nova'))}>
                <Plus className="h-4 w-4 mr-1" /> Criar primeira miscelânea
              </Button>
            </div>
          ) : (
            <>
              <DataTable rows={items} label="miscelâneas" paginate={false} columns={[
                { key: 'title', header: 'Título', cell: item => <div className="flex items-center gap-3">
                  {item.cover_url && <img src={item.cover_url} alt="" className="h-12 w-16 shrink-0 rounded object-cover" />}
                  <button type="button" className="text-left font-medium text-primary underline" onClick={() => navigate(miscellaneousRoute(`/${item.id}`))}>{item.title}</button>
                </div> },
                { key: 'type', header: 'Tipo', cell: item => <TypeBadge type={item.type} /> },
                { key: 'status', header: 'Status', cell: item => <StatusBadge status={item.status} /> },
                { key: 'visibility', header: 'Visibilidade', cell: item => <VisibilityBadge visibility={item.visibility ?? 'public'} /> },
                { key: 'date', header: 'Início', cell: item => new Date(item.start_date).toLocaleString('pt-BR') },
                { key: 'capacity', header: 'Vagas', cell: item => item.max_members || 'Sem limite' },
                { key: 'description', header: 'Descrição', cell: item => item.description || 'Não informado' },
              ]} />
              <PaginationControls page={page} pageSize={pageSize} total={total} label="miscelâneas" onPageChange={setPage}
                onPageSizeChange={size => { setPageSize(size); setPage(1); }} />
            </>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
