import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { useRolesAndPermissions } from "@/hooks/useRolesAndPermissions";

export default function Home() {
  const { data: rolesAndPermissions, isLoading } = useRolesAndPermissions();

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={isLoading} />
      <SidebarInset>
        <AppHeader title="Home" />
        <main className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Ayni</h2>
              <p className="text-muted-foreground">
                Sua plataforma de colaboração e crescimento acadêmico.
              </p>
            </div>

            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50 p-6">
                <h3 className="font-semibold mb-2">Comunidades Ativas</h3>
                <p className="text-sm text-muted-foreground">
                  Participe de discussões e colabore com outros estudantes.
                </p>
              </div>

              <div className="aspect-video rounded-xl bg-muted/50 p-6">
                <h3 className="font-semibold mb-2">Suas Metas</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe seu progresso e conquiste seus objetivos.
                </p>
              </div>

              <div className="aspect-video rounded-xl bg-muted/50 p-6">
                <h3 className="font-semibold mb-2">Próximos Eventos</h3>
                <p className="text-sm text-muted-foreground">
                  Não perca nenhum evento importante da sua agenda.
                </p>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
