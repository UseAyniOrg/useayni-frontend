import {
  Building2,
  ClipboardCheck,
  GitBranch,
  Home,
  LayoutGrid,
  Globe2,
  ListChecks,
  Settings,
  UserRoundCog,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavUser } from './NavUser';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

interface AppSidebarProps {
  rolesAndPermissions?: unknown;
  isLoading?: boolean;
}

export function AppSidebar(_props: AppSidebarProps) {
  const navigate = useNavigate();
  const { user: authUser } = useAuthContext();
  const { tenant, isFeatureEnabled } = useTenant();
  const { member } = useCurrentMember();

  const roles = authUser?.roles ?? [];
  const canManageMembers = Boolean(authUser?.support_session_id) || roles.some((role) =>
    ['organization.admin', 'members.approve', 'organization.manage'].includes(role),
  );
  const canManageOrganization = Boolean(authUser?.support_session_id) ||
    roles.includes('organization.admin') || roles.includes('organization.manage');
  const hasModule = (slug: string) =>
    Boolean(authUser?.support_session_id) || isFeatureEnabled(slug);

  const user = {
    name: member?.name || authUser?.name || 'Usuário',
    email: member?.email_personal || authUser?.email || '',
    avatar: member?.profile_picture_url || '',
    slug: member?.slug || '',
  };

  const items = [
    { label: 'Tipos de cadastro', path: '/admin/perfis-externos', icon: UserRoundCog, visible: canManageOrganization },
    { label: 'Início', path: canManageOrganization ? '/admin' : '/home', icon: Home, visible: true },
    {
      label: 'Miscelâneas',
      path: canManageOrganization ? '/admin/miscelaneas' : '/miscelaneas',
      icon: LayoutGrid,
      visible: hasModule('miscellaneous_full'),
    },
    {
      label: 'Aprovações',
      path: canManageOrganization ? '/admin/aprovacoes' : '/aprovacoes',
      icon: ClipboardCheck,
      visible: canManageMembers && hasModule('registration_approval'),
    },
    {
      label: 'Membros',
      path: canManageOrganization ? '/admin/gestao-membros' : '/gestao-membros',
      icon: UserRoundCog,
      visible: canManageMembers,
    },
    {
      label: 'Hierarquia',
      path: '/admin/hierarquia',
      icon: GitBranch,
      visible: hasModule('hierarchy') &&
        (canManageOrganization || roles.includes('org_units.manage')),
    },
    {
      label: 'Home pública',
      path: '/admin/organizacao/home',
      icon: Globe2,
      visible: canManageOrganization,
    },
    {
      label: 'Campos de cadastro',
      path: '/admin/cadastro',
      icon: ListChecks,
      visible: canManageOrganization && hasModule('custom_fields'),
    },
    {
      label: 'Administração',
      path: '/admin',
      icon: Settings,
      visible: canManageOrganization,
    },
  ].filter((item) => item.visible);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-3">
          {tenant?.theme.logo_url ? (
            <img src={tenant.theme.logo_url} alt="" className="h-8 w-8 rounded object-contain" />
          ) : (
            <Building2 className="h-8 w-8 shrink-0 rounded bg-primary/10 p-1.5 text-primary" />
          )}
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">{tenant?.name ?? 'UseAyni'}</p>
            <p className="truncate text-xs text-muted-foreground">Espaço da organização</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ label, path, icon: Icon }) => (
                <SidebarMenuItem key={path}>
                  <SidebarMenuButton
                    tooltip={label}
                    isActive={window.location.pathname === path ||
                      (path !== '/home' && path !== '/admin' && window.location.pathname.startsWith(`${path}/`))}
                    onClick={() => navigate(path)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
