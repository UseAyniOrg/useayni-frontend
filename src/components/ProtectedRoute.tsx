import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthContext } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  skipPendingCheck?: boolean;      
  requiresApprovalAccess?: boolean; 
}

export function ProtectedRoute({ children, skipPendingCheck, requiresApprovalAccess }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { user, isTechTeam, hasPosition } = useAuthContext();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isLeadership =
    isTechTeam ||
    hasPosition('CAE') ||
    hasPosition('CAR') ||
    hasPosition('DIRIGENTE') ||
    hasPosition('REPRESENTANTE');

  if (!skipPendingCheck && user && !user.isActive && !isLeadership) {
    return <Navigate to="/cadastro-pendente" replace />;
  }

  if (requiresApprovalAccess && !isLeadership) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

