import axios from 'axios';
import { authService } from './auth/authService';
import { applyTenantHeader, withTenantQuery } from './auth/accessContext';

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3333',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  config => {
    applyTenantHeader(config.headers);
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      if (originalRequest.url === '/auth/login' || originalRequest.url === '/auth/refresh-token' ||
          originalRequest.url === '/auth/logout' || !originalRequest.headers?.Authorization) {
        return Promise.reject(error);
      }
      const message = error.response?.data?.error ?? '';

      // Sessão invalidada por troca de role ou logout remoto — força novo login
      if (message.includes('Sessão encerrada')) {
        window.location.href = withTenantQuery(window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login');
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newToken = await authService.refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          window.location.href = withTenantQuery(window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login');
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);
