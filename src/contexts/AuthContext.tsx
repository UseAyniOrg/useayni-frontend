import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { authService } from '@/lib/authService';

export interface MemberPosition {
  type: 'REPRESENTANTE' | 'DIRIGENTE' | 'CAR' | 'CAE';
  id: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  roles: string[];
  positions: MemberPosition[];
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
  isTechTeam: boolean;
  isExternal: boolean;
  hasPosition: (type: MemberPosition['type']) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.memberId || payload.id || '',
      email: payload.email || '',
      name: payload.name || '',
      isActive: payload.isActive ?? false,
      roles: payload.roles || [],
      positions: payload.positions || [],
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const token = authService.getAccessToken();
    return token ? parseJwt(token) : null;
  });

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
  }, []);

  const clearAuth = useCallback(() => {
    setUserState(null);
  }, []);

  const isTechTeam = user?.roles.includes('EQUIPE_TECNICA') ?? false;
  const isExternal = user?.roles.includes('EXTERNO') ?? false;
  const hasPosition = (type: MemberPosition['type']) =>
    user?.positions.some(p => p.type === type) ?? false;

  return (
    <AuthContext.Provider value={{ user, setUser, clearAuth, isTechTeam, isExternal, hasPosition }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
}

// Mantido para compatibilidade com código legado
export function useAuthContextLegacy() {
  const { user } = useAuthContext();
  return { memberId: user?.id ?? null };
}
