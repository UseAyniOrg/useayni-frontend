import { api } from '@/lib/api';
import type { AuthUser } from '@/contexts/AuthContext';

interface LoginCredentials {
  personalEmail: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  member: {
    id: string;
    email_personal: string;
    name: string;
    roles: string[];
  };
  accessToken: string;
  refreshToken?: string;
}

interface SignUpData {
  name: string;
  cpf: string;
  phone: string;
  email_personal: string;
  email_university: string;
  birth_date: string;
  admission_date: string;
  ra: string;
  password: string;
  city_id?: string;
  course_university_id?: string;
  current_semester?: number;
  university_not_applicable?: boolean;
  course_not_applicable?: boolean;
  current_semester_not_applicable?: boolean;
  sponsor?: string;
}

interface SignUpResponse {
  message: string;
  data: Record<string, unknown>;
  accessToken?: string;
}

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

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; samesite=strict`;
}

function removeCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
