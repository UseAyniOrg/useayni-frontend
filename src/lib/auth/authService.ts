import { api } from '@/lib/api';
import type { AuthUser } from '@/contexts/AuthContext';
import { getCookie, removeCookie, setCookie } from './cookies';
import { currentAccessContext, resolveTenantSlug, sessionScope } from './accessContext';
import type {
  LoginCredentials,
  LoginResponse,
  RegistrationFieldDefinition,
  SignUpData,
  SignUpResponse,
} from './authTypes';

export const authService = {
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: AuthUser; accessToken: string; refreshToken?: string }> {
    const response = await api.post<LoginResponse>('/auth/login', {
      ...credentials, access_context: credentials.access_context ?? currentAccessContext(),
    });
    const { accessToken, refreshToken } = response.data;
    const user = parseJwt(accessToken);

    if (!user) throw new Error('Token invalido recebido do servidor');
    const scope = sessionScope(credentials.access_context ?? currentAccessContext(), resolveTenantSlug());
    setCookie('accessToken', accessToken, scope);
    if (refreshToken) setCookie('refreshToken', refreshToken, scope);
    else removeCookie('refreshToken', scope);

    return { user, accessToken, refreshToken };
  },

  async signUp(data: SignUpData, sponsorMemberId?: string): Promise<SignUpResponse> {
    const response = await api.post<SignUpResponse>('/members', data, {
      params: sponsorMemberId ? { memberId: sponsorMemberId } : undefined,
    });
    return response.data;
  },

  async getRegistrationFields(): Promise<RegistrationFieldDefinition[]> {
    const response = await api.get<RegistrationFieldDefinition[]>('/members/registration-fields');
    return response.data;
  },

  async changeTemporaryPassword(newPassword: string, fullName: string): Promise<void> {
    await api.post('/auth/change-temporary-password', { new_password: newPassword, full_name: fullName });
    removeCookie('accessToken');
    removeCookie('refreshToken');
  },

  async logout(): Promise<void> {
    const accessToken = getCookie('accessToken');
    if (accessToken) {
      try {
        await api.post(
          '/auth/logout',
          { refreshToken: getCookie('refreshToken') ?? undefined },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      } catch (error) {
        console.error('Não foi possível encerrar a sessão no servidor.', error);
      }
    }
    removeCookie('accessToken');
    removeCookie('refreshToken');
    removeCookie('supportPreviousAccessToken');
    removeCookie('supportPreviousRefreshToken');
  },

  async refreshToken(): Promise<string> {
    const refreshToken = getCookie('refreshToken');
    if (!refreshToken) throw new Error('Refresh token nao encontrado');

    const response = await api.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh-token',
      { refreshToken }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setCookie('accessToken', accessToken);
    setCookie('refreshToken', newRefreshToken);

    return accessToken;
  },

  async switchOrganization(tenantSlug: string): Promise<{ user: AuthUser; accessToken: string }> {
    const response = await api.post<{ accessToken: string; refreshToken?: string }>('/auth/switch-organization', {
      tenant_slug: tenantSlug,
      rememberMe: Boolean(getCookie('refreshToken')),
    });
    const { accessToken, refreshToken } = response.data;
    const user = parseJwt(accessToken);
    if (!user) throw new Error('Token invalido recebido do servidor');
    setCookie('accessToken', accessToken, sessionScope('member', tenantSlug));
    if (refreshToken) setCookie('refreshToken', refreshToken, sessionScope('member', tenantSlug));
    return { user, accessToken };
  },

  async startSupportSession(
    organizationId: string,
    reason: string,
  ): Promise<{ user: AuthUser; tenantSlug: string; expiresAt: string }> {
    const currentAccessToken = getCookie('accessToken');
    if (!currentAccessToken) throw new Error('Faça login novamente antes de iniciar o suporte.');
    const response = await api.post<{
      accessToken: string;
      tenant_slug: string;
      expires_at: string;
    }>(`/organizations/${organizationId}/support-access`, { reason });
    const user = parseJwt(response.data.accessToken);
    if (!user) throw new Error('Token inválido recebido para a sessão de suporte.');

    setCookie('accessToken', response.data.accessToken, sessionScope('organization', response.data.tenant_slug));
    removeCookie('refreshToken', sessionScope('organization', response.data.tenant_slug));
    return {
      user,
      tenantSlug: response.data.tenant_slug,
      expiresAt: response.data.expires_at,
    };
  },

  async endSupportSession(): Promise<AuthUser> {
    await api.post('/auth/end-support-access');
    const previousAccessToken = getCookie('accessToken', sessionScope('platform'));
    if (!previousAccessToken) {
      throw new Error('A sessão original não está disponível neste navegador; faça login novamente.');
    }
    const user = parseJwt(previousAccessToken);
    if (!user) throw new Error('A sessão original expirou; faça login novamente.');

    removeCookie('accessToken');
    setCookie('accessToken', previousAccessToken, sessionScope('platform'));
    return user;
  },

  getAccessToken(): string | null {
    return getCookie('accessToken');
  },

  parseUserFromToken(): AuthUser | null {
    const token = getCookie('accessToken');
    return token ? parseJwt(token) : null;
  },
};

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
      password_change_required: payload.password_change_required === true,
      organization_memberships: payload.organization_memberships || [],
    };
  } catch {
    return null;
  }
}
