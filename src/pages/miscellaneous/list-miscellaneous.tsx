import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Inbox } from 'lucide-react';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import {
  listMiscellaneous,
  SCOPE_LABELS,
  TYPE_LABELS,
  type Miscellaneous,
} from '@/services/miscellaneousService';

export default function ListMiscellaneous() {
  const navigate = useNavigate();
  const { data: rolesAndPermissions, isLoading } = useRolesAndPermissions();
  const [items, setItems] = useState<Miscellaneous[] | null>(null);

  useEffect(() => {
    listMiscellaneous()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={isLoading} />
      <SidebarInset>
        <AppHeader title="Miscelâneas" />
        <main className="flex-1 overflow-auto p-4">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Públicas e ativas</h2>
              <Button onClick={() => navigate('/miscelaneas/nova')}>
                <Plus className="h-4 w-4" /> Nova Miscelânea
              </Button>
            </div>

            {items === null ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : items.length === 0 ? (
              <Card className="py-12 text-center">
                <CardHeader className="items-center">
                  <Inbox className="mb-2 h-10 w-10 text-muted-foreground" />
                  <CardTitle>Nenhuma miscelânea ainda</CardTitle>
                  <CardDescription>
                    Comece criando a primeira ação coletiva da plataforma.
                  </CardDescription>
                  <Button className="mt-4" onClick={() => navigate('/miscelaneas/nova')}>
                    <Plus className="h-4 w-4" /> Criar primeira miscelânea
                  </Button>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-3">
                {items.map(m => (
                  <Card key={m.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{m.title}</CardTitle>
                      <CardDescription>
                        {TYPE_LABELS[m.type]} · {SCOPE_LABELS[m.scope]}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
