import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Stepper } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, FileEdit } from 'lucide-react';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  createMiscellaneous,
  getCreatorLevel,
  isNestingAllowed,
  listMiscellaneous,
  predictStatus,
  SCOPE_LABELS,
  STATUS_LABELS,
  TYPE_DESCRIPTIONS,
  TYPE_LABELS,
  MiscellaneousScope,
  MiscellaneousStatus,
  MiscellaneousType,
  MiscellaneousVisibility,
  type Miscellaneous,
} from '@/services/miscellaneousService';

const STEPS = ['Tipo', 'Informações', 'Visibilidade & Público', 'Donos & Membros', 'Revisão'];

interface FormState {
  type: MiscellaneousType | '';
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  visibility: MiscellaneousVisibility;
  scope: MiscellaneousScope;
  parentId: string;
  ownerIdsRaw: string;
  memberIdsRaw: string;
  cep: string;
  bairro: string;
  rua: string;
  numero: string;
  cidade: string;
  estado: string;
  isDraft: boolean;
}

const initialForm: FormState = {
  type: '',
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  visibility: MiscellaneousVisibility.PUBLICO,
  scope: MiscellaneousScope.MEU_NIVEL,
  parentId: '',
  ownerIdsRaw: '',
  memberIdsRaw: '',
  cep: '',
  bairro: '',
  rua: '',
  numero: '',
  cidade: '',
  estado: '',
  isDraft: false,
};

function parseIds(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

export default function CreateMiscellaneous() {
  const navigate = useNavigate();
  const { data: rolesAndPermissions, isLoading } = useRolesAndPermissions();
  const { user } = useAuthContext();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [parents, setParents] = useState<Miscellaneous[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Miscellaneous | null>(null);

  useEffect(() => {
    listMiscellaneous()
      .then(setParents)
      .catch(() => setParents([]));
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const creatorLevel = useMemo(
    () => getCreatorLevel(user?.positions ?? [], user?.roles ?? []),
    [user],
  );

  const endDateRequired = form.type !== '' && form.type !== MiscellaneousType.META;

  // Pais compatíveis com o tipo escolhido (RN-005/RN-006)
  const compatibleParents = useMemo(() => {
    if (!form.type) return [];
    return parents.filter(p => isNestingAllowed(p.type, form.type as MiscellaneousType));
  }, [parents, form.type]);

  const titleError =
    form.title.length > 120 ? 'Título excede 120 caracteres' : null;
  const dateError =
    form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)
      ? 'Data de término anterior à de início'
      : null;

  const predictedStatus = useMemo(
    () =>
      form.scope
        ? predictStatus(form.scope, form.isDraft, creatorLevel)
        : MiscellaneousStatus.ATIVA,
    [form.scope, form.isDraft, creatorLevel],
  );

  function canAdvance(): boolean {
    switch (step) {
      case 0:
        return form.type !== '';
      case 1:
        return (
          form.title.trim().length > 0 &&
          !titleError &&
          form.description.trim().length > 0 &&
          form.start_date !== '' &&
          (!endDateRequired || form.end_date !== '') &&
          !dateError
        );
      case 2:
        return true;
      case 3:
        return (
          form.scope !== MiscellaneousScope.SELECAO_INDIVIDUAL ||
          parseIds(form.memberIdsRaw).length > 0
        );
      default:
        return true;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const toIso = (v: string) => (v ? new Date(v).toISOString() : undefined);
      const res = await createMiscellaneous({
        type: form.type as MiscellaneousType,
        title: form.title.trim(),
        description: form.description.trim(),
        start_date: toIso(form.start_date)!,
        end_date: endDateRequired || form.end_date ? toIso(form.end_date) : undefined,
        visibility: form.visibility,
        scope: form.scope,
        parentId: form.parentId || undefined,
        ownerIds: parseIds(form.ownerIdsRaw),
        memberIds: parseIds(form.memberIdsRaw),
        cep: form.cep || undefined,
        bairro: form.bairro || undefined,
        rua: form.rua || undefined,
        numero: form.numero || undefined,
        cidade: form.cidade || undefined,
        estado: form.estado || undefined,
        isDraft: form.isDraft,
      });
      setCreated(res.data);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          'Erro ao criar miscelânea. Verifique os dados e tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={isLoading} />
      <SidebarInset>
        <AppHeader title="Nova Miscelânea" />
        <main className="flex-1 overflow-auto p-4">
          <div className="mx-auto max-w-3xl space-y-6">
            {created ? (
              <ResultCard created={created} onList={() => navigate('/miscelaneas')} onNew={() => {
                setCreated(null);
                setForm(initialForm);
                setStep(0);
              }} />
            ) : (
              <>
                <Stepper steps={STEPS} currentStep={step} />

                {/* STEP 0 — Tipo */}
                {step === 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.values(MiscellaneousType).map(t => (
                      <Card
                        key={t}
                        onClick={() => set('type', t)}
                        className={cn(
                          'cursor-pointer transition-colors hover:border-primary',
                          form.type === t && 'border-primary ring-2 ring-primary/30',
                        )}
                      >
                        <CardHeader>
                          <CardTitle>{TYPE_LABELS[t]}</CardTitle>
                          <CardDescription>{TYPE_DESCRIPTIONS[t]}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}

                {/* STEP 1 — Informações básicas */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={form.title}
                        maxLength={140}
                        onChange={e => set('title', e.target.value)}
                        placeholder="Ex.: Mutirão de arrecadação"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className={cn(titleError && 'text-destructive')}>
                          {titleError ?? ''}
                        </span>
                        <span>{form.title.length}/120</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="description">Descrição *</Label>
                      <textarea
                        id="description"
                        value={form.description}
                        onChange={e => set('description', e.target.value)}
                        rows={4}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        placeholder="Descreva a miscelânea"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="start">Data de início *</Label>
                        <Input
                          id="start"
                          type="datetime-local"
                          value={form.start_date}
                          onChange={e => set('start_date', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="end">
                          Data de término {endDateRequired ? '*' : '(opcional)'}
                        </Label>
                        <Input
                          id="end"
                          type="datetime-local"
                          value={form.end_date}
                          onChange={e => set('end_date', e.target.value)}
                        />
                      </div>
                    </div>
                    {dateError && <p className="text-xs text-destructive">{dateError}</p>}

                    <details className="rounded-md border p-3">
                      <summary className="cursor-pointer text-sm font-medium">
                        Local (opcional)
                      </summary>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Input placeholder="CEP" value={form.cep} onChange={e => set('cep', e.target.value)} />
                        <Input placeholder="Bairro" value={form.bairro} onChange={e => set('bairro', e.target.value)} />
                        <Input placeholder="Rua" value={form.rua} onChange={e => set('rua', e.target.value)} />
                        <Input placeholder="Número" value={form.numero} onChange={e => set('numero', e.target.value)} />
                        <Input placeholder="Cidade" value={form.cidade} onChange={e => set('cidade', e.target.value)} />
                        <Input placeholder="Estado" value={form.estado} onChange={e => set('estado', e.target.value)} />
                      </div>
                    </details>
                  </div>
                )}

                {/* STEP 2 — Visibilidade & Público */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label>Visibilidade *</Label>
                      <Select
                        value={form.visibility}
                        onValueChange={v => set('visibility', v as MiscellaneousVisibility)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={MiscellaneousVisibility.PUBLICO}>Público</SelectItem>
                          <SelectItem value={MiscellaneousVisibility.PRIVADO}>Privado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Escopo de público *</Label>
                      <Select
                        value={form.scope}
                        onValueChange={v => set('scope', v as MiscellaneousScope)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(MiscellaneousScope).map(s => (
                            <SelectItem key={s} value={s}>
                              {SCOPE_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Miscelânea pai (opcional)</Label>
                      <Select
                        value={form.parentId || 'none'}
                        onValueChange={v => set('parentId', v === 'none' ? '' : v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Nenhuma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma (independente)</SelectItem>
                          {compatibleParents.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              [{TYPE_LABELS[p.type]}] {p.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Apenas pais compatíveis com o tipo selecionado são listados.
                      </p>
                    </div>

                    <StatusHint status={predictedStatus} />
                  </div>
                )}

                {/* STEP 3 — Donos & Membros */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="owners">Donos adicionais (opcional)</Label>
                      <textarea
                        id="owners"
                        value={form.ownerIdsRaw}
                        onChange={e => set('ownerIdsRaw', e.target.value)}
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        placeholder="IDs de membros separados por vírgula"
                      />
                      <p className="text-xs text-muted-foreground">
                        Você (criador) já será o dono principal.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="members">
                        Membros iniciais{' '}
                        {form.scope === MiscellaneousScope.SELECAO_INDIVIDUAL
                          ? '* (convidados)'
                          : '(opcional)'}
                      </Label>
                      <textarea
                        id="members"
                        value={form.memberIdsRaw}
                        onChange={e => set('memberIdsRaw', e.target.value)}
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        placeholder="IDs de membros separados por vírgula"
                      />
                      {form.scope === MiscellaneousScope.SELECAO_INDIVIDUAL && (
                        <p className="text-xs text-muted-foreground">
                          Convites serão enviados; cada membro precisa aceitar.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4 — Revisão */}
                {step === 4 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Revisão</CardTitle>
                      <CardDescription>Confira antes de confirmar.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <Row label="Tipo" value={form.type ? TYPE_LABELS[form.type] : '-'} />
                      <Row label="Título" value={form.title} />
                      <Row label="Início" value={form.start_date || '-'} />
                      <Row label="Término" value={form.end_date || '—'} />
                      <Row
                        label="Visibilidade"
                        value={form.visibility === MiscellaneousVisibility.PUBLICO ? 'Público' : 'Privado'}
                      />
                      <Row label="Escopo" value={SCOPE_LABELS[form.scope]} />
                      <Row
                        label="Pai"
                        value={
                          form.parentId
                            ? parents.find(p => p.id === form.parentId)?.title ?? form.parentId
                            : '—'
                        }
                      />
                      <label className="mt-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.isDraft}
                          onChange={e => set('isDraft', e.target.checked)}
                        />
                        Salvar como rascunho
                      </label>
                      <div className="pt-2">
                        <StatusHint status={predictedStatus} />
                      </div>
                      {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>
                  </Card>
                )}

                {/* Navegação */}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={() => (step === 0 ? navigate('/miscelaneas') : setStep(step - 1))}
                    disabled={submitting}
                  >
                    {step === 0 ? 'Cancelar' : 'Voltar'}
                  </Button>
                  {step < STEPS.length - 1 ? (
                    <Button onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
                      Próximo
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? 'Criando...' : 'Confirmar criação'}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-1 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function StatusHint({ status }: { status: MiscellaneousStatus }) {
  const map = {
    [MiscellaneousStatus.ATIVA]: {
      icon: CheckCircle2,
      cls: 'text-green-600 bg-green-50 border-green-200',
      text: 'Será criada e ficará ativa imediatamente.',
    },
    [MiscellaneousStatus.PENDENTE_APROVACAO]: {
      icon: Clock,
      cls: 'text-amber-600 bg-amber-50 border-amber-200',
      text: 'Escopo acima do seu nível: ficará pendente de aprovação do gestor.',
    },
    [MiscellaneousStatus.RASCUNHO]: {
      icon: FileEdit,
      cls: 'text-slate-600 bg-slate-50 border-slate-200',
      text: 'Será salva como rascunho.',
    },
  }[status];
  const Icon = map.icon;
  return (
    <div className={cn('flex items-center gap-2 rounded-md border p-3 text-sm', map.cls)}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>
        <strong>{STATUS_LABELS[status]}.</strong> {map.text}
      </span>
    </div>
  );
}

function ResultCard({
  created,
  onList,
  onNew,
}: {
  created: Miscellaneous;
  onList: () => void;
  onNew: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Miscelânea processada
        </CardTitle>
        <CardDescription>"{created.title}"</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Row label="Status" value={STATUS_LABELS[created.status]} />
        <Row label="ID" value={created.id} />
        <div className="flex gap-2 pt-2">
          <Button onClick={onNew}>Criar outra</Button>
          <Button variant="outline" onClick={onList}>
            Ver lista
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
