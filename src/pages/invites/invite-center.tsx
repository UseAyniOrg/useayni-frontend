import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InviteCard } from '@/components/invites/InviteCard';
import { useReceivedInvites } from '@/hooks/useReceivedInvites';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { Skeleton } from '@/components/ui/skeleton';

export default function InviteCenter() {
  const { data: rolesAndPermissions, isLoading: rolesLoading } = useRolesAndPermissions();
  const {
    pendingInvites,
    historyInvites,
    isLoading,
    error,
    refetch,
  } = useReceivedInvites();

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={rolesLoading} />
      <SidebarInset>
        <AppHeader title="Convites" />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Central de convites</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Gerencie convites recebidos para participar de miscelâneas.
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Tabs defaultValue="pendentes">
              <TabsList className="w-full">
                <TabsTrigger value="pendentes" className="flex-1">
                  Pendentes
                  {pendingInvites.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                      {pendingInvites.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="historico" className="flex-1">
                  Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pendentes" className="mt-6 space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </>
                ) : pendingInvites.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-12">
                    Nenhum convite pendente no momento.
                  </p>
                ) : (
                  pendingInvites.map(invite => (
                    <InviteCard key={invite.id} invite={invite} onUpdated={refetch} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="historico" className="mt-6 space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </>
                ) : historyInvites.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-12">
                    Nenhum convite no histórico.
                  </p>
                ) : (
                  historyInvites.map(invite => (
                    <InviteCard
                      key={invite.id}
                      invite={invite}
                      onUpdated={refetch}
                      showActions={false}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
