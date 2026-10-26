import { useEffect, useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { useAuthContext } from '@/contexts/AuthContext';
import { orgUnitService, type OrgUnit, type Position, type Mandate, type OrgUnitType } from '@/services/orgUnitService';
import { memberService } from '@/services/memberService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import HierarchyEditor, { type HierarchyEditTarget } from '@/components/admin/HierarchyEditor';
import { DataTable, type DataColumn } from '@/components/ui/data-table';
import axios from 'axios';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Users,
  Briefcase,
  GitBranch,
  CalendarCheck,
  Search,
  X,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('');
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-500/15 text-green-700 border-green-200',
  INACTIVE: 'bg-yellow-500/15 text-yellow-700 border-yellow-200',
  CLOSED: 'bg-slate-500/15 text-slate-700 border-slate-200',
  REVOKED: 'bg-red-500/15 text-red-700 border-red-200',
};

const mandateSearchText = (mandate: Mandate) => `${mandate.member?.name ?? ''} ${mandate.position?.name ?? ''} ${mandate.org_unit?.name ?? ''} ${mandate.status}`;

const mandateColumns: DataColumn<Mandate>[] = [
  { key: 'name', header: 'Membro', cell: mandate => <div className="flex items-center gap-2">
    <Avatar className="size-8 shrink-0"><AvatarImage src={mandate.member?.profile_picture_url} alt="" /><AvatarFallback>{getInitials(mandate.member?.name ?? '?')}</AvatarFallback></Avatar>
    {mandate.member?.name ?? mandate.member_id}
  </div> },
  { key: 'position', header: 'Cargo', cell: mandate => mandate.position?.name },
  { key: 'unit', header: 'Unidade', cell: mandate => mandate.org_unit?.name },
  { key: 'start', header: 'Início', cell: mandate => new Date(mandate.start_date).toLocaleDateString('pt-BR') },
  { key: 'end', header: 'Fim', cell: mandate => mandate.end_date ? new Date(mandate.end_date).toLocaleDateString('pt-BR') : 'Não definido' },
  { key: 'status', header: 'Status', cell: mandate => <Badge variant="outline" className={STATUS_COLOR[mandate.status]}>{mandate.status}</Badge> },
];

// ─── Tree Node ────────────────────────────────────────────────────────────────

function OrgUnitTreeNode({
  unit,
  depth,
  onSelect,
  selectedId,
}: {
  unit: OrgUnit;
  depth: number;
  onSelect: (u: OrgUnit) => void;
  selectedId?: string;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = (unit.children ?? []).length > 0;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(unit);
          if (hasChildren) setExpanded((p) => !p);
        }}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60 ${
          selectedId === unit.id ? 'bg-muted font-medium' : ''
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="h-3.5 w-3.5 shrink-0" />
        )}
        <GitBranch className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{unit.name}</span>
        <Badge variant="outline" className="ml-auto text-[10px] shrink-0">
          {unit.type?.name ?? unit.type_id}
        </Badge>
      </button>
      {expanded && hasChildren && (
        <div>
          {unit.children!.map((child) => (
            <OrgUnitTreeNode
              key={child.id}
              unit={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create Unit Dialog ───────────────────────────────────────────────────────

function CreateUnitDialog({
  open,
  onClose,
  types,
  units,
  onCreated,
  parentUnit,
}: {
  open: boolean;
  onClose: () => void;
  types: OrgUnitType[];
  units: OrgUnit[];
  onCreated: () => void;
  parentUnit?: OrgUnit | null;
}) {
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState('');
  const [parentId, setParentId] = useState(parentUnit?.id ?? '__root__');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setTypeId('');
      setParentId(parentUnit?.id ?? '__root__');
      setError('');
    }
  }, [open, parentUnit]);

  const handleSave = async () => {
    if (!name.trim() || !typeId) return;
    setSaving(true);
    setError('');
    try {
      await orgUnitService.create({
        name: name.trim(),
        type_id: typeId,
        parent_id: parentId === '__root__' ? undefined : parentId,
      });
      onCreated();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar a unidade.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova unidade organizacional</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome</label>
            <Input
              placeholder="Ex: CAE Nordeste"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Tipo</label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Unidade pai (opcional)</label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Raiz da organização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__root__">Raiz da organização</SelectItem>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim() || !typeId}>
            {saving ? 'Criando…' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateUnitTypeDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    setError('');
    try {
      await orgUnitService.createType({ slug: slug.trim(), name: name.trim() });
      onCreated();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar o tipo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Novo tipo de unidade</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <label className="grid gap-1 text-sm">Nome
            <Input value={name} onChange={(event) => {
              const next = event.target.value;
              setName(next);
              setSlug(next.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
            }} placeholder="Ex.: Núcleo regional" />
          </label>
          <label className="grid gap-1 text-sm">Identificador
            <Input value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase())} pattern="[a-z0-9-]+" />
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => void save()} disabled={saving || !name.trim() || !slug.trim()}>{saving ? 'Salvando...' : 'Criar tipo'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreatePositionDialog({
  open,
  onClose,
  types,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  types: OrgUnitType[];
  onCreated: () => void;
}) {
  const [typeId, setTypeId] = useState('');
  const [name, setName] = useState('');
  const [investitureType, setInvestitureType] = useState<'ELECTION' | 'APPOINTMENT' | 'AUTOMATIC'>('ELECTION');
  const [duration, setDuration] = useState('');
  const [allowsDeputy, setAllowsDeputy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setTypeId(types[0]?.id ?? '');
    setName('');
    setInvestitureType('ELECTION');
    setDuration('');
    setAllowsDeputy(false);
    setError('');
  }, [open, types]);

  const save = async () => {
    if (!typeId || !name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await orgUnitService.createPosition({
        org_unit_type_id: typeId,
        name: name.trim(),
        investiture_type: investitureType,
        mandate_duration_days: duration ? Number(duration) : undefined,
        allows_deputy: allowsDeputy,
      });
      onCreated();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar o cargo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Novo cargo</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <label className="grid gap-1 text-sm">Nome<Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Coordenação geral" /></label>
          <div className="space-y-1">
            <label className="text-sm">Tipo de unidade</label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>{types.map((type) => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm">Forma de investidura</label>
            <Select value={investitureType} onValueChange={(value) => setInvestitureType(value as typeof investitureType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ELECTION">Eleição</SelectItem>
                <SelectItem value="APPOINTMENT">Indicação</SelectItem>
                <SelectItem value="AUTOMATIC">Automática</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="grid gap-1 text-sm">Duração do mandato (dias)<Input type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="Sem duração definida" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allowsDeputy} onChange={(event) => setAllowsDeputy(event.target.checked)} />Permite suplente</label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => void save()} disabled={saving || !typeId || !name.trim()}>{saving ? 'Salvando...' : 'Criar cargo'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Mandate Dialog ────────────────────────────────────────────────────

function CreateMandateDialog({
  open,
  onClose,
  positions,
  units,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  positions: Position[];
  units: OrgUnit[];
  onCreated: () => void;
}) {
  const [positionId, setPositionId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [memberQuery, setMemberQuery] = useState('');
  const [memberResults, setMemberResults] = useState<Awaited<ReturnType<typeof memberService.search>>>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) { setPositionId(''); setUnitId(''); setMemberId(''); setMemberQuery(''); setStartDate(''); setEndDate(''); setError(''); }
  }, [open]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (memberQuery.length >= 2) {
        try {
          setMemberResults(await memberService.search(memberQuery));
        } catch {
          setError('Não foi possível buscar os membros.');
        }
      } else {
        setMemberResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [memberQuery]);

  const handleSave = async () => {
    if (!positionId || !unitId || !memberId || !startDate) return;
    setSaving(true);
    setError('');
    try {
      await orgUnitService.createMandate({ position_id: positionId, org_unit_id: unitId, member_id: memberId, start_date: startDate, end_date: endDate || undefined });
      onCreated();
      onClose();
    } catch (cause: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(cause) ? cause.response?.data.message : undefined;
      setError(message ?? 'Não foi possível atribuir o mandato.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir mandato</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Cargo</label>
            <Select value={positionId} onValueChange={(id) => { setPositionId(id); setUnitId(''); }}>
              <SelectTrigger><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
              <SelectContent>
                {positions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Unidade</label>
            <Select value={unitId} onValueChange={setUnitId}>
              <SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
              <SelectContent>
                {units.filter((unit) => unit.type_id === positions.find((position) => position.id === positionId)?.org_unit_type_id).map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Membro</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input className="pl-8" placeholder="Buscar por nome ou email…" value={memberQuery} onChange={(e) => { setMemberQuery(e.target.value); setMemberId(''); }} />
            </div>
            {memberResults.length > 0 && (
              <div className="rounded-lg border shadow-sm bg-popover">
                {memberResults.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMemberId(m.id); setMemberQuery(m.name); setMemberResults([]); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 ${memberId === m.id ? 'bg-muted' : ''}`}
                  >
                    <Avatar className="h-6 w-6"><AvatarImage src={m.avatar_url} /><AvatarFallback className="text-[10px]">{getInitials(m.name)}</AvatarFallback></Avatar>
                    <span>{m.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{m.email}</span>
                  </button>
                ))}
              </div>
            )}
            {memberId && memberResults.length === 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" /> Membro selecionado
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Data de início</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Data de fim (opcional)</label>
            <Input type="date" min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !positionId || !unitId || !memberId || !startDate}>
            {saving ? 'Atribuindo…' : 'Atribuir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HierarchyPage() {
  const { data: rolesAndPermissions, isLoading: rolesLoading } = useRolesAndPermissions();
  const { isTechTeam, user } = useAuthContext();
  const canManageHierarchy = isTechTeam || Boolean(user?.support_session_id) ||
    Boolean(user?.roles.some((role) => ['organization.admin', 'organization.manage'].includes(role)));

  const [tree, setTree] = useState<OrgUnit[]>([]);
  const [flatUnits, setFlatUnits] = useState<OrgUnit[]>([]);
  const [types, setTypes] = useState<OrgUnitType[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUnit, setSelectedUnit] = useState<OrgUnit | null>(null);
  const [createUnitOpen, setCreateUnitOpen] = useState(false);
  const [createTypeOpen, setCreateTypeOpen] = useState(false);
  const [createPositionOpen, setCreatePositionOpen] = useState(false);
  const [createMandateOpen, setCreateMandateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<HierarchyEditTarget | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [t, flat, ty, pos, man] = await Promise.all([
        orgUnitService.getTree(),
        orgUnitService.listAll(),
        orgUnitService.listTypes(),
        orgUnitService.listPositions(),
        orgUnitService.listMandates(),
      ]);
      setTree(t);
      setFlatUnits(flat);
      setTypes(ty);
      setPositions(pos);
      setMandates(man);
      setSelectedUnit((current) => current ? flat.find((unit) => unit.id === current.id) ?? null : null);
    } catch (cause: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(cause) ? cause.response?.data.message : undefined;
      setError(message ?? 'Não foi possível carregar a hierarquia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={rolesLoading} />
      <SidebarInset>
        <AppHeader title="Hierarquia Organizacional" />
        <main className="flex-1 overflow-auto p-4">
          {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
          <Tabs defaultValue="tree">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <TabsList className="h-auto max-w-full flex-wrap">
                <TabsTrigger value="tree"><GitBranch className="h-3.5 w-3.5 mr-1.5" />Árvore</TabsTrigger>
                <TabsTrigger value="units">Unidades</TabsTrigger>
                <TabsTrigger value="positions"><Briefcase className="h-3.5 w-3.5 mr-1.5" />Cargos</TabsTrigger>
                <TabsTrigger value="mandates"><CalendarCheck className="h-3.5 w-3.5 mr-1.5" />Mandatos</TabsTrigger>
              </TabsList>
              {canManageHierarchy && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={!selectedUnit} onClick={() => {
                    if (selectedUnit) setEditTarget({ kind: 'unit', value: selectedUnit });
                  }}>
                    Editar unidade
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setCreateTypeOpen(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Novo tipo
                  </Button>
                  <Button size="sm" onClick={() => setCreateUnitOpen(true)} disabled={!types.length}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Nova unidade
                  </Button>
                </div>
              )}
            </div>

            {/* ─── Tree Tab ─────────────────────────────────────────────────── */}
            <TabsContent value="tree">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-9 rounded-lg bg-muted animate-pulse" style={{ width: `${70 + i * 3}%` }} />
                  ))}
                </div>
              ) : tree.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <GitBranch className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhuma unidade cadastrada.</p>
                  {canManageHierarchy && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setCreateTypeOpen(true)}>
                        <Plus className="h-3.5 w-3.5 mr-1.5" />Criar tipo
                      </Button>
                      <Button size="sm" onClick={() => setCreateUnitOpen(true)} disabled={!types.length}>
                        <Plus className="h-3.5 w-3.5 mr-1.5" />Criar unidade
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Tree panel */}
                  <div className="lg:col-span-1 rounded-lg border bg-card p-2">
                    {tree.map((unit) => (
                      <OrgUnitTreeNode
                        key={unit.id}
                        unit={unit}
                        depth={0}
                        onSelect={setSelectedUnit}
                        selectedId={selectedUnit?.id}
                      />
                    ))}
                  </div>

                  {/* Detail panel */}
                  <div className="lg:col-span-2 rounded-lg border bg-card p-4">
                    {selectedUnit ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-base">{selectedUnit.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Tipo: {selectedUnit.type?.name ?? '—'} · Status: {selectedUnit.status}
                            </p>
                          </div>
                          {canManageHierarchy && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setCreateUnitOpen(true)}>
                                <Plus className="h-3.5 w-3.5 mr-1" />Sub-unidade
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setCreateMandateOpen(true)}>
                                <Users className="h-3.5 w-3.5 mr-1" />Atribuir cargo
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Mandates for selected unit */}
                        <MandateListForUnit unitId={selectedUnit.id} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                        <GitBranch className="h-8 w-8 opacity-30 mb-2" />
                        <p className="text-sm">Selecione uma unidade para ver detalhes</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="units">
              <DataTable rows={flatUnits} label="unidades organizacionais" search={unit => `${unit.name} ${unit.type?.name ?? ''} ${unit.status}`}
                columns={[
                  { key: 'name', header: 'Unidade', cell: unit => unit.name },
                  { key: 'type', header: 'Tipo', cell: unit => unit.type?.name },
                  { key: 'status', header: 'Status', cell: unit => unit.status },
                  { key: 'actions', header: 'Ações', cell: unit => canManageHierarchy && <Button size="sm" variant="outline" onClick={() => setEditTarget({ kind: 'unit', value: unit })}>Editar unidade</Button> },
                ]} />
            </TabsContent>

            {/* ─── Positions Tab ────────────────────────────────────────────── */}
            <TabsContent value="positions">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium">Cargos da organização</h2>
                {canManageHierarchy && (
                  <Button size="sm" onClick={() => setCreatePositionOpen(true)} disabled={!types.length}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />Novo cargo
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {positions.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground py-8 text-center">Nenhum cargo cadastrado.</p>
                )}
                <DataTable rows={positions} label="cargos" search={position => `${position.name} ${position.org_unit_type?.name ?? ''} ${position.roles?.map(role => role.name).join(' ') ?? ''}`}
                  columns={[
                    { key: 'name', header: 'Cargo', cell: position => position.name },
                    { key: 'type', header: 'Tipo de unidade', cell: position => position.org_unit_type?.name },
                    { key: 'investiture', header: 'Investidura', cell: position => position.investiture_type },
                    { key: 'duration', header: 'Duração', cell: position => position.mandate_duration_days ? `${position.mandate_duration_days} dias` : 'Não definida' },
                    { key: 'deputy', header: 'Suplente', cell: position => position.allows_deputy ? 'Permitido' : 'Não permitido' },
                    { key: 'roles', header: 'Papéis', cell: position => position.roles?.map(role => role.name).join(', ') },
                    { key: 'actions', header: 'Ações', cell: position => canManageHierarchy && <Button size="sm" variant="outline" onClick={() => setEditTarget({ kind: 'position', value: position })}>Editar cargo</Button> },
                  ]} />
              </div>
            </TabsContent>

            {/* ─── Mandates Tab ─────────────────────────────────────────────── */}
            <TabsContent value="mandates">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">Mandatos</h2>
                  {canManageHierarchy && (
                    <Button size="sm" onClick={() => setCreateMandateOpen(true)}>
                      <Plus className="h-3.5 w-3.5 mr-1.5" />Atribuir cargo
                    </Button>
                  )}
                </div>

                <DataTable rows={mandates} label="mandatos" search={mandateSearchText}
                  columns={[...mandateColumns, { key: 'actions', header: 'Ações', cell: mandate => <MandateActions mandate={mandate} onClosed={load} /> }]} />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>

      <CreateUnitDialog
        open={createUnitOpen}
        onClose={() => setCreateUnitOpen(false)}
        types={types}
        units={flatUnits}
        onCreated={load}
        parentUnit={selectedUnit}
      />
      {editTarget && <HierarchyEditor key={`${editTarget.kind}:${editTarget.value.id}`} target={editTarget}
        units={flatUnits} onClose={() => setEditTarget(null)} onSaved={load} />}

      <CreateUnitTypeDialog
        open={createTypeOpen}
        onClose={() => setCreateTypeOpen(false)}
        onCreated={load}
      />

      <CreatePositionDialog
        open={createPositionOpen}
        onClose={() => setCreatePositionOpen(false)}
        types={types}
        onCreated={load}
      />

      <CreateMandateDialog
        open={createMandateOpen}
        onClose={() => setCreateMandateOpen(false)}
        positions={positions}
        units={flatUnits}
        onCreated={load}
      />
    </SidebarProvider>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function MandateListForUnit({ unitId }: { unitId: string }) {
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orgUnitService.getMandatesByUnit(unitId).then((m) => { setMandates(m); setLoading(false); });
  }, [unitId]);

  if (loading) return <div className="h-20 rounded-lg bg-muted animate-pulse" />;
  if (mandates.length === 0) return <p className="text-sm text-muted-foreground">Nenhum mandato nesta unidade.</p>;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mandatos</p>
      <DataTable rows={mandates} label="mandatos da unidade" search={mandateSearchText} columns={mandateColumns} resetKey={unitId} />
    </div>
  );
}

function MandateActions({ mandate: m, onClosed }: { mandate: Mandate; onClosed: () => void }) {
  const { isTechTeam, user } = useAuthContext();
  const canManageMandates = isTechTeam || Boolean(user?.support_session_id) ||
    Boolean(user?.roles.some((role) => ['organization.admin', 'organization.manage'].includes(role)));
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');

  const handleClose = async (revoked = false) => {
    setActing(true);
    setError('');
    try {
      if (revoked) await orgUnitService.revokeMandate(m.id);
      else await orgUnitService.closeMandate(m.id);
      onClosed();
    } catch (cause: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(cause) ? cause.response?.data.message : undefined;
      setError(message ?? 'Não foi possível encerrar o mandato.');
    }
    finally { setActing(false); }
  };

  return (
    <div className="space-y-2">
      {canManageMandates && m.status === 'ACTIVE' && (
        <div className="flex gap-2">
        <Button size="sm" variant="outline" className="shrink-0" disabled={acting} onClick={() => void handleClose()}>
          <X className="h-3.5 w-3.5 mr-1" />Encerrar
        </Button>
        <Button size="sm" variant="outline" className="shrink-0 text-destructive" disabled={acting} onClick={() => void handleClose(true)}>
          Revogar
        </Button>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
