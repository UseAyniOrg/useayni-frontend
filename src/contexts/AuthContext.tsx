import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { authService } from '@/lib/auth/authService';

export interface MemberPosition {
  type: 'REPRESENTANTE' | 'DIRIGENTE' | 'CAR' | 'CAE';
  id: string;
  name: string;
}

export interface MemberMandate {
  mandate_id: string;
  position: string;
  position_id: string;
  org_unit_id: string;
  org_unit_name: string;
  org_unit_type: string;
}

export interface OrganizationMembership {
  member_id: string;
  organization_id: string;
  organization_name: string;
  tenant_slug: string;
  status: string;
}

export interface AuthUser {
  access_context?: 'platform' | 'organization' | 'member' | 'support';
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  roles: string[];
  positions: MemberPosition[];
  mandates?: MemberMandate[];
  organization_id?: string;
  tenant_slug?: string;
  account_id?: string;
  support_session_id?: string;
  password_change_required?: boolean;
  organization_memberships: OrganizationMembership[];
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
  isTechTeam: boolean;
  isExternal: boolean;
  hasPosition: (type: MemberPosition['type']) => boolean;
  hasMandate: (orgUnitTypeSlug: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string): AuthUser | null {
  try {
    const encodedPayload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=')));
    return {
      id: payload.memberId || payload.id || '',
      access_context: payload.access_context,
      email: payload.email || '',
      name: payload.name || '',
      isActive: payload.isActive ?? false,
      roles: payload.roles || [],
      positions: payload.positions || [],
      mandates: payload.mandates || [],
      organization_id: payload.organization_id,
      tenant_slug: payload.tenant_slug,
      account_id: payload.account_id,
      support_session_id: payload.support_session_id,
      password_change_required: payload.password_change_required ?? false,
      organization_memberships: payload.organization_memberships || [],
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
    user?.positions.some((p) => p.type === type) ?? false;

  const hasMandate = (orgUnitTypeSlug: string) =>
    user?.mandates?.some((m) => m.org_unit_type === orgUnitTypeSlug) ?? false;

  return (
    <AuthContext.Provider
      value={{ user, setUser, clearAuth, isTechTeam, isExternal, hasPosition, hasMandate }}
    >
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
