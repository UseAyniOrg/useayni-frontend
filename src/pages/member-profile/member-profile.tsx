import { useParams } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { useRolesAndPermissions } from "@/hooks/useRolesAndPermissions";
import { useMemberProfile } from "@/hooks/useMemberProfile";


export default function MemberProfile() {
  const { memberSlugName } = useParams<{ memberSlugName: string }>();
  const { data: rolesAndPermissions, isLoading: loadingRoles } = useRolesAndPermissions();
  const { profile, isLoading: loadingProfile, error } = useMemberProfile(memberSlugName);

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={loadingRoles} />
        <SidebarInset>
          <AppHeader title="Perfil do Membro" />
          <main className="flex-1 overflow-auto p-4">
            <div className="text-red-500">Erro ao carregar perfil: {error.message}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (loadingProfile) {
    return (
      <SidebarProvider>
        <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={loadingRoles} />
        <SidebarInset>
          <AppHeader title="Perfil do Membro" />
          <main className="flex-1 overflow-auto p-4">
            <div>Carregando perfil...</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!profile) {
    return (
      <SidebarProvider>
        <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={loadingRoles} />
        <SidebarInset>
          <AppHeader title="Perfil do Membro" />
          <main className="flex-1 overflow-auto p-4">
            <div>Membro não encontrado</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={loadingRoles} />
      <SidebarInset>
        <AppHeader title={`Perfil - ${profile.name}`} />
        <main className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">RA: {profile.ra}</p>
            </div>

            {profile.biography && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Sobre</h3>
                <p className="text-muted-foreground">{profile.biography}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {profile.course && (
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold mb-1">Curso</h3>
                  <p className="text-sm text-muted-foreground">{profile.course.name}</p>
                </div>
              )}

              {profile.university && (
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold mb-1">Universidade</h3>
                  <p className="text-sm text-muted-foreground">{profile.university.name}</p>
                </div>
              )}

              {profile.city && (
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold mb-1">Cidade</h3>
                  <p className="text-sm text-muted-foreground">{profile.city.name}</p>
                </div>
              )}

              {profile.phone && (
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold mb-1">Telefone</h3>
                  <p className="text-sm text-muted-foreground">{profile.phone}</p>
                </div>
              )}
            </div>

            {profile.sponsor && (
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">Padrinho/Madrinha</h3>
                <p className="text-sm text-muted-foreground">{profile.sponsor.name}</p>
              </div>
            )}

            {profile.roles && profile.roles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Cargos</h3>
                <div className="space-y-2">
                  {profile.roles.map((role) => (
                    <div key={role.id} className="bg-muted rounded-lg p-3">
                      <p className="font-medium">{role.name}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.linkedin_url && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Redes Sociais</h3>
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  LinkedIn
                </a>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}