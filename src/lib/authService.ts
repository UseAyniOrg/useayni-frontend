import { api } from '@/lib/api';
import { useCookies } from 'react-cookie';

interface LoginCredentials {
  personalEmail: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  member: {
    id: string;
    email_personal: string;
    position: string;
  };
  accessToken: string;
  refreshToken?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    
    const { accessToken, refreshToken } = response.data;
    
    // Armazenar tokens em cookies HTTP Only Secure
    document.cookie = `accessToken=${accessToken}; path=/; secure; samesite=strict`;
    
    if (refreshToken) {
      document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=strict`;
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    const accessToken = getCookie('accessToken');
    
    if (accessToken) {
      await api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    }
    
    // Remover cookies
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Remover memberId do localStorage
    try {
      localStorage.removeItem('memberId');
    } catch {
      console.error('Failed to remove memberId from localStorage');
    }
  },

  async refreshToken(): Promise<string> {
    const refreshToken = getCookie('refreshToken');
    
    if (!refreshToken) {
      throw new Error('Refresh token não encontrado');
    }
    
    const response = await api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh-token', {
      refreshToken
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    document.cookie = `accessToken=${accessToken}; path=/; secure; samesite=strict`;
    document.cookie = `refreshToken=${newRefreshToken}; path=/; secure; samesite=strict`;
    
    return accessToken;
  },

  getAccessToken(): string | null {
    return getCookie('accessToken');
  },
};

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}
