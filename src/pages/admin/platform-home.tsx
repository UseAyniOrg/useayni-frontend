import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Building2, CirclePlus, Globe2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth/authService';
import { tenantUrl } from '@/lib/auth/accessContext';
import {
  organizationService,
  type FeatureDefinition,
  type Organization,
  type OrganizationAuditEntry,
  type OrgFeature,
  type ProvisionedAccess,
} from '@/services/organizationService';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { PlatformSidebar } from '@/components/layout/PlatformSidebar';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import HierarchyTemplates from '@/components/admin/HierarchyTemplates';
import EmailUsagePanel from '@/components/admin/EmailUsagePanel';

interface SetupForm {
  legal_name: string;
  description: string;
  contact_email: string;
  phone: string;
  website: string;
  chief_type: 'person' | 'organization';
  chief_name: string;
  chief_email: string;
  admin_email: string;
  public_home_title: string;
  public_home_description: string;
}

const EMPTY_SETUP: SetupForm = {
  legal_name: '',
  description: '',
  contact_email: '',
  phone: '',
  website: '',
  chief_type: 'person',
  chief_name: '',
  chief_email: '',
  admin_email: '',
  public_home_title: '',
  public_home_description: '',
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function setupFromOrganization(organization: Organization): SetupForm {
  const provisioning = asRecord(organization.settings.provisioning);
  const read = (key: Exclude<keyof SetupForm, 'chief_type'>) =>
    typeof provisioning[key] === 'string' ? provisioning[key] as string : '';
  return {
    legal_name: read('legal_name'),
    description: read('description'),
    contact_email: read('contact_email'),
    phone: read('phone'),
    website: read('website'),
    chief_type: provisioning.chief_type === 'organization' ? 'organization' : 'person',
    chief_name: read('chief_name'),
    chief_email: read('chief_email'),
    admin_email: read('admin_email'),
    public_home_title: read('public_home_title'),
    public_home_description: read('public_home_description'),
  };
}

function messageFromError(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback;
  const message = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.filter((item): item is string => typeof item === 'string').join(', ') || fallback;
  return fallback;
}

function SetupFields({
  value,
  onChange,
}: {
  value: SetupForm;
  onChange: (next: SetupForm) => void;
}) {
  const update = (key: keyof SetupForm, fieldValue: string) =>
    onChange({ ...value, [key]: fieldValue });
  const input = (key: keyof SetupForm, label: string, type = 'text') => (
    <label className="grid gap-1 text-sm" key={key}>
      <span>{label}</span>
      <input
        className="rounded-md border bg-background px-3 py-2"
        type={type}
        value={value[key]}
        onChange={(event) => update(key, event.target.value)}
      />
    </label>
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {input('legal_name', 'Razão social / nome legal')}
      {input('contact_email', 'Email geral da organização', 'email')}
      {input('phone', 'Telefone de contato', 'tel')}
      {input('website', 'Site público', 'url')}
      <label className="grid gap-1 text-sm">
        <span>Responsável principal</span>
        <select
          className="rounded-md border bg-background px-3 py-2"
          value={value.chief_type}
          onChange={(event) => update('chief_type', event.target.value as SetupForm['chief_type'])}
        >
          <option value="person">Pessoa responsável</option>
          <option value="organization">A própria organização</option>
        </select>
      </label>
      {input('chief_name', value.chief_type === 'person' ? 'Nome do responsável' : 'Nome da organização responsável')}
      {input('chief_email', 'Email do responsável principal', 'email')}
      {input('admin_email', 'Email do administrador chefe', 'email')}
      <p className="text-xs text-muted-foreground sm:col-span-2">
        Ao criar a organização com o email do administrador chefe, um convite será enfileirado. O acesso ao painel depende da ativação da organização.
      </p>
      {input('public_home_title', 'Título da página pública')}
      {input('public_home_description', 'Texto de apresentação da página')}
      <label className="grid gap-1 text-sm sm:col-span-2">
        <span>Descrição da organização</span>
        <textarea
          className="min-h-20 rounded-md border bg-background px-3 py-2"
          value={value.description}
          onChange={(event) => update('description', event.target.value)}
        />
      </label>
    </div>
  );
}

export default function PlatformAdminHome() {
  const { user, setUser } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const isOrganizationManagement = location.pathname.startsWith('/admin/organizacoes');
  const isOrganizationList = location.pathname === '/admin/organizacoes';
  const isOrganizationCreate = location.pathname === '/admin/organizacoes/nova';
  const selectedOrganizationId = isOrganizationCreate
    ? undefined
    : /^\/admin\/organizacoes\/([^/]+)$/.exec(location.pathname)?.[1];
  const isOrganizationDetails = Boolean(selectedOrganizationId);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [catalog, setCatalog] = useState<FeatureDefinition[]>([]);
  const [featuresByOrganization, setFeaturesByOrganization] = useState<Record<string, OrgFeature[]>>({});
  const [setupByOrganization, setSetupByOrganization] = useState<Record<string, SetupForm>>({});
  const [adminEmails, setAdminEmails] = useState<Record<string, string>>({});
  const [adminAccessByOrganization, setAdminAccessByOrganization] = useState<Record<string, ProvisionedAccess>>({});
  const [memberImportFile, setMemberImportFile] = useState<Record<string, string>>({});
  const [memberImportFileName, setMemberImportFileName] = useState<Record<string, string>>({});
  const [memberImportResults, setMemberImportResults] = useState<Record<string, ProvisionedAccess[]>>({});
  const [suspensionReasons, setSuspensionReasons] = useState<Record<string, string>>({});
  const [mediaQuotaDrafts, setMediaQuotaDrafts] = useState<Record<string, string>>({});
  const [supportReasons, setSupportReasons] = useState<Record<string, string>>({});
  const [auditByOrganization, setAuditByOrganization] = useState<Record<string, OrganizationAuditEntry[]>>({});
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [newSetup, setNewSetup] = useState<SetupForm>(EMPTY_SETUP);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState('');

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      const [organizationList, featureCatalog] = await Promise.all([
        organizationService.listAll(),
        isOrganizationDetails ? organizationService.getFeatureCatalog() : Promise.resolve([]),
      ]);
      const selectedOrganization = organizationList.find((item) => item.id === selectedOrganizationId);
      const featureLists = isOrganizationDetails && selectedOrganization
        ? [await organizationService.getFeatures(selectedOrganization.id)]
        : [];
      setOrganizations(organizationList);
      setCatalog(featureCatalog);
      setFeaturesByOrganization(Object.fromEntries(
        selectedOrganizationId && featureLists.length
          ? [[selectedOrganizationId, featureLists[0]]]
          : [],
      ));
      setSetupByOrganization(Object.fromEntries(
        organizationList.map((organization) => [organization.id, setupFromOrganization(organization)]),
      ));
      setError('');
    } catch (cause: unknown) {
      setError(messageFromError(cause, 'Não foi possível carregar os dados da plataforma.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrganizations();
  }, [isOrganizationManagement, isOrganizationDetails, selectedOrganizationId]);

  const createOrganization = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving('create');
    setError('');
    try {
      const createdOrganization = await organizationService.create({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        settings: {
          provisioning: newSetup,
          public_home: {
            title: newSetup.public_home_title,
            description: newSetup.public_home_description,
          },
        },
      });
      setName('');
      setSlug('');
      setNewSetup(EMPTY_SETUP);
      navigate(`/admin/organizacoes/${createdOrganization.id}`);
    } catch (cause: unknown) {
      setError(messageFromError(cause, 'Não foi possível criar o rascunho da organização.'));
    } finally {
      setSaving('');
    }
  };

  const selectedOrganization = organizations.find((organization) => organization.id === selectedOrganizationId);

  const saveSetup = async (event: FormEvent<HTMLFormElement>, organization: Organization) => {
    event.preventDefault();
    const setup = setupByOrganization[organization.id] ?? EMPTY_SETUP;
    setSaving(`setup:${organization.id}`);
    setError('');
    try {
      await organizationService.update(organization.id, {
        settings: {
          ...organization.settings,
          provisioning: setup,
          public_home: {
            title: setup.public_home_title,
            description: setup.public_home_description,
          },
        },
        onboarding_step: Math.max(organization.onboarding_step, 2),
      });
      await loadOrganizations();
    } catch (cause: unknown) {
      setError(messageFromError(cause, 'Não foi possível salvar o andamento da configuração.'));
    } finally {
      setSaving('');
    }
  };

  const activateOrganization = async (organization: Organization) => {
    setSaving(`activate:${organization.id}`);
    setError('');
    try {
      await organizationService.update(organization.id, {
        status: 'ACTIVE',
        onboarding_step: 3,
      });
      await loadOrganizations();
    } catch (cause: unknown) {
      setError(messageFromError(cause, 'Não foi possível ativar a organização.'));
    } finally {
      setSaving('');
    }
  };

  const setOrganizationStatus = async (organization: Organization, status: string) => {
    setSaving(`status:${organization.id}`);
    setError('');
    try {
      await organizationService.update(organization.id, {
        status,
        ...(status === 'SUSPENDED'
          ? { suspension_reason: suspensionReasons[organization.id] ?? '' }
          : {}),
      });
      await loadOrganizations();
    } catch (cause: unknown) {
      setError(messageFromError(cause, 'Não foi possível alterar o status da organização.'));
    } finally {
      setSaving('');
    }
  };

  const grantOrganizationAdmin = async (event: FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();
    setSaving(`admin:${id}`);
    setError('');
    try {
      const access = await organizationService.issueAdminAccess(
        id, adminEmails[id] ?? setupByOrganization[id]?.admin_email ?? '',
      );
      setAdminAccessByOrganization((current) => ({ ...current, [id]: access }));
    } catch (cause: unknown) {
      setError(messageFromError(cause, 'Não foi possível atribuir o administrador.'));
    } finally {
      setSaving('');
    }
  };

  const importMembers = async (event: FormEvent<HTMLFormElement>, organizationId: string) => {
    event.preventDefault();
    const lines = (memberImportFile[organizationId] ?? '').replace(/^\uFEFF/, '').split(/\r?\n/);
    const emails = lines.map((line) => line.split(/[,;\t]/)[0].trim().replace(/^"|"$/g, ''))
      .filter((value) => value && value.toLowerCase() !== 'email');
    if (!emails.length || emails.length > 500) {
      setError('Envie entre 1 e 500 emails. O email deve estar na primeira coluna.');
      return;
    }
    setSaving(`import:${organizationId}`);
    setError('');
    try {
      const response = await organizationService.importMembers(organizationId, emails);
      setMemberImportResults((current) => ({ ...current, [organizationId]: response.results }));
      setMemberImportFile((current) => ({ ...current, [organizationId]: '' }));
    } catch (cause: unknown) {
      setError(messageFromError(cause, 'Não foi possível importar os membros.'));
    } finally {
      setSaving('');
    }
  };

  const reissueMemberAccess = async (organizationId: string, email: string) => {
    setSaving(`import:${organizationId}`);
    setError('');
    try {
      const access = await organizationService.issueMemberAccess(organizationId, email);
      setMemberImportResults((current) => ({
        ...current,
        [organizationId]: (current[organizationId] ?? []).map((row) => row.email === email ? access : row),
      }));
    } catch (cause: unknown) {
      setError(messageFromError(cause, 'Não foi possível emitir o acesso do membro.'));
    } finally {
      setSaving('');
    }
  };

  const startSupport = async (organization: Organization, target = '/admin') => {
    setSaving(`support:${organization.id}`);
    setError('');
    try {
      const session = await authService.startSupportSession(
        organization.id,
        supportReasons[organization.id] ?? '',
      );
      setUser(session.user);
      window.location.assign(tenantUrl(session.tenantSlug, target));
    } catch (cause: unknown) {
      setError(messageFromError(cause, 'Não foi possível iniciar a sessão de suporte.'));
    } finally {
      setSaving('');
    }
  };

  const toggleFeature = async (organizationId: string, feature: FeatureDefinition, enabled: boolean) => {
    setSaving(`feature:${organizationId}:${feature.slug}`);
    setError('');
    try {
      const updated = await organizationService.setFeature(organizationId, {
        feature_slug: feature.slug,
        enabled,
        config: featuresByOrganization[organizationId]?.find((item) => item.feature_slug === feature.slug)?.config ?? {},
      });
      setFeaturesByOrganization((current) => ({
        ...current,
        [organizationId]: [
          ...(current[organizationId] ?? []).filter((item) => item.feature_slug !== feature.slug),
          updated,
        ],
      }));
    } catch (cause: unknown) {
      setError(messageFromError(cause, `Não foi possível alterar o módulo ${feature.name}.`));
    } finally {
      setSaving('');
    }
  };

  const saveMediaQuota = async (organizationId: string, enabled: boolean, currentConfig: Record<string, unknown>) => {
    const megabytes = Number(mediaQuotaDrafts[organizationId]);
    if (!Number.isFinite(megabytes) || megabytes <= 0) {
      setError('Informe uma cota de armazenamento maior que zero.');
      return;
    }
    setSaving(`quota:${organizationId}`);
    setError('');
    try {
      const updated = await organizationService.setFeature(organizationId, {
        feature_slug: 'media_storage',
        enabled,
        config: { ...currentConfig, quota_bytes: Math.floor(megabytes * 1024 * 1024) },
      });
      setFeaturesByOrganization((current) => ({
        ...current,
        [organizationId]: [
          ...(current[organizationId] ?? []).filter((item) => item.feature_slug !== 'media_storage'),
          updated,
        ],
      }));
    } catch (cause: unknown) {
      setError(messageFromError(cause, 'Não foi possível salvar a cota de mídia.'));
    } finally {
      setSaving('');
    }
  };

  const loadAudit = async (organizationId: string) => {
    setSaving(`audit:${organizationId}`);
    setError('');
    try {
      const entries = await organizationService.getAuditHistory(organizationId);
      setAuditByOrganization((current) => ({
        ...current,
        [organizationId]: entries,
      }));
    } catch (cause: unknown) {
      setError(messageFromError(cause, 'Não foi possível carregar o histórico de alterações.'));
    } finally {
      setSaving('');
    }
  };

  if (!user?.roles.includes('EQUIPE_TECNICA')) {
    return <main className="p-8">Acesso restrito à equipe técnica da plataforma.</main>;
  }

  return (
    <SidebarProvider>
      <PlatformSidebar />
      <SidebarInset>
        <AppHeader title="Super Admin" />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      {!isOrganizationManagement ? (
        <>
          <header id="platform-overview" className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">UseAyni · Plataforma</p>
              <h1 className="mt-1 text-3xl font-semibold">Bom dia, {user.name.split(' ')[0]}</h1>
              <p className="mt-2 text-muted-foreground">Visão geral e ações da plataforma.</p>
            </div>
            <Link className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" to="/admin/organizacoes">
              <CirclePlus className="h-4 w-4" /> Nova organização
            </Link>
          </header>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <section aria-label="Resumo da plataforma" className="grid gap-6 border-y py-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Organizações', value: organizations.length, detail: 'No ambiente' },
              { label: 'Ativas', value: organizations.filter((item) => item.status === 'ACTIVE' || item.status === 'TRIAL').length, detail: 'Com acesso liberado' },
              { label: 'Em configuração', value: organizations.filter((item) => item.status === 'DRAFT').length, detail: 'Rascunhos para concluir' },
              { label: 'Suspensas', value: organizations.filter((item) => item.status === 'SUSPENDED').length, detail: 'Acesso pausado' },
            ].map((metric) => (
              <div key={metric.label}>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{isLoading ? '—' : metric.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
              </div>
            ))}
          </section>

          <EmailUsagePanel />

          <section className="grid gap-8 py-2 md:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Atalhos</h2>
              <Link className="flex items-center justify-between border-b py-4 hover:text-primary" to="/admin/organizacoes">
                <span className="flex items-center gap-3"><Building2 className="h-5 w-5" /> Gestão de organizações</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link className="flex items-center justify-between border-b py-4 hover:text-primary" to="/admin/organizacao/home">
                <span className="flex items-center gap-3"><Globe2 className="h-5 w-5" /> Personalizar home pública</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="border-l-2 border-primary/30 pl-5 md:ml-6">
              <p className="text-sm text-muted-foreground">Próxima ação</p>
              <h2 className="mt-2 text-xl font-semibold">
                {organizations.some((item) => item.status === 'DRAFT')
                  ? 'Conclua a configuração pendente'
                  : organizations.length === 0
                    ? 'Comece criando a primeira organização'
                    : 'Revise a experiência pública dos tenants'}
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Configure identidade visual, conteúdo, módulos e acesso administrativo em um fluxo dedicado.
              </p>
              <Link className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline" to="/admin/organizacoes">
                Abrir gestão <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </>
      ) : (
        <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">UseAyni · Super Admin</p>
          <h1 className="mt-1 text-3xl font-semibold">
            {isOrganizationList ? 'Organizações' : isOrganizationCreate ? 'Nova organização' : 'Configuração da organização'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isOrganizationList
              ? 'Consulte tenants e abra uma ficha para administrar seus dados.'
              : isOrganizationCreate
                ? 'Cadastre uma organização como rascunho e configure-a na ficha dedicada.'
                : selectedOrganization?.name ?? 'Dados, módulos, suporte e auditoria.'}
          </p>
        </div>
        {isOrganizationList ? (
          <Link className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" to="/admin/organizacoes/nova">
            <CirclePlus className="h-4 w-4" /> Nova organização
          </Link>
        ) : (
          <Link className="text-sm font-medium text-primary hover:underline" to="/admin/organizacoes">Voltar à listagem</Link>
        )}
      </header>

      {isOrganizationCreate && <section className="max-w-4xl space-y-5 border-t pt-6">
        <h2 className="text-lg font-medium">Dados iniciais</h2>
        <p className="text-sm text-muted-foreground">
          A organização será criada como rascunho. Depois, na ficha, você configura módulos, acesso e ativação.
        </p>
        <form className="mt-4 space-y-4" onSubmit={(event) => void createOrganization(event)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span>Nome público</span>
              <input className="rounded-md border bg-background px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Identificador do subdomínio</span>
              <input className="rounded-md border bg-background px-3 py-2" value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase())} pattern="[a-z0-9-]+" required minLength={2} />
            </label>
          </div>
          <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" disabled={saving === 'create'}>
            {saving === 'create' ? 'Salvando rascunho...' : 'Criar rascunho'}
          </button>
        </form>
      </section>}

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {isOrganizationList && <section className="border-t pt-4">
        {isLoading ? (
          <p>Carregando organizações...</p>
        ) : organizations.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">Nenhuma organização cadastrada.</p>
        ) : (
          <DataTable rows={organizations} label="organizações" search={organization => `${organization.name} ${organization.slug} ${organization.status} ${organization.plan?.name ?? ''}`}
            columns={[
              { key: 'name', header: 'Organização', cell: organization => organization.name },
              { key: 'slug', header: 'Slug', cell: organization => organization.slug },
              { key: 'status', header: 'Status', cell: organization => organization.status },
              { key: 'plan', header: 'Plano', cell: organization => organization.plan?.name ?? 'Sem plano' },
              { key: 'step', header: 'Etapa', cell: organization => `${organization.onboarding_step}/3` },
              { key: 'actions', header: 'Ações', cell: organization => <Button size="sm" variant="outline" onClick={() => navigate(`/admin/organizacoes/${organization.id}`)}>Abrir ficha</Button> },
            ]} />
        )}
      </section>}

      {isOrganizationDetails && <section className="space-y-3 border-t pt-4">
        {isLoading ? (
          <p>Carregando organização...</p>
        ) : !selectedOrganization ? (
          <p className="text-sm text-muted-foreground">Organização não encontrada.</p>
        ) : [selectedOrganization].map((organization) => {
          const features = featuresByOrganization[organization.id] ?? [];
          const setup = setupByOrganization[organization.id] ?? EMPTY_SETUP;
          return (
            <article className="space-y-4 rounded-lg border p-4" key={organization.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">{organization.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {organization.slug}.useayni.com · {organization.plan?.name ?? 'Sem plano'} · etapa {organization.onboarding_step}
                  </p>
                </div>
                <span className="rounded-full border px-3 py-1 text-xs">{organization.status}</span>
              </div>

              <details>
                <summary className="cursor-pointer font-medium">
                  {organization.status === 'DRAFT' ? 'Retomar configuração' : 'Editar dados e página pública'}
                </summary>
                <form className="mt-4 space-y-4" onSubmit={(event) => void saveSetup(event, organization)}>
                  <SetupFields
                    value={setup}
                    onChange={(next) => setSetupByOrganization((current) => ({
                      ...current,
                      [organization.id]: next,
                    }))}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-md border px-4 py-2 disabled:opacity-50" disabled={saving === `setup:${organization.id}`}>
                      Salvar andamento
                    </button>
                    {organization.status === 'DRAFT' && (
                      <button
                        type="button"
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
                        disabled={saving === `activate:${organization.id}`}
                        onClick={() => void activateOrganization(organization)}
                      >
                        Ativar organização
                      </button>
                    )}
                  </div>
                </form>
              </details>

              <details>
                <summary className="cursor-pointer font-medium">Módulos e funcionalidades</summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {catalog.map((feature) => {
                    const featureState = features.find((item) => item.feature_slug === feature.slug);
                    const enabled = featureState?.enabled ?? false;
                    const pending = saving === `feature:${organization.id}:${feature.slug}`;
                    const missingRequirements = (feature.requires ?? []).filter((requiredSlug) =>
                      !features.some((item) => item.feature_slug === requiredSlug && item.enabled),
                    );
                    const activeDependents = catalog.filter((candidate) =>
                      candidate.requires?.includes(feature.slug) &&
                      features.some((item) => item.feature_slug === candidate.slug && item.enabled),
                    );
                    const blocked = !feature.available || Boolean(feature.required) || pending ||
                      (!enabled && missingRequirements.length > 0) || (enabled && activeDependents.length > 0);
                    return (
                      <div className="space-y-3 rounded-md border p-3 text-sm" key={feature.slug}>
                        <label className="flex gap-3">
                          <input
                            type="checkbox"
                            checked={enabled}
                            disabled={blocked}
                            onChange={(event) => void toggleFeature(organization.id, feature, event.target.checked)}
                          />
                          <span>
                            <span className="block font-medium">{feature.name}</span>
                            <span className="block text-muted-foreground">{feature.description}</span>
                            {!feature.available && <span className="text-xs text-amber-700">Em implementação</span>}
                            {feature.required && <span className="text-xs text-muted-foreground">Obrigatório</span>}
                            {missingRequirements.length > 0 && !enabled && (
                              <span className="block text-xs text-muted-foreground">
                                Requer {missingRequirements.map((slug) => catalog.find((item) => item.slug === slug)?.name ?? slug).join(', ')}.
                              </span>
                            )}
                            {activeDependents.length > 0 && enabled && (
                              <span className="block text-xs text-muted-foreground">
                                Desative {activeDependents.map((item) => item.name).join(', ')} antes.
                              </span>
                            )}
                          </span>
                        </label>
                        {feature.slug === 'media_storage' && (
                          <div className="flex flex-wrap items-end gap-2 border-t pt-3">
                            <label className="grid gap-1">
                              <span className="text-xs text-muted-foreground">Cota de mídia (MiB)</span>
                              <input
                                className="w-36 rounded-md border bg-background px-2 py-1"
                                type="number"
                                min="1"
                                value={mediaQuotaDrafts[organization.id] ??
                                  String(Math.floor(Number(featureState?.config.quota_bytes ?? 1073741824) / (1024 * 1024)))}
                                onChange={(event) => setMediaQuotaDrafts((current) => ({
                                  ...current,
                                  [organization.id]: event.target.value,
                                }))}
                              />
                            </label>
                            <button
                              type="button"
                              className="rounded-md border px-3 py-1.5 disabled:opacity-50"
                              disabled={saving === `quota:${organization.id}`}
                              onClick={() => void saveMediaQuota(
                                organization.id,
                                enabled,
                                featureState?.config ?? { quota_bytes: 1073741824 },
                              )}
                            >
                              {saving === `quota:${organization.id}` ? 'Salvando...' : 'Salvar cota'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </details>

              {organization.status === 'ACTIVE' || organization.status === 'TRIAL' ? (
                <form
                  className="flex flex-wrap items-end gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void setOrganizationStatus(organization, 'SUSPENDED');
                  }}
                >
                  <label className="grid min-w-60 flex-1 gap-1 text-sm">
                    <span>Motivo da suspensão</span>
                    <input
                      className="rounded-md border bg-background px-3 py-2"
                      value={suspensionReasons[organization.id] ?? ''}
                      onChange={(event) => setSuspensionReasons((current) => ({
                        ...current,
                        [organization.id]: event.target.value,
                      }))}
                      required
                      minLength={3}
                    />
                  </label>
                  <button
                    className="rounded-md border border-destructive px-3 py-2 text-sm text-destructive disabled:opacity-50"
                    disabled={saving === `status:${organization.id}`}
                  >
                    Suspender acesso
                  </button>
                </form>
              ) : organization.status === 'SUSPENDED' ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-destructive">Suspensa: {organization.suspension_reason}</p>
                  <button
                    className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                    disabled={saving === `status:${organization.id}`}
                    onClick={() => void setOrganizationStatus(organization, 'ACTIVE')}
                  >
                    Reativar organização
                  </button>
                </div>
              ) : null}

              <form className="flex flex-wrap gap-2" onSubmit={(event) => void grantOrganizationAdmin(event, organization.id)}>
                <p className="basis-full text-sm text-muted-foreground">
                  O destinatário receberá um convite por email para concluir o acesso. Contas existentes mantêm sua senha pessoal.
                </p>
                <input
                  className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                  type="email"
                  placeholder="Email do administrador responsável"
                  aria-label={`Email do admin de ${organization.name}`}
                  value={adminEmails[organization.id] ?? setup.admin_email}
                  onChange={(event) => setAdminEmails((current) => ({
                    ...current,
                    [organization.id]: event.target.value,
                  }))}
                  required
                />
                <button className="rounded-md border px-3 py-2 text-sm disabled:opacity-50" disabled={saving === `admin:${organization.id}` || !['DRAFT', 'ACTIVE', 'TRIAL'].includes(organization.status)}>
                  {saving === `admin:${organization.id}` ? 'Enfileirando...' : 'Enviar convite de administrador'}
                </button>
              </form>

              {adminAccessByOrganization[organization.id] && (
                <section className="space-y-2 border-l-2 border-primary pl-4 text-sm" aria-live="polite">
                  <p>{adminAccessByOrganization[organization.id].message}</p>
                  <p className="text-xs text-muted-foreground">Envio enfileirado. A entrega depende da disponibilidade do provedor.</p>
                </section>
              )}

              <section className="space-y-3 border-t pt-4">
                <div>
                  <h3 className="font-medium">Importar membros por email</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Envie até 500 emails em TXT ou CSV, um por linha ou na primeira coluna. Não há envio de emails nesta etapa: entregue as senhas abaixo por um canal seguro. Contas existentes mantêm a senha atual.
                  </p>
                </div>
                <form className="flex flex-wrap items-center gap-2" onSubmit={(event) => void importMembers(event, organization.id)}>
                  <input
                    type="file"
                    accept=".txt,.csv,text/plain,text/csv"
                    aria-label={`Arquivo de emails dos membros de ${organization.name}`}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      if (!file) return;
                      setMemberImportFile((current) => ({ ...current, [organization.id]: '' }));
                      setMemberImportFileName((current) => ({ ...current, [organization.id]: '' }));
                      if (file.size > 100 * 1024) {
                        setError('O arquivo de membros deve ter no máximo 100 KiB.');
                        return;
                      }
                      try {
                        const contents = await file.text();
                        setMemberImportFile((current) => ({ ...current, [organization.id]: contents }));
                        setMemberImportFileName((current) => ({ ...current, [organization.id]: file.name }));
                      } catch {
                        setError('Não foi possível ler o arquivo de membros.');
                      }
                    }}
                  />
                  <Button type="submit" size="sm" variant="outline" disabled={Boolean(saving) || !memberImportFile[organization.id]}>
                    {saving === `import:${organization.id}` ? 'Importando...' : 'Importar lista'}
                  </Button>
                  <a
                    className="text-xs text-primary underline"
                    href="data:text/csv;charset=utf-8,email%0A"
                    download="ayni-membros-template.csv"
                  >Baixar modelo CSV</a>
                  {memberImportFile[organization.id] && (
                    <p className="basis-full text-xs text-muted-foreground">
                      Arquivo pronto para importação: {memberImportFileName[organization.id]}
                    </p>
                  )}
                </form>
                {memberImportResults[organization.id]?.length ? (
                  <DataTable rows={memberImportResults[organization.id]} label="resultados de importação" resetKey={organization.id}
                    rowKey={result => `${result.email}-${result.member_id ?? result.error}`} search={result => `${result.email} ${result.error ?? ''}`}
                    columns={[
                      { key: 'email', header: 'Email', cell: result => result.email },
                      { key: 'access', header: 'Convite', cell: result => result.error ? result.error : <div className="flex flex-wrap items-center gap-2">
                        <span>Enfileirado</span><Button type="button" size="sm" variant="outline" disabled={Boolean(saving)}
                          onClick={() => void reissueMemberAccess(organization.id, result.email)}>Reenviar convite</Button>
                      </div> },
                    ]} />
                ) : null}
              </section>

              <HierarchyTemplates organizationId={organization.id} />

              <form
                className="flex flex-wrap items-end gap-2 rounded-md bg-muted/40 p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void startSupport(organization);
                }}
              >
                <label className="grid min-w-60 flex-1 gap-1 text-sm">
                  <span>Motivo do acesso de suporte (sessão máxima de 45 minutos)</span>
                  <input
                    className="rounded-md border bg-background px-3 py-2"
                    value={supportReasons[organization.id] ?? ''}
                    onChange={(event) => setSupportReasons((current) => ({
                      ...current,
                      [organization.id]: event.target.value,
                    }))}
                    minLength={10}
                    maxLength={1000}
                    required
                  />
                </label>
                <button
                  className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                  type="submit"
                  disabled={saving === `support:${organization.id}`}
                >
                  {saving === `support:${organization.id}` ? 'Iniciando...' : 'Acessar admin para suporte'}
                </button>
              </form>
              <Button type="button" variant="outline" disabled={Boolean(saving)}
                onClick={() => void startSupport(organization, '/admin/hierarquia')}>
                Gerenciar hierarquia, cargos e mandatos como suporte
              </Button>
              <p className="text-xs text-muted-foreground">
                Informe o motivo de suporte acima. A sessão é temporária e auditada; não é necessário cadastrar o superAdmin como membro.
              </p>

              <details>
                <summary className="cursor-pointer text-sm font-medium" onClick={() => {
                  if (!auditByOrganization[organization.id]) void loadAudit(organization.id);
                }}>
                  Histórico de alterações
                </summary>
                {saving === `audit:${organization.id}` ? (
                  <p className="mt-2 text-sm">Carregando histórico...</p>
                ) : (
                  <div className="mt-3"><DataTable rows={auditByOrganization[organization.id] ?? []} label="histórico de alterações" resetKey={organization.id}
                    search={entry => `${entry.action} ${entry.actor_email ?? ''} ${entry.actor_name ?? ''} ${entry.actor_account_id ?? entry.actor_id ?? ''} ${entry.after_state?.route ?? ''} ${entry.after_state?.reason ?? ''}`}
                    columns={[
                      { key: 'date', header: 'Data', cell: entry => new Date(entry.created_at).toLocaleString('pt-BR') },
                      { key: 'action', header: 'Ação', cell: entry => entry.action },
                      { key: 'actor', header: 'Responsável', cell: entry => `${entry.actor_type ?? 'Responsável'}: ${entry.actor_email ?? entry.actor_name ?? 'não identificado'}` },
                      { key: 'id', header: 'ID do responsável', cell: entry => entry.actor_account_id ?? entry.actor_id ?? 'não disponível' },
                      { key: 'route', header: 'Rota', cell: entry => typeof entry.after_state?.route === 'string' ? entry.after_state.route : '' },
                      { key: 'reason', header: 'Motivo', cell: entry => typeof entry.after_state?.reason === 'string' ? entry.after_state.reason : '' },
                    ]} /></div>
                )}
              </details>
            </article>
          );
        })}
      </section>}
        </>
      )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
