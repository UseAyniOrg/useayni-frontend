import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import type { ExternalRegistrationField } from '@/services/miscellaneousService';
import { useAuthContext } from '@/contexts/AuthContext';
import { CalendarDays, CheckCircle2, ArrowRight, Expand, Users, MapPin, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaLightbox } from '@/components/media/MediaLightbox';
import { OrganizationFooter, OrganizationHeader } from '@/components/organization/OrganizationPublicChrome';
import type { ExternalProfileType } from '@/services/externalProfileService';
import { useTenant } from '@/contexts/TenantContext';
import { orgHomeService, type OrgHomePublicData } from '@/services/orgHomeService';
import NotFoundPage from '@/pages/not-found';
import { RegistrationProfileFields, RegistrationDataFields, selectedProfileData } from '@/components/auth/RegistrationProfileFields';
import { EventParticipantAttendance } from '@/components/miscellaneous/EventParticipantAttendance';
import { formatCPF, validateCPF } from '@/utils/cpf';
import { validatePassword } from '@/utils/password';
import { EventRegistrationAnswers } from '@/components/miscellaneous/EventRegistrationAnswers';

interface PublicEvent {
  id: string;
  organization_id: string;
  organization_name: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  registration_start_date: string | null;
  registration_end_date: string | null;
  registration_fields: ExternalRegistrationField[];
  external_profile_types: ExternalProfileType[];
  max_participants?: number | null;
  remaining_places: number | null;
  registration_state: 'open' | 'not_open' | 'closed' | 'full';
  location?: string;
  media?: {
    cover_url: string | null;
    banner_url: string | null;
    map_url: string | null;
    sponsor_urls: string[];
  } | null;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const message = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(', ');
  }
  return 'Não foi possível concluir a inscrição.';
}

export default function ExternalEventRegistrationPage() {
  const { slug = '' } = useParams();
  const { tenant } = useTenant();
  const { user } = useAuthContext();
  const personalSession = user?.access_context === 'member' && !user.password_change_required;
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationProfileKey, setOrganizationProfileKey] = useState('');
  const [profileData, setProfileData] = useState<Record<string, unknown>>({});
  const [registrationData, setRegistrationData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [mode, setMode] = useState<'choose' | 'external'>('choose');
  const [membership, setMembership] = useState<'internal' | 'external' | null>(null);
  const [membershipStatus, setMembershipStatus] = useState('');
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [organizationHome, setOrganizationHome] = useState<OrgHomePublicData | null>(null);
  const returnTo = `/eventos/${encodeURIComponent(slug)}`;
  const returnQuery = `?returnTo=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    let active = true;
    setOrganizationHome(null);
    if (!tenant?.slug) return () => { active = false; };
    orgHomeService.getPublic(tenant.slug)
      .then((data) => { if (active) setOrganizationHome(data); })
      .catch(() => { if (active) setOrganizationHome(null); });
    return () => { active = false; };
  }, [tenant?.slug]);

  useEffect(() => {
    if (!personalSession || !user) return;
    let active = true;
    setName(user.name);
    setEmail(user.email);
    setSessionLoading(true);
    setSessionError('');
    api.get<{ registered: boolean; membership: 'internal' | 'external' | null; registration_status?: string; name?: string; phone?: string; cpf?: string;
      organization_profile_key?: string; profile_data?: Record<string, unknown> }>(
      `/public/events/${encodeURIComponent(slug)}/my-registration`,
    ).then(({ data }) => {
      if (!active) return;
      setSuccess(data.registered);
      setMembership(data.membership);
      setMembershipStatus(data.registration_status ?? '');
      if (data.name) setName(data.name);
      if (data.phone) setPhone(data.phone);
      if (data.cpf) setCpf(formatCPF(data.cpf));
      if (data.organization_profile_key) setOrganizationProfileKey(data.organization_profile_key);
      setProfileData(data.profile_data ?? {});
    }).catch((cause: unknown) => { if (active) setSessionError(getErrorMessage(cause)); })
      .finally(() => { if (active) setSessionLoading(false); });
    return () => { active = false; };
  }, [slug, user?.id, personalSession]);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setSuccess(false);
    setError('');
    setAcceptedPrivacy(false);
    setRegistrationData({});
    setProfileData({});
    api.get<PublicEvent>(`/public/events/${encodeURIComponent(slug)}/registration`)
      .then((response) => {
        if (isCurrent) {
          setEvent(response.data);
          setOrganizationProfileKey(current => current || response.data.external_profile_types?.[0]?.key || '');
        }
      })
      .catch((cause: unknown) => {
        if (isCurrent) setError(getErrorMessage(cause));
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [slug]);

  const submit = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    setError('');
    if (!personalSession && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!personalSession) {
      const validation = validatePassword(password);
      if (!validation.isValid || password.length < 8) {
        setError(validation.isValid ? 'A senha deve ter pelo menos 8 caracteres.' : validation.message);
        return;
      }
    }
    if (cpf && !validateCPF(cpf)) { setError('Informe um CPF válido.'); return; }
    setSaving(true);
    try {
      await api.post(`/public/events/${encodeURIComponent(slug)}/register`, {
        name,
        email,
        phone: phone || undefined,
        cpf: cpf.replace(/\D/g, '') || undefined,
        ...(personalSession ? {} : { password }),
        ...(membership !== 'internal' ? {
          organization_profile_key: organizationProfileKey,
          profile_data: selectedProfileData(event?.external_profile_types ?? [], organizationProfileKey, profileData),
        } : {}),
        registration_data: registrationData,
        accepted_privacy: acceptedPrivacy,
      });
      setSuccess(true);
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="mx-auto max-w-2xl p-8">Carregando evento...</main>;
  if (!event) {
    return tenant
      ? <NotFoundPage title="Evento indisponível" message={error || 'Este evento não existe ou não está mais disponível.'} />
      : <NotFoundPage />;
  }

  const eventDate = new Date(event.start_date);
  const organizationSections = organizationHome?.sections ?? [];
  const organizationTheme = organizationHome?.config.theme;
  const primaryColor = organizationTheme?.primary_color || tenant?.theme.primary_color || '#0e79b2';
  const menuItems = [
    { label: 'Institucional', type: 'CAMINHOS' },
    { label: 'Agenda', type: 'AGENDA' },
    { label: 'Notícias', type: 'NOTICIAS' },
    { label: 'Parceiros', type: 'PARCEIROS' },
    { label: 'Contato', type: 'CONTATO' },
  ].filter((item) => organizationSections.some((section) => section.type === item.type));

  return (
    <>
    <OrganizationHeader
      organizationName={event.organization_name}
      logoUrl={organizationTheme?.logo_url || tenant?.theme.logo_url}
      sections={organizationSections}
      menuItems={menuItems}
      primaryColor={primaryColor}
      homePath="/"
    />
    <main className="min-h-screen bg-muted/20 pb-16">
      <header className="relative overflow-hidden bg-slate-950 text-white">
        {(event.media?.banner_url || event.media?.cover_url) && (
          <img src={event.media.banner_url ?? event.media.cover_url ?? ''} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        {(event.media?.banner_url || event.media?.cover_url) && (
          <MediaLightbox
            src={event.media.banner_url ?? event.media.cover_url ?? ''}
            alt={`Imagem de apresentação de ${event.title}`}
            triggerClassName="absolute right-4 top-4 z-10 rounded-md border border-white/20 bg-black/50 p-2 text-white transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Expand className="h-5 w-5" />
          </MediaLightbox>
        )}
        <div className="relative mx-auto max-w-6xl space-y-6 px-6 py-16 sm:py-24">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/80">Início <span>· {event.organization_name}</span></Link>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">{event.title}</h1>
          <div className="flex flex-wrap gap-6 text-sm text-white/90">
            <p className="flex items-center gap-2"><CalendarDays className="h-5 w-5" />{eventDate.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</p>
            {event.max_participants != null && <p className="flex items-center gap-2"><Users className="h-5 w-5" />{event.max_participants} vagas</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="#inscricao" className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 font-semibold text-slate-950">{success ? 'Minha participação' : 'Quero participar'} <ArrowRight className="h-4 w-4" /></a>
            <Button type="button" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => {
              void navigator.clipboard.writeText(window.location.href).then(() => setShareMessage('Link copiado!')).catch(() => setShareMessage('Não foi possível copiar. Copie o endereço do navegador.'));
            }}><Share2 className="mr-2 h-4 w-4" />Compartilhar</Button>
            {shareMessage && <p role="status" className="self-center text-sm">{shareMessage}</p>}
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-6 pt-10 lg:grid-cols-[1fr_420px]">
      <section className="space-y-8">
        {event.media?.cover_url && event.media.cover_url !== event.media.banner_url && (
          <MediaLightbox
            src={event.media.cover_url}
            alt={`Apresentação de ${event.title}`}
            triggerClassName="block w-full cursor-zoom-in rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <img src={event.media.cover_url} alt={`Apresentação de ${event.title}`} className="max-h-96 w-full rounded-2xl object-cover" />
          </MediaLightbox>
        )}
        <div className="space-y-4"><h2 className="text-2xl font-semibold">Sobre o evento</h2>
        <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{event.description}</p></div>
        {event.location && <div className="flex items-start gap-3 rounded-xl border bg-background p-5"><MapPin className="h-5 w-5 shrink-0 text-primary" /><div><h2 className="font-semibold">Local do encontro</h2><p className="text-sm text-muted-foreground">{event.location}</p></div></div>}
        {event.media?.map_url && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><MapPin className="h-5 w-5" />Mapa do local</h2>
            <MediaLightbox
              src={event.media.map_url}
              alt={`Mapa do local de ${event.title}`}
              triggerClassName="block w-full cursor-zoom-in rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <img src={event.media.map_url} alt={`Mapa do local de ${event.title}`} className="h-auto w-full rounded-xl border bg-background object-contain" />
            </MediaLightbox>
          </section>
        )}
        {event.media?.sponsor_urls.length ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Patrocinadores</h2>
            <div className="flex flex-wrap items-center gap-4">
              {event.media.sponsor_urls.map((url, index) => (
                <MediaLightbox
                  key={`${url}-${index}`}
                  src={url}
                  alt={`Patrocinador ${index + 1} do evento`}
                  triggerClassName="cursor-zoom-in rounded outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <img src={url} alt={`Patrocinador ${index + 1} do evento`} className="max-h-20 max-w-48 object-contain" />
                </MediaLightbox>
              ))}
            </div>
          </section>
        ) : null}
      </section>

      <section id="inscricao" className="h-fit scroll-mt-6 space-y-4 rounded-2xl border bg-background p-6 shadow-sm lg:sticky lg:top-6">
        {success ? <>
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          <h2 className="text-2xl font-semibold">Inscrição confirmada</h2>
          <p className="text-sm text-muted-foreground">Sua participação está garantida. Você pode continuar consultando esta página, o mapa e as informações do evento.</p>
          {personalSession ? <>
            <EventRegistrationAnswers eventId={event.id} />
            <EventParticipantAttendance slug={slug} />
            <Link className="block text-sm text-primary underline" to="/minhas-inscricoes">Ver meus eventos</Link>
          </> : <>
            <p className="text-sm">Use seu email e senha para acessar sua participação e apresentar o código de presença à equipe. A mesma conta pode ser usada em outros eventos.</p>
            <Link className="inline-flex rounded-md bg-primary px-4 py-3 text-primary-foreground" to={`/login${returnQuery}`}>Entrar e acessar minha participação</Link>
          </>}
        </> : <>
        <h2 className="text-xl font-semibold">Garanta sua participação</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {event.registration_end_date ? `Inscrições até ${new Date(event.registration_end_date).toLocaleString('pt-BR')}. ` : ''}
          Membros da organização e comunidade externa são bem-vindos.
        </p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {sessionError && <p role="alert" className="text-sm text-destructive">{sessionError}</p>}
        {event.registration_state !== 'open' && <p role="status" className="rounded-lg bg-muted p-4 text-sm font-medium">
          {event.registration_state === 'full' ? 'As vagas foram preenchidas.' : event.registration_state === 'closed' ? 'As inscrições foram encerradas.' : 'As inscrições ainda não começaram.'}
        </p>}
        {event.registration_state === 'open' && event.remaining_places !== null && <p className="text-sm text-muted-foreground">{event.remaining_places} vaga(s) disponível(is). A disponibilidade é confirmada ao enviar a inscrição.</p>}
        {sessionLoading ? <p>Verificando sua inscrição...</p> : personalSession ? (
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">Olá, {user.name}!</p>
            <p>{membership === 'internal' ? 'Seu vínculo interno será utilizado, sem criar uma conta externa.' : 'Você está conectado. Não será necessário criar outra conta nem informar sua senha.'}</p>
            {membershipStatus && membershipStatus !== 'approved' && <p className="mt-2 text-destructive">Seu vínculo aguarda aprovação da organização. Após a aprovação, retorne para concluir a inscrição.</p>}
          </div>
        ) : mode === 'choose' ? (
          <div className="grid gap-3">
            <Link className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground" to={`/login${returnQuery}`}>Já tenho conta — entrar e participar</Link>
            <Button type="button" variant="outline" onClick={() => setMode('external')}>Sou da comunidade — cadastrar e participar</Button>
            <Link className="rounded-lg border px-4 py-3 text-center text-sm" to={`/cadastro${returnQuery}`}>Quero me cadastrar como membro da organização</Link>
            <p className="text-xs text-muted-foreground">O cadastro interno segue as regras de aprovação da organização. A inscrição externa não concede acesso administrativo.</p>
          </div>
        ) : <Button type="button" variant="ghost" onClick={() => setMode('choose')}>Voltar às opções de acesso</Button>}
        {event.registration_state === 'open' && !sessionLoading && !sessionError && (personalSession || mode === 'external') &&
          (!membershipStatus || membershipStatus === 'approved') && (
        <form className="mt-5 space-y-4" onSubmit={(e) => void submit(e)}>
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span>Nome completo</span>
              <input className="rounded-md border bg-background px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required maxLength={255} />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Email de login</span>
              <input className="rounded-md border bg-background px-3 py-2" type="email" value={email} readOnly={personalSession} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
            </label>
            <label className="grid gap-1 text-sm">
              <span>CPF (opcional)</span>
              <input className="rounded-md border bg-background px-3 py-2" inputMode="numeric" autoComplete="off" maxLength={14} value={cpf} onChange={change => setCpf(formatCPF(change.target.value))} />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Telefone (opcional)</span>
              <input className="rounded-md border bg-background px-3 py-2" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
            </label>
          </div>
          {membership !== 'internal' && (
            <RegistrationProfileFields profiles={event.external_profile_types ?? []} selected={organizationProfileKey}
              onSelect={setOrganizationProfileKey} values={profileData} onChange={setProfileData} />
          )}
          <label className="flex items-start gap-2 text-sm">
            <input
              className="mt-1"
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(event) => setAcceptedPrivacy(event.target.checked)}
              required
            />
            <span>
              Autorizo o compartilhamento dos dados deste perfil com
              <strong> {event.organization_name}</strong> para minha inscrição.
              {membership !== 'internal' && ' Os dados do perfil ficam na minha conta UseAyni para reaproveitamento, mediante minha confirmação, em outras organizações.'}
              {' '}As respostas específicas do evento são usadas somente nesta inscrição.
            </span>
          </label>

          {(event.registration_fields ?? []).length > 0 && (
            <fieldset className="space-y-3 rounded-md border p-4">
              <legend className="px-1 font-medium">Dados específicos deste evento</legend>
              <RegistrationDataFields fields={event.registration_fields ?? []} values={registrationData} onChange={setRegistrationData} />
            </fieldset>
          )}

          {!personalSession && <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span>Senha (mínimo 8 caracteres)</span>
              <input className="rounded-md border bg-background px-3 py-2" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={72} required />
              <span className="text-xs text-muted-foreground">Use letras maiúsculas e minúsculas, número e caractere especial.</span>
            </label>
            <label className="grid gap-1 text-sm">
              <span>Confirme a senha</span>
              <input className="rounded-md border bg-background px-3 py-2" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} maxLength={72} required />
            </label>
          </div>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" disabled={saving}>
            {saving ? 'Enviando inscrição...' : personalSession ? 'Confirmar minha inscrição' : 'Criar conta e inscrever-se'}
          </button>
        </form>)}
        </>}
      </section>
      </div>
    </main>
    <OrganizationFooter
      organizationName={event.organization_name}
      contact={organizationHome?.config.contact ?? {}}
      socialLinks={organizationHome?.config.social_links ?? {}}
      sections={organizationSections}
      homePath="/"
    />
    </>
  );
}
