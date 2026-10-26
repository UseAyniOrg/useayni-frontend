import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { CreateStepper } from '@/components/miscellaneous/CreateStepper';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';

export default function MiscellaneousCreatePage() {
  const { data: rolesAndPermissions, isLoading } = useRolesAndPermissions();
  const roles = Array.isArray(rolesAndPermissions?.roles)
    ? rolesAndPermissions.roles.map((r: string | { name: string }) => typeof r === 'string' ? r : r.name)
    : ['MEMBRO'];

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={isLoading} />
      <SidebarInset>
        <AppHeader title="Nova Miscelânea" />
        <main className="flex-1 overflow-auto p-6">
          <CreateStepper userRoles={roles} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
