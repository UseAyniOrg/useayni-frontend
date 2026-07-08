import { useState, useEffect } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentMember } from '@/hooks/useCurrentMember';

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

interface AccountSwitcherProps {
  rolesAndPermissions: RolesAndPermissionsData | null;
  isLoading: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  MEMBRO: 'Membro',
  LIDER: 'Líder',
  DIRIGENTE: 'Dirigente',
  CA: 'CA',
  EQUIPE_TECNICA: 'Equipe Técnica',
  ESTADUAL: 'Estadual',
  CAR: 'CAR',
  EXTERNO: 'Externo',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

export function AccountSwitcher({ rolesAndPermissions, isLoading }: AccountSwitcherProps) {
  const { isMobile } = useSidebar();
  const { member } = useCurrentMember();
  const [cargoAtivo, setCargoAtivo] = useState<string>('');

  const roles = rolesAndPermissions?.roles ?? [];
  const positions = rolesAndPermissions?.positions ?? [];
  const memberName = member?.name || rolesAndPermissions?.memberName || '';
  const avatar = member?.profile_picture_url ?? '';
  const initials = memberName ? getInitials(memberName) : '?';

  const allOptions = [
    ...roles.map(r => ({ key: r, label: ROLE_LABELS[r] ?? r })),
    ...positions.map(p => ({ key: `${p.type}-${p.id}`, label: `${ROLE_LABELS[p.type] ?? p.type} — ${p.name}` })),
  ];

  useEffect(() => {
    if (allOptions.length > 0 && !cargoAtivo) {
      setCargoAtivo(allOptions[0].label);
    }
  }, [rolesAndPermissions]);

  const displayLabel = isLoading ? '' : (cargoAtivo || allOptions[0]?.label || 'Membro');
  const canSwitch = !isLoading && allOptions.length > 1;

  const inner = (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={avatar} alt={memberName} />
        <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate font-semibold">{memberName.split(' ')[0] || '—'}</span>
        <span className="truncate text-xs text-muted-foreground">{displayLabel}</span>
      </div>
      {canSwitch && <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />}
    </SidebarMenuButton>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {canSwitch ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>{inner}</DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">Cargos</DropdownMenuLabel>
              {allOptions.map(opt => (
                <DropdownMenuItem
                  key={opt.key}
                  onClick={() => setCargoAtivo(opt.label)}
                  className="gap-2 p-2"
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          inner
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
