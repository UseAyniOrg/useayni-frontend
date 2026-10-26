import { sessionScope } from './accessContext';

function cookieName(name: string, scope = sessionScope()): string {
  return ['accessToken', 'refreshToken'].includes(name) ? `${name}_${encodeURIComponent(scope)}` : name;
}

export function getCookie(name: string, scope?: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${cookieName(name, scope)}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function setCookie(name: string, value: string, scope?: string) {
  const host = window.location.hostname;
  const domain = host === 'useayni.com' || host.endsWith('.useayni.com')
    ? '; domain=.useayni.com'
    : '';
  const secure = window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${cookieName(name, scope)}=${value}; path=/; samesite=lax${domain}${secure}`;
}

export function removeCookie(name: string, scope?: string) {
  const host = window.location.hostname;
  const domain = host === 'useayni.com' || host.endsWith('.useayni.com')
    ? '; domain=.useayni.com'
    : '';
  document.cookie = `${cookieName(name, scope)}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domain}`;
}
