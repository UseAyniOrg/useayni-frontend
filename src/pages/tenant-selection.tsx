import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Building2, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth/authService';
import { safeReturnTo, tenantUrl } from '@/lib/auth/accessContext';

export default function TenantSelectionPage() {
  const { user, setUser, clearAuth } = useAuthContext();
  const [searchParams] = useSearchParams();
  const [selectedTenant, setSelectedTenant] = useState('');
  const [error, setError] = useState('');
  const returnTo = safeReturnTo(searchParams.get('returnTo'));
  const memberships = (user?.organization_memberships ?? [])
    .filter((membership) => membership.status.toLowerCase() === 'approved');

  const selectOrganization = async (tenantSlug: string) => {
    setSelectedTenant(tenantSlug);
    setError('');
    try {
      const { user: switchedUser } = await authService.switchOrganization(tenantSlug);
      setUser(switchedUser);
      const destination = switchedUser.password_change_required
        ? `/definir-senha?access=member${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`
        : returnTo ?? '/home';
      window.location.assign(tenantUrl(tenantSlug, destination));
    } catch (requestError: unknown) {
      const responseMessage =
        typeof requestError === 'object' && requestError !== null && 'response' in requestError
          ? (requestError as { response?: { data?: { message?: unknown } } }).response?.data?.message
          : undefined;
      setError(typeof responseMessage === 'string'
        ? responseMessage
        : 'Não foi possível acessar essa organização. Tente novamente.');
      setSelectedTenant('');
    }
  };

  const logout = async () => {
    await authService.logout();
    clearAuth();
    window.location.assign('/login');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link to="/" aria-label="UseAyni, página inicial">
            <img src="/Ayni.svg" alt="UseAyni" className="h-10 w-auto" />
          </Link>
          <Button variant="ghost" size="sm" onClick={() => void logout()}>
            <LogOut className="size-4" /> Sair
          </Button>
        </header>

        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-muted-foreground">Olá, {user?.name}</p>
            <CardTitle className="text-2xl">Escolha sua organização</CardTitle>
            <CardDescription>Seu acesso é compartilhado. Selecione o espaço que deseja abrir.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {memberships.length > 0 ? memberships.map((membership) => (
              <button
                key={membership.organization_id}
                type="button"
                onClick={() => void selectOrganization(membership.tenant_slug)}
                disabled={Boolean(selectedTenant)}
                className="flex w-full items-center gap-4 rounded-md border bg-background p-4 text-left transition-colors hover:bg-accent disabled:cursor-wait disabled:opacity-60"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{membership.organization_name}</span>
                  <span className="block truncate text-sm text-muted-foreground">{membership.tenant_slug}</span>
                </span>
                {selectedTenant === membership.tenant_slug
                  ? <Loader2 className="size-4 animate-spin" />
                  : <ArrowRight className="size-4 shrink-0 text-muted-foreground" />}
              </button>
            )) : (
              <div className="rounded-md border border-dashed p-5 text-sm leading-6 text-muted-foreground">
                Esta conta ainda não tem acesso aprovado a uma organização. Peça ao administrador da sua organização para confirmar seu vínculo.
              </div>
            )}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}