import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_brl: number;
  is_active: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  onboarding_step: number;
  suspension_reason?: string | null;
  suspended_at?: string | null;
  plan?: Plan;
  theme: Record<string, string>;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface OrgFeature {
  organization_id: string;
  feature_slug: string;
  enabled: boolean;
  config: Record<string, unknown>;
  updated_at: string;
}

export interface FeatureDefinition {
  slug: string;
  name: string;
  description: string;
  category: string;
  available: boolean;
  required?: boolean;
  requires?: string[];
}

export interface OrganizationAuditEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  created_at: string;
  actor_id: string | null;
  actor_account_id: string | null;
  actor_email: string | null;
  actor_name: string | null;
  actor_type: string | null;
}

export interface CreateOrganizationPayload {
  name: string;
  slug: string;
  plan_id?: string;
  theme?: Record<string, string>;
  settings?: Record<string, unknown>;
}

export interface UpsertFeaturePayload {
  feature_slug: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface RegistrationFieldDefinition {
  id: string;
  organization_id: string;
  field_key: string;
  label: string;
  field_type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'file';
  required: boolean;
  options?: string[] | null;
  position: number;
}

export type RegistrationFieldInput = Omit<RegistrationFieldDefinition, 'id' | 'organization_id'>;

export interface ProvisionedAccess {
  invitation_id?: string;
  delivery_status?: string;
  member_id?: string;
  email: string;
  password_change_required?: boolean;
  existing_account?: boolean;
  role?: string;
  message?: string;
  error?: string;
}

export interface HierarchyTemplate {
  version: 1;
  slug: string;
  name: string;
  description: string;
  organization_profile: string;
  types: Array<{ slug: string; name: string }>;
  units: Array<{ slug: string; name: string; type_slug: string; parent_slug?: string }>;
  positions: Array<{
    name: string;
    type_slug: string;
    investiture_type: 'ELECTION' | 'APPOINTMENT' | 'AUTOMATIC';
    mandate_duration_days?: number;
    allows_deputy?: boolean;
  }>;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const organizationService = {
  async getHierarchyTemplates(): Promise<HierarchyTemplate[]> {
    const res = await api.get('/organizations/hierarchy-templates');
    return res.data;
  },

  async importHierarchy(id: string, template: unknown): Promise<{ types: number; units: number; positions: number }> {
    const res = await api.post(`/organizations/${id}/hierarchy/import`, template);
    return res.data;
  },

  async listAll(): Promise<Organization[]> {
    const res = await api.get('/organizations');
    return res.data ?? [];
  },

  async getById(id: string): Promise<Organization> {
    const res = await api.get(`/organizations/${id}`);
    return res.data;
  },

  async create(payload: CreateOrganizationPayload): Promise<Organization> {
    const res = await api.post('/organizations', payload);
    return res.data;
  },

  async update(id: string, payload: Partial<CreateOrganizationPayload & {
    status: string;
    suspension_reason: string;
    onboarding_step: number;
  }>): Promise<Organization> {
    const res = await api.patch(`/organizations/${id}`, payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/organizations/${id}`);
  },

  async getFeatures(id: string): Promise<OrgFeature[]> {
    const res = await api.get(`/organizations/${id}/features`);
    return res.data ?? [];
  },

  async getFeatureCatalog(): Promise<FeatureDefinition[]> {
    const res = await api.get('/organizations/feature-catalog');
    return res.data ?? [];
  },

  async getAuditHistory(id: string): Promise<OrganizationAuditEntry[]> {
    const res = await api.get(`/organizations/${id}/audit`);
    return res.data ?? [];
  },

  async setFeature(id: string, payload: UpsertFeaturePayload): Promise<OrgFeature> {
    const res = await api.patch(`/organizations/${id}/features`, payload);
    return res.data;
  },

  async getPlans(): Promise<Plan[]> {
    const res = await api.get('/organizations/plans');
    return res.data ?? [];
  },

  async grantAdmin(id: string, email: string): Promise<{ member_id: string; email: string }> {
    const res = await api.post(`/organizations/${id}/admins`, { email });
    return res.data;
  },

  async issueAdminAccess(id: string, email: string): Promise<ProvisionedAccess> {
    const res = await api.post(`/organizations/${id}/admin-access`, { email });
    return res.data;
  },

  async importMembers(id: string, emails: string[]): Promise<{ results: ProvisionedAccess[] }> {
    const res = await api.post(`/organizations/${id}/members/import`, { emails });
    return res.data;
  },

  async issueMemberAccess(id: string, email: string): Promise<ProvisionedAccess> {
    const res = await api.post(`/organizations/${id}/member-access`, { email });
    return res.data;
  },

  async getRegistrationFields(id?: string): Promise<RegistrationFieldDefinition[]> {
    const path = id ? `/organizations/${id}/registration-fields` : '/members/custom-fields';
    const res = await api.get(path);
    return res.data ?? [];
  },

  async createRegistrationField(input: RegistrationFieldInput, id?: string): Promise<RegistrationFieldDefinition> {
    const path = id ? `/organizations/${id}/registration-fields` : '/members/custom-fields';
    const res = await api.post(path, input);
    return res.data;
  },

  async updateRegistrationField(
    fieldKey: string,
    input: Partial<RegistrationFieldInput>,
    id?: string,
  ): Promise<RegistrationFieldDefinition> {
    const basePath = id ? `/organizations/${id}/registration-fields` : '/members/custom-fields';
    const res = await api.patch(`${basePath}/${encodeURIComponent(fieldKey)}`, input);
    return res.data;
  },

  async deleteRegistrationField(fieldKey: string, id?: string): Promise<void> {
    const basePath = id ? `/organizations/${id}/registration-fields` : '/members/custom-fields';
    await api.delete(`${basePath}/${encodeURIComponent(fieldKey)}`);
  },
};
