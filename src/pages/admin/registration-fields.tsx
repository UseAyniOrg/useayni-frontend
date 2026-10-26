import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { PlatformSidebar } from '@/components/layout/PlatformSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuthContext } from '@/contexts/AuthContext';
import { organizationService, type Organization, type RegistrationFieldDefinition } from '@/services/organizationService';

type FieldType = RegistrationFieldDefinition['field_type'];

const fieldTypes: Array<{ value: FieldType; label: string }> = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'select', label: 'Lista de opções' },
  { value: 'checkbox', label: 'Confirmação' },
  { value: 'file', label: 'Arquivo' },
];

function makeFieldKey(label: string): string {
  return label.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 100);
}

export default function RegistrationFieldsPage() {
  const { isTechTeam } = useAuthContext();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState('');
  const [fields, setFields] = useState<RegistrationFieldDefinition[]>([]);
  const [label, setLabel] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState('');
  const [editingKey, setEditingKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isTechTeam) return;
    let active = true;
    organizationService.listAll()
      .then((items) => {
        if (!active) return;
        setOrganizations(items);
        setOrganizationId((current) => current || items[0]?.id || '');
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar as organizações.');
      });
    return () => { active = false; };
  }, [isTechTeam]);

  useEffect(() => {
    if (isTechTeam && !organizationId) {
      setFields([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    organizationService.getRegistrationFields(isTechTeam ? organizationId : undefined)
      .then((items) => { if (active) setFields(items); })
      .catch(() => { if (active) setError('Não foi possível carregar os campos de cadastro.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isTechTeam, organizationId]);

  const resetForm = () => {
    setLabel('');
    setFieldType('text');
    setRequired(false);
    setOptions('');
    setEditingKey('');
  };

  const saveField = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const fieldOptions = fieldType === 'select'
      ? options.split('\n').map((option) => option.trim()).filter(Boolean)
      : null;
    try {
      if (editingKey) {
        await organizationService.updateRegistrationField(editingKey, {
          label: label.trim(),
          field_type: fieldType,
          required,
          options: fieldOptions,
          position: fields.find((field) => field.field_key === editingKey)?.position ?? fields.length,
        }, isTechTeam ? organizationId : undefined);
      } else {
        await organizationService.createRegistrationField({
          field_key: makeFieldKey(label),
          label: label.trim(),
          field_type: fieldType,
          required,
          options: fieldOptions,
          position: fields.length,
        }, isTechTeam ? organizationId : undefined);
      }
      setFields(await organizationService.getRegistrationFields(isTechTeam ? organizationId : undefined));
      setSuccess(editingKey ? 'Campo atualizado.' : 'Campo adicionado ao cadastro.');
      resetForm();
    } catch (cause: unknown) {
      const responseMessage = typeof cause === 'object' && cause !== null && 'response' in cause
        ? (cause as { response?: { data?: { message?: unknown } } }).response?.data?.message
        : undefined;
      setError(typeof responseMessage === 'string' ? responseMessage : 'Não foi possível salvar o campo.');
    } finally {
      setSaving(false);
    }
  };

  const editField = (field: RegistrationFieldDefinition) => {
    setEditingKey(field.field_key);
    setLabel(field.label);
    setFieldType(field.field_type);
    setRequired(field.required);
    setOptions(field.options?.join('\n') ?? '');
    setError('');
    setSuccess('');
  };

  const deleteField = async (field: RegistrationFieldDefinition) => {
    if (!window.confirm(`Remover o campo "${field.label}" do cadastro?`)) return;
    setError('');
    try {
      await organizationService.deleteRegistrationField(field.field_key, isTechTeam ? organizationId : undefined);
      setFields((current) => current.filter((item) => item.field_key !== field.field_key));
      if (editingKey === field.field_key) resetForm();
    } catch {
      setError('Não foi possível remover o campo.');
    }
  };

  return (
    <SidebarProvider>
      {isTechTeam ? <PlatformSidebar /> : <AppSidebar />}
      <SidebarInset>
        <AppHeader title="Campos de cadastro" />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl space-y-8 p-6 lg:p-8">
            <header>
              <p className="text-sm text-muted-foreground">Configuração da organização</p>
              <h1 className="mt-1 text-3xl font-semibold">Dados solicitados no cadastro</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Defina quais informações são solicitadas às pessoas que ingressam na organização.
              </p>
            </header>

            {isTechTeam && (
              <div className="max-w-xl space-y-2">
                <Label htmlFor="registration-organization">Organização</Label>
                <select
                  id="registration-organization"
                  className="h-10 w-full rounded-md border bg-background px-3"
                  value={organizationId}
                  onChange={(event) => setOrganizationId(event.target.value)}
                >
                  <option value="">Selecione uma organização</option>
                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>{organization.name}</option>
                  ))}
                </select>
              </div>
            )}

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {success && <p role="status" className="text-sm text-emerald-700">{success}</p>}

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
              <section>
                <h2 className="text-lg font-semibold">Campos ativos</h2>
                {loading ? <p className="mt-4 text-sm text-muted-foreground">Carregando campos...</p> : fields.length === 0 ? (
                  <p className="mt-4 border-y py-6 text-sm text-muted-foreground">Nenhum campo adicional configurado.</p>
                ) : (
                  <ol className="mt-3 divide-y border-y">
                    {fields.map((field) => (
                      <li className="flex flex-wrap items-center justify-between gap-3 py-4" key={field.field_key}>
                        <div className="min-w-0">
                          <p className="font-medium">{field.label}{field.required ? <span className="text-destructive"> *</span> : ''}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {fieldTypes.find((item) => item.value === field.field_type)?.label} · {field.field_key}
                          </p>
                          {field.options?.length ? <p className="mt-1 text-xs text-muted-foreground">{field.options.join(' · ')}</p> : null}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" aria-label={`Editar ${field.label}`} onClick={() => editField(field)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label={`Remover ${field.label}`} onClick={() => void deleteField(field)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <form className="space-y-4 border-t pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0" onSubmit={(event) => void saveField(event)}>
                <div>
                  <h2 className="text-lg font-semibold">{editingKey ? 'Editar campo' : 'Adicionar campo'}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Os campos padrão do sistema permanecem inalterados.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field-label">Nome do campo</Label>
                  <Input id="field-label" value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field-type">Tipo de resposta</Label>
                  <select id="field-type" className="h-10 w-full rounded-md border bg-background px-3" value={fieldType} onChange={(event) => setFieldType(event.target.value as FieldType)}>
                    {fieldTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
                {fieldType === 'select' && (
                  <div className="space-y-2">
                    <Label htmlFor="field-options">Opções, uma por linha</Label>
                    <textarea id="field-options" className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm" value={options} onChange={(event) => setOptions(event.target.value)} required />
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} />
                  Resposta obrigatória
                </label>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving || (isTechTeam && !organizationId)}>
                    <Plus className="mr-2 h-4 w-4" /> {saving ? 'Salvando...' : editingKey ? 'Salvar alterações' : 'Adicionar campo'}
                  </Button>
                  {editingKey && <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>}
                </div>
              </form>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}