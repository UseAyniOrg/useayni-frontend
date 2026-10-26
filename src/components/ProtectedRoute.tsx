import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { currentAccessContext, resolveTenantSlug } from '@/lib/auth/accessContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredFeature?: string;
  requiredRoles?: string[];
  requireTenant?: boolean;
}

export function ProtectedRoute({ children, requiredFeature, requiredRoles, requireTenant }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { tenant, isLoading: isTenantLoading, isFeatureEnabled } = useTenant();

  if (isLoading || isTenantLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={requiredRoles ? '/admin/login' : '/login'} replace />;
  }
  if (user?.access_context !== currentAccessContext() &&
      !(user?.access_context === 'support' && currentAccessContext() === 'organization')) {
    return <Navigate to={location.pathname.startsWith('/admin') ? '/admin/login' : '/login'} replace />;
  }

  if ((requireTenant ?? !requiredRoles) && !resolveTenantSlug()) {
    return <Navigate to="/selecionar-organizacao" replace />;
  }

  if (user?.password_change_required && location.pathname !== '/definir-senha' && requireTenant !== false) {
    return <Navigate to={`/definir-senha?access=${currentAccessContext()}`} replace />;
  }

  if (
    requiredRoles &&
    !user?.support_session_id &&
    !requiredRoles.some((role) => user?.roles.includes(role))
  ) {
    return <Navigate to="/home" replace />;
  }

  if (
    tenant &&
    !user?.support_session_id &&
    !['ACTIVE', 'TRIAL'].includes(tenant.status)
  ) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-xl font-semibold">Organização indisponível</h1>
        <p className="mt-2">
          {tenant.status === 'SUSPENDED'
            ? 'O acesso a esta organização está suspenso.'
            : 'Esta organização ainda não está disponível.'}
        </p>
      </main>
    );
  }

  if (
    requiredFeature &&
    !user?.support_session_id &&
    !isFeatureEnabled(requiredFeature)
  ) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
