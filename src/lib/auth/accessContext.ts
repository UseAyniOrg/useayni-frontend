export type AccessContext = 'platform' | 'organization' | 'member';

export function resolveTenantSlug(): string | null {
  const host = window.location.hostname;
  if (['useayni.com', 'www.useayni.com', 'admin.useayni.com', 'api.useayni.com'].includes(host)) return null;
  const match = host.match(/^([^.]+)\.(?:useayni\.com|localhost)$/);
  if (match) return ['www', 'admin', 'api', 'useayni'].includes(match[1]) ? null : match[1];
  const path = window.location.pathname.match(/^\/o\/([a-z0-9-]+)(?:\/|$)/i);
  return path?.[1]?.toLowerCase() ?? null;
}

export function tenantUrl(tenantSlug: string, path: string): string {
  const target = new URL(path, window.location.origin);
  target.searchParams.delete('org');

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    const routePath = target.pathname.replace(/^\/o\/[a-z0-9-]+(?=\/|$)/i, '') || '/';
    target.pathname = `/o/${tenantSlug}${routePath}`;
  } else if (host.endsWith('.localhost')) {
    target.hostname = `${tenantSlug}.localhost`;
  } else if (host === 'useayni.com' || host.endsWith('.useayni.com')) {
    target.hostname = `${tenantSlug}.useayni.com`;
  } else {
    target.hostname = `${tenantSlug}.${host.split('.').slice(-2).join('.')}`;
  }

  return target.toString();
}

export function applyTenantHeader(headers: {
  set(name: string, value: string): unknown;
  delete(name: string): unknown;
}): void {
  const slug = resolveTenantSlug();
  if (slug) headers.set('X-Org-Slug', slug);
  else headers.delete('X-Org-Slug');
}

export function currentAccessContext(): AccessContext {
  const admin = window.location.pathname.startsWith('/admin') ||
    new URLSearchParams(window.location.search).get('access') === 'organization' ||
    new URLSearchParams(window.location.search).get('access') === 'platform';
  return admin ? resolveTenantSlug() ? 'organization' : 'platform' : 'member';
}

export function sessionScope(context = currentAccessContext(), slug = resolveTenantSlug()): string {
  return `${context}_${context === 'platform' ? 'global' : slug ?? 'global'}`;
}

export function safeReturnTo(value: string | null): string | null {
  return value?.startsWith('/eventos/') && !value.includes('\\') && !value.includes('//') ? value : null;
}

export function withTenantQuery(path: string): string {
  const url = new URL(path, window.location.origin);
  url.searchParams.delete('org');
  const slug = resolveTenantSlug();
  if (slug && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    const tenantBasePath = `/o/${slug}`;
    if (url.pathname !== tenantBasePath && !url.pathname.startsWith(`${tenantBasePath}/`)) {
      url.pathname = `${tenantBasePath}${url.pathname}`;
    }
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

