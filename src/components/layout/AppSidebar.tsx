import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  MessageSquare,
  Users,
  Target,
  Calendar,
  Award,
  CheckSquare,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AccountSwitcher } from './AccountSwitcher';
import { NavUser } from './NavUser';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { useNavigate } from 'react-router-dom';

interface MemberPosition {
  type: 'REPRESENTANTE' | 'DIRIGENTE' | 'CAR' | 'CAE';
  id: string;
  name: string;
}

interface RolesAndPermissionsData {
  memberId: string;
  memberName: string;
  roles: string[];
  positions: MemberPosition[];
}

interface AppSidebarProps {
  rolesAndPermissions: RolesAndPermissionsData | null;
  isLoading: boolean;
}

const mockComunidades = ['Comunidade A', 'Comunidade B', 'Comunidade C'];

export function AppSidebar({ rolesAndPermissions, isLoading }: AppSidebarProps) {
  const [comunidadesOpen, setComunidadesOpen] = useState(false);
  const [tarefasOpen, setTarefasOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch current member data
  const { member } = useCurrentMember();

  const user = {
    name: member?.name || 'Usuário',
    email: member?.email_personal || member?.email_university || 'email@example.com',
    avatar: member?.profile_picture_url || '',
    slug: member?.slug || '',
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-center p-2 group-data-[collapsible=icon]:hidden">
          <img
            src="/Ayni.svg"
            alt="Ayni"
            className="h-8 w-auto cursor-pointer"
            onClick={() => navigate('/home')}
          />
        </div>
        <AccountSwitcher rolesAndPermissions={rolesAndPermissions} isLoading={isLoading} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Chats">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chats</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible
                open={comunidadesOpen}
                onOpenChange={setComunidadesOpen}
                asChild
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Comunidades" asChild>
                    <CollapsibleTrigger>
                      <Users className="h-4 w-4" />
                      <span>Comunidades</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-100 group-data-open/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {mockComunidades.map(comunidade => (
                        <SidebarMenuSubItem key={comunidade}>
                          <SidebarMenuSubButton>
                            <span>{comunidade}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>
                          <span>Explorar</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Metas">
                  <Target className="h-4 w-4" />
                  <span>Metas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Agenda">
                  <Calendar className="h-4 w-4" />
                  <span>Agenda</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Participações">
                  <Award className="h-4 w-4" />
                  <span>Participações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible
                open={tarefasOpen}
                onOpenChange={setTarefasOpen}
                asChild
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Tarefas" asChild>
                    <CollapsibleTrigger>
                      <CheckSquare className="h-4 w-4" />
                      <span>Tarefas</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-100 group-data-open/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>
                          <span>Vinculadas</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>
                          <span>Explorar</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Configurações">
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
