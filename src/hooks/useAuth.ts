import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { authService } from '@/lib/authService';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    const token = authService.getAccessToken();
    
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      await api.get('/auth/verify-access-token');
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      authService.logout();
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return { isAuthenticated, isLoading };
}
