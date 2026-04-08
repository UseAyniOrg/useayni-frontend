import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { authService } from '@/lib/authService';
import { useAuthContext } from '@/contexts/AuthContext';

export function useAuth() {
  const { user, setUser, clearAuth } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    const token = authService.getAccessToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      await api.get('/auth/verify-access-token');
      // Atualizar user do token caso tenha expirado do contexto
      if (!user) {
        const parsed = authService.parseUserFromToken();
        if (parsed) setUser(parsed);
      }
    } catch {
      clearAuth();
      await authService.logout();
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return { isAuthenticated: !!user, isLoading, user };
}
