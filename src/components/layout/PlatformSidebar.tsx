import { Building2, ClipboardCheck, Globe2, Home, ShieldCheck } from 'lucide-react';
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
import { useAuthContext } from '@/contexts/AuthContext';
import { NavUser } from './NavUser';

const navigation = [
  { label: 'Visão geral', id: 'platform-overview', icon: Home, path: '/admin' },
  { label: 'Organizações', id: 'organization-list', icon: Building2, path: '/admin/organizacoes' },
  { label: 'Homes públicas', id: 'home-editor', icon: Globe2, path: '/admin/organizacao/home' },
  { label: 'Campos de cadastro', id: 'registration-fields', icon: ClipboardCheck, path: '/admin/cadastro' },
  { label: 'Tipos de cadastro', id: 'external-profiles', icon: ClipboardCheck, path: '/admin/perfis-externos' },
];

export function PlatformSidebar() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-3">
          <ShieldCheck className="h-8 w-8 shrink-0 rounded bg-primary/10 p-1.5 text-primary" />
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold">UseAyni</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map(({ label, id, icon: Icon, path }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    tooltip={label}
                    isActive={window.location.pathname === path}
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
        <NavUser
          user={{
            name: user?.name ?? 'Equipe técnica',
            email: user?.email ?? '',
            avatar: '',
            slug: '',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
