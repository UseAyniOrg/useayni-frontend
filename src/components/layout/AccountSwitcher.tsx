import { useState, useEffect } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface RolesAndPermissionsData {
  memberId: string;
  memberName: string;
  roles: Role[];
}

interface AccountSwitcherProps {
  rolesAndPermissions: RolesAndPermissionsData | null;
  isLoading: boolean;
}

export function AccountSwitcher({ rolesAndPermissions, isLoading }: AccountSwitcherProps) {
  const { isMobile } = useSidebar();
  const [cargoAtivo, setCargoAtivo] = useState<string>("");

  useEffect(() => {
    if (rolesAndPermissions?.roles && rolesAndPermissions.roles.length > 0) {
      setCargoAtivo(rolesAndPermissions.roles[0].name);
    }
  }, [rolesAndPermissions]);

  const user = {
    name: rolesAndPermissions?.memberName || "Usuário",
    email: "joao@email.com",
    avatar: "",
  };

  const roles = rolesAndPermissions?.roles || [];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {cargoAtivo
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{user.name.split(" ")[0]}</span>
                <span className="truncate text-xs text-muted-foreground">{cargoAtivo || "Carregando..."}</span>
              </div>
              <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Cargos
            </DropdownMenuLabel>
            {isLoading ? (
              <DropdownMenuItem disabled>Carregando cargos...</DropdownMenuItem>
            ) : roles.length > 0 ? (
              roles.map((role) => (
                <DropdownMenuItem
                  key={role.id}
                  onClick={() => setCargoAtivo(role.name)}
                  className="gap-2 p-2"
                >
                  {role.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>Nenhum cargo disponível</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
