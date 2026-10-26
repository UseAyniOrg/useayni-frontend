import { api } from '@/lib/api';

export type OrgHomeSectionType =
  | 'HERO'
  | 'CAMINHOS'
  | 'VANTAGENS'
  | 'NUMEROS'
  | 'SOBRE_HISTORIA'
  | 'AGENDA'
  | 'NOTICIAS'
  | 'PUBLICACOES'
  | 'ESPACOS_SERVICOS'
  | 'PROGRAMAS_NUCLEOS'
  | 'MIDIA'
  | 'DIRETORIA'
  | 'PARCEIROS'
  | 'TALENTOS'
  | 'CONTATO'
  | 'FAQ'
  | 'CTA_FINAL'
  | 'TEXTO_LIVRE';

export interface OrgHomeSection {
  id?: string;
  type: OrgHomeSectionType;
  order_index: number;
  enabled: boolean;
  title: string;
  subtitle: string;
  config: Record<string, unknown>;
}

export interface OrgHomeConfig {
  organization_id: string;
  status: 'DRAFT' | 'PUBLISHED';
  theme: {
    primary_color: string;
    secondary_color: string;
    background_color?: string;
    logo_background_color?: string;
    logo_asset_id?: string | null;
    favicon_asset_id?: string | null;
    logo_url?: string | null;
    favicon_url?: string | null;
    font_family?: string;
  };
  seo: {
    title?: string;
    description?: string;
    og_image_asset_id?: string | null;
    og_image_url?: string | null;
  };
  social_links: Record<string, string>;
  contact: {
    address?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    map_url?: string;
  };
  published_at?: string | null;
  updated_by?: string | null;
}

export interface OrgHomeEditorData {
  config: OrgHomeConfig;
  sections: OrgHomeSection[];
}

export interface OrgHomePublicData {
  organization: { id: string; name: string; slug: string };
  config: OrgHomeConfig;
  sections: Array<OrgHomeSection & {
    items?: Array<Record<string, unknown>>;
    show_button?: boolean;
  }>;
  features: string[];
}

export const orgHomeService = {
  async getPublic(slug: string): Promise<OrgHomePublicData> {
    const response = await api.get(`/public/org-home/${encodeURIComponent(slug)}`);
    return response.data;
  },

  async getEditor(organizationId?: string): Promise<OrgHomeEditorData> {
    const path = organizationId
      ? `/org-home/admin/organizations/${organizationId}`
      : '/org-home/admin';
    const response = await api.get(path);
    return response.data;
  },

  async saveDraft(data: Omit<OrgHomeEditorData, 'config'> & {
    config: Omit<OrgHomeConfig, 'organization_id' | 'status' | 'published_at' | 'updated_by'>;
  }, organizationId?: string): Promise<OrgHomeEditorData> {
    const path = organizationId
      ? `/org-home/admin/organizations/${organizationId}`
      : '/org-home/admin';
    const sections = data.sections.map(({ id, type, order_index, enabled, title, subtitle, config }) => ({
      ...(id ? { id } : {}),
      type,
      order_index,
      enabled,
      title,
      subtitle,
      config,
    }));
    const response = await api.put(path, { ...data.config, sections });
    return response.data;
  },

  async publish(organizationId?: string): Promise<OrgHomeConfig> {
    const path = organizationId
      ? `/org-home/admin/organizations/${organizationId}/publish`
      : '/org-home/admin/publish';
    const response = await api.post(path);
    return response.data;
  },
};
