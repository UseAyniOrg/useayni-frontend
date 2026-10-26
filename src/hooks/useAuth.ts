import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { authService } from '@/lib/auth/authService';
import { useAuthContext } from '@/contexts/AuthContext';

export function useAuth() {
  const { setUser, clearAuth } = useAuthContext();
  const user = authService.parseUserFromToken();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const loginPath = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login';

  useEffect(() => {
    validateToken();
  }, [location.pathname, location.search]);

  const validateToken = async () => {
    const token = authService.getAccessToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      await api.get('/auth/verify-access-token');
      // Atualizar user do token caso tenha expirado do contexto
      const parsed = authService.parseUserFromToken();
      if (parsed) setUser(parsed);
    } catch {
      clearAuth();
      await authService.logout();
      navigate(loginPath);
    } finally {
      setIsLoading(false);
    }
  };

  return { isAuthenticated: !!user, isLoading, user };
}
