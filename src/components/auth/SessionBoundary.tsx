import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { authService } from '@/lib/auth/authService';
import { useAuthContext } from '@/contexts/AuthContext';

export default function SessionBoundary() {
  const location = useLocation();
  const { setUser } = useAuthContext();
  useLayoutEffect(() => {
    setUser(authService.parseUserFromToken());
  }, [location.pathname, location.search, setUser]);
  return <Outlet />;
}
