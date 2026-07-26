import { useParams } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PeopleTab } from '@/components/miscellaneous/people-tab';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';

export default function MiscellaneousDetail() {
  const { id } = useParams<{ id: string }>();
  const miscellaneousId = id ?? 'mock-misc-001';
  const { data: rolesAndPermissions, isLoading } = useRolesAndPermissions();

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={isLoading} />
      <SidebarInset>
        <AppHeader title="Miscelânea" />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Reunião de Planejamento Q2</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Shell da página de miscelânea — detalhes completos na issue #11.
              </p>
            </div>

            <Tabs defaultValue="pessoas">
              <TabsList>
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="pessoas">Pessoas</TabsTrigger>
              </TabsList>

              <TabsContent value="detalhes" className="mt-6">
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  <p className="text-sm">
                    Informações da miscelânea (tipo, datas, visibilidade) serão exibidas aqui.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="pessoas" className="mt-6">
                <PeopleTab miscellaneousId={miscellaneousId} canManage />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
