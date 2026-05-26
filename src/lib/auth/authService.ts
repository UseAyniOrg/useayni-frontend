import { api } from '@/lib/api';
import type { AuthUser } from '@/contexts/AuthContext';
import { getCookie, removeCookie, setCookie } from './cookies';
import type { LoginCredentials, LoginResponse, SignUpData, SignUpResponse } from './authTypes';

export const authService = {
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: AuthUser; accessToken: string; refreshToken?: string }> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    const { accessToken, refreshToken } = response.data;
    const user = parseJwt(accessToken);

    setCookie('accessToken', accessToken);
    if (refreshToken) setCookie('refreshToken', refreshToken);

    if (!user) throw new Error('Token invalido recebido do servidor');

    return { user, accessToken, refreshToken };
  },

  async signUp(data: SignUpData): Promise<SignUpResponse> {
    const response = await api.post<SignUpResponse>('/members', data);
    return response.data;
  },

  async logout(): Promise<void> {
    const accessToken = getCookie('accessToken');
    if (accessToken) {
      try {
        await api.post(
          '/auth/logout',
          {},
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      } catch {
        // Ignorar erro no logout
      }
    }
    removeCookie('accessToken');
    removeCookie('refreshToken');
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

