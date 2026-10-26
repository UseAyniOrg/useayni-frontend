import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicHomePage from "@/pages/public-home";
import Credentials from "../pages/credencials/credencials.tsx";
import Home from "../pages/home/home.tsx";
import { ProtectedRoute } from "../components/ProtectedRoute.tsx";
import MemberProfile from "@/pages/member-profile/member-profile.tsx";
import MiscellaneousListPage from "@/pages/miscellaneous/list.tsx";
import MiscellaneousCreatePage from "@/pages/miscellaneous/create.tsx";
import MiscellaneousDetailPage from "@/pages/miscellaneous/detail.tsx";
import MiscellaneousEditPage from "@/pages/miscellaneous/edit.tsx";
import MiscellaneousFormBuilderPage from "@/pages/miscellaneous/form-builder.tsx";
import ApprovalsPage from "@/pages/approvals/list.tsx";
import MembersManagementPage from "@/pages/members/management.tsx";
import AdminMembersPage from "@/pages/admin/members.tsx";
import HierarchyPage from "@/pages/admin/hierarchy.tsx";
import PlatformAdminHome from "@/pages/admin/platform-home.tsx";
import OrganizationLanding from "@/pages/organization-landing.tsx";
import ExternalEventRegistrationPage from "@/pages/external-event-registration.tsx";
import MyEventsPage from "@/pages/my-events.tsx";
import OrgHomeEditorPage from "@/pages/admin/organization-home-editor.tsx";
import FeatureComingSoon from "@/pages/feature-coming-soon.tsx";
import RegistrationFieldsPage from "@/pages/admin/registration-fields.tsx";
import TemporaryPasswordPage from "@/components/auth/temporary-password.tsx";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { resolveTenantSlug } from '@/lib/auth/accessContext';
import SessionBoundary from '@/components/auth/SessionBoundary';
import ExternalProfileTypesPage from '@/pages/admin/external-profile-types';
import NotFoundPage from '@/pages/not-found';
import LegalDocumentPage from '@/pages/legal-document';
import TenantSelectionPage from '@/pages/tenant-selection';
import EmailActionPage from '@/pages/email-action';

const isPlatformHost = !resolveTenantSlug();
const localTenantSlug = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? window.location.pathname.match(/^\/o\/([a-z0-9-]+)(?:\/|$)/i)?.[1]
  : undefined;
const routerBasename = localTenantSlug ? `/o/${localTenantSlug}` : undefined;
const adminRoles = isPlatformHost
  ? ['EQUIPE_TECNICA']
  : ['organization.admin', 'organization.manage', 'EQUIPE_TECNICA'];

function AdminDashboardRoute() {
  const { user } = useAuthContext();
  const { isLoading, isFeatureEnabled } = useTenant();
  if (isLoading) return <div>Carregando...</div>;
  const isPlatformAdmin = user?.roles.includes('EQUIPE_TECNICA') && !user.support_session_id;
  const organizationAdmin = <Navigate to={user?.support_session_id || isFeatureEnabled('miscellaneous_full') ? '/admin/miscelaneas' : '/admin/gestao-membros'} replace />;
  return user?.support_session_id
    ? organizationAdmin
    : isPlatformHost || isPlatformAdmin
    ? <PlatformAdminHome />
    : organizationAdmin;
}

export const router = createBrowserRouter([{ element: <SessionBoundary />, children: [
  {
    path: "/",
    element: isPlatformHost ? <PublicHomePage /> : <OrganizationLanding />,
  },
  {
    path: "/o/:slug",
    element: <OrganizationLanding />,
  },
  {
    path: "/o/:slug/parceiros",
    element: <FeatureComingSoon featureSlug="sponsors" />,
  },
  {
    path: "/o/:slug/talentos",
    element: <FeatureComingSoon featureSlug="talent_network" />,
  },
  {
    path: "/parceiros",
    element: <FeatureComingSoon featureSlug="sponsors" />,
  },
  {
    path: "/talentos",
    element: <FeatureComingSoon featureSlug="talent_network" />,
  },
  {
    path: "/login",
    element: <Credentials />,
  },
  { path: '/email/convite', element: <EmailActionPage kind="invitation" /> },
  { path: '/email/redefinir-senha', element: <EmailActionPage kind="reset" /> },
  {
    path: "/selecionar-organizacao",
    element: <ProtectedRoute requireTenant={false}><TenantSelectionPage /></ProtectedRoute>,
  },
  {
    path: "/admin/login",
    element: <Credentials />,
  },
  {
    path: "/cadastro",
    element: <Credentials />,
  },
  {
    path: "/recuperar-senha",
    element: <Credentials />
  },
  {
    path: "/politica-de-privacidade",
    element: <LegalDocumentPage kind="privacy" />,
  },
  {
    path: "/termos-de-uso",
    element: <LegalDocumentPage kind="terms" />,
  },
  {
    path: "/definir-senha",
    element: (
      <ProtectedRoute requireTenant={false}>
        <TemporaryPasswordPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/eventos/:slug",
    element: <ExternalEventRegistrationPage />,
  },
  {
    path: "/perfil-externo",
    element: (
      <ProtectedRoute>
        <Navigate to="/minhas-inscricoes" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/minhas-inscricoes",
    element: <ProtectedRoute><MyEventsPage /></ProtectedRoute>,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/membros/:memberSlugName",
    element: (
      <ProtectedRoute>
        <MemberProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/miscelaneas",
    element: (
      <ProtectedRoute requiredFeature="miscellaneous_full">
        <MiscellaneousListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/miscelaneas/nova",
    element: (
      <ProtectedRoute requiredFeature="miscellaneous_full">
        <MiscellaneousCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/miscelaneas/:id",
    element: (
      <ProtectedRoute requiredFeature="miscellaneous_full">
        <MiscellaneousDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/miscelaneas/:id/editar",
    element: (
      <ProtectedRoute requiredFeature="miscellaneous_full">
        <MiscellaneousEditPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/miscelaneas/:id/formulario",
    element: (
      <ProtectedRoute requiredFeature="miscellaneous_forms">
        <MiscellaneousFormBuilderPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/miscelaneas",
    element: (
      <ProtectedRoute requiredFeature="miscellaneous_full" requiredRoles={adminRoles}>
        <MiscellaneousListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/miscelaneas/nova",
    element: (
      <ProtectedRoute requiredFeature="miscellaneous_full" requiredRoles={adminRoles}>
        <MiscellaneousCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/miscelaneas/:id/editar",
    element: (
      <ProtectedRoute requiredFeature="miscellaneous_full" requiredRoles={adminRoles}>
        <MiscellaneousEditPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/miscelaneas/:id/formulario",
    element: (
      <ProtectedRoute requiredFeature="miscellaneous_forms" requiredRoles={adminRoles}>
        <MiscellaneousFormBuilderPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/miscelaneas/:id",
    element: (
      <ProtectedRoute requiredFeature="miscellaneous_full" requiredRoles={adminRoles}>
        <MiscellaneousDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/aprovacoes",
    element: (
      <ProtectedRoute requiredFeature="registration_approval">
        <ApprovalsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/gestao-membros",
    element: (
      <ProtectedRoute>
        <MembersManagementPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/gestao-membros",
    element: (
      <ProtectedRoute requiredRoles={adminRoles}>
        <AdminMembersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/aprovacoes",
    element: (
      <ProtectedRoute requiredFeature="registration_approval" requiredRoles={adminRoles}>
        <ApprovalsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRoles={adminRoles}>
        <AdminDashboardRoute />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/organizacoes",
    element: (
      <ProtectedRoute requiredRoles={adminRoles}>
        <AdminDashboardRoute />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/organizacoes/nova",
    element: (
      <ProtectedRoute requiredRoles={adminRoles}>
        {isPlatformHost ? <PlatformAdminHome /> : <Navigate to="/admin/miscelaneas" replace />}
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/organizacoes/:organizationId",
    element: (
      <ProtectedRoute requiredRoles={adminRoles}>
        {isPlatformHost ? <PlatformAdminHome /> : <Navigate to="/admin/miscelaneas" replace />}
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/organizacao/home",
    element: (
      <ProtectedRoute requiredRoles={adminRoles}>
        <OrgHomeEditorPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/perfis-externos",
    element: <ProtectedRoute requiredRoles={adminRoles}><ExternalProfileTypesPage /></ProtectedRoute>,
  },
  {
    path: "/admin/cadastro",
    element: (
      <ProtectedRoute requiredRoles={adminRoles}>
        <RegistrationFieldsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/hierarquia",
    element: (
      <ProtectedRoute requiredFeature="hierarchy" requiredRoles={adminRoles}>
        <HierarchyPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]}], { basename: routerBasename });
