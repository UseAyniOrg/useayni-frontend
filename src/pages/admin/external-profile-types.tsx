import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { organizationService, type Organization } from '@/services/organizationService';
import { externalProfileService, type ExternalProfileType } from '@/services/externalProfileService';
import type { ExternalRegistrationField } from '@/services/miscellaneousService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { PlatformSidebar } from '@/components/layout/PlatformSidebar';
import { AppHeader } from '@/components/layout/AppHeader';

const emptyProfile = (): ExternalProfileType => ({ key: '', name: '', description: '', fields: [] });
const types: Array<{ value: ExternalRegistrationField['type']; label: string }> = [
  { value: 'text', label: 'Texto' }, { value: 'email', label: 'Email' }, { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' }, { value: 'select', label: 'Opções' }, { value: 'checkbox', label: 'Confirmação' },
];

export default function ExternalProfileTypesPage() {
  const { user } = useAuthContext();
  const platform = user?.access_context === 'platform';
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState('');
  const [profiles, setProfiles] = useState<ExternalProfileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!platform) return;
    organizationService.listAll().then(items => {
      setOrganizations(items);
      setOrganizationId(items[0]?.id ?? '');
    }).catch(() => setError('Não foi possível carregar as organizações.'));
  }, [platform]);

  useEffect(() => {
    if (platform && !organizationId) { setLoading(false); return; }
    let active = true;
    setLoading(true); setError(''); setSaved(false); setProfiles([]);
    externalProfileService.listTypes(platform ? organizationId : undefined)
      .then(data => { if (active) setProfiles(data); })
      .catch(() => { if (active) setError('Não foi possível carregar os tipos de cadastro.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [platform, organizationId]);

  const updateProfile = (index: number, patch: Partial<ExternalProfileType>) => {
    setSaved(false);
    setProfiles(current => current.map((profile, i) => i === index ? { ...profile, ...patch } : profile));
  };
  const updateField = (index: number, fieldIndex: number, patch: Partial<ExternalRegistrationField>) => {
    updateProfile(index, { fields: profiles[index].fields.map((field, i) => i === fieldIndex ? { ...field, ...patch } : field) });
  };
  const save = async () => {
    setSaving(true); setSaved(false); setError('');
    try {
      setProfiles(await externalProfileService.saveTypes(profiles, platform ? organizationId : undefined));
      setSaved(true);
    } catch (cause: unknown) {
      const message = typeof cause === 'object' && cause !== null && 'response' in cause
        ? (cause as { response?: { data?: { message?: unknown } } }).response?.data?.message : undefined;
      setError(typeof message === 'string' ? message : 'Não foi possível salvar os tipos de cadastro.');
    } finally { setSaving(false); }
  };

  return <SidebarProvider>
    {platform ? <PlatformSidebar /> : <AppSidebar />}
    <SidebarInset>
    <AppHeader title="Tipos de cadastro" />
    <main className="mx-auto w-full max-w-4xl space-y-6 p-6 sm:p-10">
    <Link to="/admin" className="text-sm text-primary underline">Voltar à administração</Link>
    <header className="space-y-2">
      <h1 className="text-3xl font-semibold">Tipos de cadastro da organização</h1>
      <p className="text-sm text-muted-foreground">Crie opções como Básico, Universitário e Empresário, definindo os campos de cada uma. São tipos de cadastro para membros e comunidade, não apenas para externos. As mesmas opções aparecem no cadastro da organização e na inscrição pública dos eventos. Nome, email, telefone e CPF já fazem parte dos dados básicos.</p>
      <p className="text-sm text-muted-foreground">Para reaproveitar um dado entre organizações, use a mesma chave, rótulo, formato e opções (por exemplo, conselho_profissional). Não reutilize a chave para outra informação. Os dados são compartilhados somente após a confirmação da pessoa.</p>
    </header>
    {platform && <label className="grid gap-2"><span>Organização</span>
      <select className="rounded-md border bg-background p-2" value={organizationId} onChange={event => setOrganizationId(event.target.value)} disabled={saving}>
        <option value="">Selecione</option>{organizations.map(organization => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
      </select>
    </label>}
    {loading ? <p>Carregando perfis...</p> : <fieldset disabled={saving || profiles.length === 0 || (platform && !organizationId)} className="space-y-5">
      {profiles.map((profile, index) => <section key={index} className="space-y-4 rounded-xl border p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm"><span>Nome do tipo de cadastro</span><Input value={profile.name} maxLength={120} onChange={event => updateProfile(index, { name: event.target.value })} /></label>
          <label className="grid gap-1 text-sm"><span>Chave estável do tipo de cadastro</span><Input value={profile.key} placeholder="universitario" maxLength={64} onChange={event => updateProfile(index, { key: event.target.value })} /></label>
        </div>
        <label className="grid gap-1 text-sm"><span>Descrição para quem se cadastra</span><Input value={profile.description} maxLength={1000} onChange={event => updateProfile(index, { description: event.target.value })} /></label>
        {profile.fields.map((field, fieldIndex) => <div key={fieldIndex} className="space-y-3 rounded-lg bg-muted/40 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm"><span>Rótulo</span><Input value={field.label} maxLength={150} onChange={event => updateField(index, fieldIndex, { label: event.target.value })} /></label>
            <label className="grid gap-1 text-sm"><span>Chave de reaproveitamento</span><Input value={field.key} placeholder="conselho_profissional" maxLength={64} onChange={event => updateField(index, fieldIndex, { key: event.target.value })} /></label>
            <label className="grid gap-1 text-sm"><span>Formato</span><select className="rounded-md border bg-background p-2" value={field.type} onChange={event => updateField(index, fieldIndex, { type: event.target.value as ExternalRegistrationField['type'], options: undefined })}>
              {types.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={field.required} onChange={event => updateField(index, fieldIndex, { required: event.target.checked })} />Obrigatório</label>
          </div>
          {field.type === 'select' && <label className="grid gap-1 text-sm"><span>Opções (uma por linha)</span>
            <textarea className="min-h-24 rounded-md border bg-background p-2" value={(field.options ?? []).join('\n')} onChange={event => updateField(index, fieldIndex, { options: event.target.value.split('\n') })} />
          </label>}
          <Button variant="ghost" onClick={() => updateProfile(index, { fields: profile.fields.filter((_, i) => i !== fieldIndex) })}>Remover campo</Button>
        </div>)}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={profile.fields.length >= 40} onClick={() => updateProfile(index, { fields: [...profile.fields, { key: '', label: '', type: 'text', required: false }] })}>Adicionar campo</Button>
          <Button variant="ghost" disabled={profiles.length <= 1} onClick={() => { setProfiles(current => current.filter((_, i) => i !== index)); setSaved(false); }}>Remover tipo de cadastro</Button>
        </div>
      </section>)}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" disabled={profiles.length >= 20} onClick={() => { setProfiles(current => [...current, emptyProfile()]); setSaved(false); }}>Adicionar tipo de cadastro</Button>
        <Button disabled={saving || profiles.length === 0} onClick={() => void save()}>{saving ? 'Salvando...' : 'Salvar tipos de cadastro'}</Button>
      </div>
    </fieldset>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {saved && <p role="status" className="text-sm text-emerald-700">Tipos de cadastro salvos. A configuração será usada nos próximos cadastros e inscrições públicas.</p>}
    <Label className="block text-xs text-muted-foreground">Alterações não modificam os dados já enviados em inscrições anteriores. Evite remover perfis em uso durante inscrições abertas.</Label>
  </main>
  </SidebarInset>
  </SidebarProvider>;
}
