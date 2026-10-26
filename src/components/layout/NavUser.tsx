import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Building2, Check, ChevronsUpDown, LogOut, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { authService } from '@/lib/auth/authService';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { currentAccessContext, tenantUrl } from '@/lib/auth/accessContext';

export function NavUser({
  user,
}: {
  user: { name: string; email: string; avatar: string; slug: string };
}) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { clearAuth, user: authUser, setUser } = useAuthContext();
  const { tenant } = useTenant();
  const [switchError, setSwitchError] = useState('');

  const switchOrganization = async (tenantSlug: string) => {
    if (tenantSlug === tenant?.slug) return;
    setSwitchError('');
    try {
      const { user: switchedUser } = await authService.switchOrganization(tenantSlug);
      setUser(switchedUser);
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.assign(tenantUrl(tenantSlug, currentPath));
    } catch (error: unknown) {
      const responseMessage =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { message?: unknown } } }).response?.data?.message
          : undefined;
      setSwitchError(
        typeof responseMessage === 'string'
          ? responseMessage
          : 'Não foi possível alternar para essa organização.',
      );
    }
  };

  const handleLogout = async () => {
    const loginPath = currentAccessContext() === 'member' ? '/login' : '/admin/login';
    await authService.logout();
    clearAuth();
    navigate(loginPath);
  };

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('');

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div>
              {authUser?.roles.includes('EXTERNO') && (
                <DropdownMenuItem onSelect={() => navigate('/minhas-inscricoes')}>
                  <UserRound />
                  Meus eventos
                </DropdownMenuItem>
              )}
              {user.slug && (
                <DropdownMenuItem onSelect={() => navigate(`/membros/${user.slug}`)}>
                  <BadgeCheck />
                  Meu perfil
                </DropdownMenuItem>
              )}
            </div>
            {(authUser?.organization_memberships ?? []).filter((membership) => membership.status === 'approved').length > 1 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Minhas organizações</DropdownMenuLabel>
                {(authUser?.organization_memberships ?? [])
                  .filter((membership) => membership.status === 'approved')
                  .map((membership) => (
                    <DropdownMenuItem
                      key={membership.organization_id}
                      onSelect={() => void switchOrganization(membership.tenant_slug)}
                    >
                      <Building2 />
                      <span className="truncate">{membership.organization_name}</span>
                      {membership.tenant_slug === tenant?.slug && <Check className="ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                {switchError && <p role="alert" className="px-2 py-1 text-xs text-destructive">{switchError}</p>}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
