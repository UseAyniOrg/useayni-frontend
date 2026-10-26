import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api';
import { resolveTenantSlug } from '@/lib/auth/accessContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TenantTheme {
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  bg_url?: string;
}

export interface TenantFeature {
  slug: string;
  config: Record<string, unknown>;
}

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  status: string;
  theme: TenantTheme;
  settings: Record<string, unknown>;
  plan: { id: string; name: string; slug: string } | null;
  features: TenantFeature[];
}

interface TenantContextType {
  tenant: TenantInfo | null;
  isLoading: boolean;
  error: string | null;
  errorKind: 'NOT_FOUND' | 'LOAD_FAILED' | null;
  isFeatureEnabled: (flag: string) => boolean;
  getFeatureConfig: (flag: string) => Record<string, unknown>;
  setTenant: (t: TenantInfo | null) => void;
  loadTenant: (slug: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Organization selection comes from the URL, never a previously visited tenant. */
function resolveSlug(): string | null {
  return resolveTenantSlug();
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenantState] = useState<TenantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<TenantContextType['errorKind']>(null);

  const setTenant = useCallback((t: TenantInfo | null) => {
    setTenantState(t);
    setError(null);
    setErrorKind(null);
    if (t) {
      localStorage.setItem('org_slug', t.slug);
      api.defaults.headers.common['X-Org-Slug'] = t.slug;
    } else {
      localStorage.removeItem('org_slug');
      delete api.defaults.headers.common['X-Org-Slug'];
    }
  }, []);

  const loadTenant = useCallback(
    async (slug: string) => {
      setIsLoading(true);
      setError(null);
      setErrorKind(null);
      try {
        const res = await api.get<TenantInfo>(`/public/tenant/${slug}`);
        setTenant(res.data);
      } catch (error: unknown) {
        setTenantState(null);
        delete api.defaults.headers.common['X-Org-Slug'];
        const response =
          typeof error === 'object' && error !== null && 'response' in error
            ? (error as {
                response?: {
                  status?: unknown;
                  data?: { message?: unknown };
                };
              }).response
            : undefined;
        const responseStatus = typeof response?.status === 'number' ? response.status : null;
        const responseMessage = response?.data?.message;
        const errorKind = responseStatus === 404 ? 'NOT_FOUND' : 'LOAD_FAILED';
        setErrorKind(errorKind);
        setError(
          typeof responseMessage === 'string'
            ? responseMessage
            : responseStatus === 404
              ? `A organização "${slug}" não foi encontrada ou não está disponível.`
              : responseStatus === null
                ? 'Não foi possível conectar à plataforma. Verifique se o serviço está disponível.'
                : 'Não foi possível carregar os dados da organização. Tente novamente.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant],
  );

  useEffect(() => {
    const slug = resolveSlug();
    if (slug) {
      loadTenant(slug);
    } else {
      setTenant(null);
      setIsLoading(false);
    }
  }, [loadTenant]);

  // Apply theme CSS variables whenever tenant changes
  useEffect(() => {
    if (!tenant?.theme) return;
    const root = document.documentElement;
    if (tenant.theme.primary_color) {
      root.style.setProperty('--brand-primary', tenant.theme.primary_color);
    }
    if (tenant.theme.secondary_color) {
      root.style.setProperty('--brand-secondary', tenant.theme.secondary_color);
    }
  }, [tenant]);

  const isFeatureEnabled = useCallback(
    (flag: string) => tenant?.features.some((f) => f.slug === flag) ?? false,
    [tenant],
  );

  const getFeatureConfig = useCallback(
    (flag: string): Record<string, unknown> =>
      tenant?.features.find((f) => f.slug === flag)?.config ?? {},
    [tenant],
  );

  return (
    <TenantContext.Provider
      value={{ tenant, isLoading, error, errorKind, isFeatureEnabled, getFeatureConfig, setTenant, loadTenant }}
    >
      {children}
    </TenantContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}
