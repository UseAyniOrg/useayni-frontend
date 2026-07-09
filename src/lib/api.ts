import axios from 'axios';
import { authService } from './auth/authService';

const backendUrl =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:3333');

export const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  config => {
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

      const requestUrl = String(originalRequest?.url ?? '');
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/refresh-token') ||
        requestUrl.includes('/auth/logout');

      // Never try refresh for auth endpoints themselves (ex: failed login).
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // Without an access token there is nothing to refresh.
      if (!authService.getAccessToken()) {
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await authService.refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);
