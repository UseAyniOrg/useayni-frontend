import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TypeBadge, StatusBadge, VisibilityBadge } from '@/components/miscellaneous/StatusBadge';
import { OverviewTab } from '@/components/miscellaneous/detail-tabs/OverviewTab';
import { PeopleTab } from '@/components/miscellaneous/detail-tabs/PeopleTab';
import { ChildrenTab } from '@/components/miscellaneous/detail-tabs/ChildrenTab';
import { RequestsTab } from '@/components/miscellaneous/detail-tabs/RequestsTab';
import { InvitesWaitlistTab } from '@/components/miscellaneous/detail-tabs/InvitesWaitlistTab';
import { AttendanceTab } from '@/components/miscellaneous/detail-tabs/AttendanceTab';
import { miscellaneousRoute, miscellaneousService } from '@/services/miscellaneousService';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { useAuthContext } from '@/contexts/AuthContext';
import { ExternalRegistrationsTab } from '@/components/miscellaneous/detail-tabs/ExternalRegistrationsTab';
import { Pencil, Archive, Trash2, ChevronRight } from 'lucide-react';
import type { Miscellaneous } from '@/services/miscellaneousService';
import { withTenantQuery } from '@/lib/auth/accessContext';
import { EventRegistrationAnswers } from '@/components/miscellaneous/EventRegistrationAnswers';

const ATTENDANCE_TYPES = ['event', 'meeting', 'activity'];

export default function MiscellaneousDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rolesAndPermissions, isLoading: rolesLoading } = useRolesAndPermissions();
  const { member } = useCurrentMember();
  const { user } = useAuthContext();
  const managesOrganization = Boolean(user?.support_session_id) || Boolean(
    user?.roles.some((role) => ['organization.admin', 'organization.manage'].includes(role)),
  );

  const [misc, setMisc] = useState<Miscellaneous | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (!id) return;
    miscellaneousService.getById(id)
      .then(setMisc)
      .catch(() => setError('Não foi possível carregar esta miscelânea. Verifique seu acesso e tente novamente.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setIsOwner(managesOrganization);
    if (!id || !member?.id) return;
    miscellaneousService.getPeople(id).then((data) => {
      const owns = managesOrganization ||
        data.owners?.some((o: { member: { id: string } }) => o.member.id === member.id);
      const participates = data.members?.some((m: { member: { id: string } }) => m.member.id === member.id);
      setIsOwner(owns ?? false);
      setIsParticipant(participates ?? false);
    }).catch(() => setError('Não foi possível consultar os participantes desta miscelânea.'));
  }, [id, member?.id, managesOrganization]);

  const handleJoin = async () => {
    if (!id) return;
    if (misc?.participation_type === 'private') {
      setShowRequestModal(true);
      return;
    }
    setActionLoading(true);
    try {
      await miscellaneousService.joinMiscellaneous(id);
      setIsParticipant(true);
    } catch {
      setError('Não foi possível confirmar sua participação. Verifique as condições de inscrição.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!id || !requestTitle.trim()) return;
    setActionLoading(true);
    try {
      await miscellaneousService.createRequest(id, { title: requestTitle, message: requestMessage });
      setRequestSent(true);
      setShowRequestModal(false);
    } catch {
      setError('Não foi possível enviar a solicitação de participação. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await miscellaneousService.archive(id);
      setConfirmArchive(false);
      navigate(miscellaneousRoute());
    } catch {
      setError('Não foi possível arquivar esta miscelânea. Verifique seu acesso e tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await miscellaneousService.remove(id);
      setConfirmDelete(false);
      navigate(miscellaneousRoute());
    } catch {
      setError('Não foi possível excluir esta miscelânea. Verifique seu acesso e tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublicAccess = async () => {
    if (!id || !misc) return;
    setActionLoading(true);
    setError('');
    try {
      if (misc.public_access_enabled) {
        await miscellaneousService.disablePublicAccess(id);
        setMisc({ ...misc, public_access_enabled: false });
      } else {
        const result = await miscellaneousService.enablePublicAccess(id);
        setMisc({ ...misc, public_access_enabled: true, public_slug: result.slug });
      }
    } catch {
      setError('Não foi possível alterar a publicação do evento. Verifique seu acesso e tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={rolesLoading} />
        <SidebarInset>
          <AppHeader title="Carregando…" />
          <main className="p-6 text-muted-foreground text-sm">Carregando…</main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!misc) {
    return (
      <SidebarProvider>
        <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={rolesLoading} />
        <SidebarInset>
          <AppHeader title="Não encontrado" />
          <main className="p-6"><p role="alert" className="text-destructive text-sm">{error || 'Miscelânea não encontrada.'}</p></main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={rolesLoading} />
      <SidebarInset>
        <AppHeader title={misc.title} />
        <main className="flex-1 overflow-auto p-4 space-y-4">
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {/* Breadcrumb */}
          {misc.parent_id && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <button className="hover:text-foreground" onClick={() => navigate(miscellaneousRoute(`/${misc.parent_id}`))}>Pai</button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{misc.title}</span>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                <TypeBadge type={misc.type} />
                <StatusBadge status={misc.status} />
                <VisibilityBadge visibility={misc.visibility ?? 'public'} />
              </div>
              <h1 className="text-xl font-bold">{misc.title}</h1>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                {misc.type === 'form' && (
                  <Button variant="outline" size="sm" onClick={() => navigate(miscellaneousRoute(`/${id}/formulario`))}>
                    Builder de formulário
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => navigate(miscellaneousRoute(`/${id}/editar`))}>
                  <Pencil className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmArchive(true)}>
                  <Archive className="h-4 w-4 mr-1" /> Arquivar
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </div>
            )}
            {!isOwner && !isParticipant && !requestSent && misc.status === 'active' && (
              <Button size="sm" disabled={actionLoading} onClick={handleJoin}>
                {misc.participation_type === 'private' ? 'Solicitar participação' : 'Participar'}
              </Button>
            )}
            {!isOwner && !isParticipant && requestSent && (
              <span className="rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-medium">Solicitação enviada</span>
            )}
            {!isOwner && isParticipant && (
              <span className="rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-medium">Participando</span>
            )}
          </div>

          {misc.type === 'event' && isOwner && (
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/30 p-5">
              <div className="space-y-1">
                <h2 className="font-semibold">Página de divulgação e inscrição</h2>
                <p className="max-w-xl text-sm text-muted-foreground">
                  {misc.public_access_enabled
                    ? 'A página pública está habilitada. Compartilhe o link com membros e comunidade externa.'
                    : 'Publique uma página visual do evento para receber inscrições de membros e da comunidade externa.'}
                  {misc.status !== 'active' && ' O evento precisa estar ativo para ficar disponível ao público.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {misc.public_access_enabled && misc.public_slug && misc.status === 'active' && <Button asChild variant="outline">
                  <a target="_blank" rel="noreferrer" href={withTenantQuery(`/eventos/${misc.public_slug}`)}>Ver página e compartilhar</a>
                </Button>}
                <Button disabled={actionLoading || (!misc.public_access_enabled && misc.status !== 'active')} variant={misc.public_access_enabled ? 'outline' : 'default'} onClick={() => void handlePublicAccess()}>
                  {actionLoading ? 'Atualizando...' : misc.public_access_enabled ? 'Ocultar página pública' : 'Publicar inscrições'}
                </Button>
              </div>
            </section>
          )}
          {misc.type === 'event' && isParticipant && <EventRegistrationAnswers eventId={misc.id} />}
          {/* Tabs */}
          <Tabs defaultValue="overview">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="overview">Visão geral</TabsTrigger>
              <TabsTrigger value="people">Pessoas</TabsTrigger>
              <TabsTrigger value="children">Filhos</TabsTrigger>
              {isOwner && <TabsTrigger value="requests">Solicitações</TabsTrigger>}
              {isOwner && <TabsTrigger value="invites">Convites & Fila</TabsTrigger>}
              {isOwner && misc.type === 'event' && <TabsTrigger value="external">Inscrições públicas</TabsTrigger>}
              {ATTENDANCE_TYPES.includes(misc.type) && <TabsTrigger value="attendance">Presença</TabsTrigger>}
              {misc.type === 'form' && <TabsTrigger value="form">Formulário</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <OverviewTab misc={misc} />
            </TabsContent>
            <TabsContent value="people" className="mt-4">
              <PeopleTab miscId={misc.id} isOwner={isOwner} currentUserId={member?.id ?? ''} />
            </TabsContent>
            <TabsContent value="children" className="mt-4">
              <ChildrenTab miscId={misc.id} />
            </TabsContent>
            {isOwner && (
              <TabsContent value="requests" className="mt-4">
                <RequestsTab miscId={misc.id} isOwner={isOwner} />
              </TabsContent>
            )}
            {isOwner && (
              <TabsContent value="invites" className="mt-4">
                <InvitesWaitlistTab miscId={misc.id} isOwner={isOwner} waitlistEnabled={misc.waitlist_enabled} />
              </TabsContent>
            )}
            {isOwner && misc.type === 'event' && (
              <TabsContent value="external" className="mt-4">
                <ExternalRegistrationsTab miscId={misc.id} />
              </TabsContent>
            )}
            {ATTENDANCE_TYPES.includes(misc.type) && (
              <TabsContent value="attendance" className="mt-4">
                <AttendanceTab
                  miscId={misc.id}
                  miscType={misc.type}
                  isOwner={isOwner}
                  currentUserId={member?.id ?? ''}
                />
              </TabsContent>
            )}
            {misc.type === 'form' && (
              <TabsContent value="form" className="mt-4">
                <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                  O builder de perguntas pode ser aberto pelo botão acima. O formulário fica vinculado a esta misselânea e pode ser respondido quando publicado.
                </div>
              </TabsContent>
            )}
          </Tabs>
        </main>

        {/* Request modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl border p-6 w-full max-w-sm space-y-4">
              <h3 className="font-semibold">Solicitar participação</h3>
              <p className="text-sm text-muted-foreground">Esta miscelânea é privada. Envie uma solicitação ao responsável.</p>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Título da solicitação *"
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
              />
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                placeholder="Mensagem (opcional)"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowRequestModal(false)}>Cancelar</Button>
                <Button onClick={handleSendRequest} disabled={actionLoading || !requestTitle.trim()}>Enviar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Archive confirm */}
        {confirmArchive && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl border p-6 w-full max-w-sm space-y-4">
              <h3 className="font-semibold">Arquivar miscelânea?</h3>
              <p className="text-sm text-muted-foreground">Esta miscelânea deixará de aparecer nas listagens ativas. Todos os membros serão notificados.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setConfirmArchive(false)}>Cancelar</Button>
                <Button onClick={handleArchive} disabled={actionLoading}>Confirmar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl border p-6 w-full max-w-sm space-y-4">
              <h3 className="font-semibold text-destructive">Excluir miscelânea?</h3>
              <p className="text-sm text-muted-foreground">Esta ação é irreversível. Miscelâneas filhas ficarão órfãs e os membros serão notificados.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>Excluir</Button>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
