import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrgUnitType {
  id: string;
  organization_id: string;
  slug: string;
  name: string;
  metadata_schema: Record<string, unknown>;
}

export interface OrgUnit {
  id: string;
  organization_id: string;
  parent_id?: string | null;
  type_id: string;
  type?: OrgUnitType;
  name: string;
  slug: string;
  metadata: Record<string, unknown>;
  status: string;
  children?: OrgUnit[];
}

export interface Position {
  id: string;
  organization_id: string;
  org_unit_type_id: string;
  org_unit_type?: OrgUnitType;
  name: string;
  investiture_type: 'ELECTION' | 'APPOINTMENT' | 'AUTOMATIC';
  mandate_duration_days?: number;
  allows_deputy: boolean;
  roles?: Array<{ id: string; name: string }>;
}

export interface Mandate {
  id: string;
  organization_id: string;
  position_id: string;
  position?: Position;
  org_unit_id: string;
  org_unit?: OrgUnit;
  member_id: string;
  member?: { id: string; name: string; email_personal: string; profile_picture_url?: string };
  start_date: string;
  end_date?: string;
  status: 'ACTIVE' | 'CLOSED' | 'REVOKED';
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const orgUnitService = {
  // Types
  async listTypes(): Promise<OrgUnitType[]> {
    const res = await api.get('/org/types');
    return res.data ?? [];
  },
  async createType(payload: { slug: string; name: string; metadata_schema?: Record<string, unknown> }): Promise<OrgUnitType> {
    const res = await api.post('/org/types', payload);
    return res.data;
  },
  async updateType(id: string, payload: { name?: string }): Promise<OrgUnitType> {
    const res = await api.patch(`/org/types/${id}`, payload);
    return res.data;
  },
  async deleteType(id: string): Promise<void> {
    await api.delete(`/org/types/${id}`);
  },

  // Units
  async getTree(): Promise<OrgUnit[]> {
    const res = await api.get('/org/units/tree');
    return res.data ?? [];
  },
  async listAll(): Promise<OrgUnit[]> {
    const res = await api.get('/org/units');
    return res.data ?? [];
  },
  async getById(id: string): Promise<OrgUnit> {
    const res = await api.get(`/org/units/${id}`);
    return res.data;
  },
  async create(payload: {
    type_id: string;
    name: string;
    slug?: string;
    parent_id?: string;
    metadata?: Record<string, unknown>;
  }): Promise<OrgUnit> {
    const res = await api.post('/org/units', payload);
    return res.data;
  },
  async update(id: string, payload: { name?: string; status?: string; parent_id?: string | null; metadata?: Record<string, unknown> }): Promise<OrgUnit> {
    const res = await api.patch(`/org/units/${id}`, payload);
    return res.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/org/units/${id}`);
  },
  async getMandatesByUnit(unitId: string): Promise<Mandate[]> {
    const res = await api.get(`/org/units/${unitId}/mandates`);
    return res.data ?? [];
  },

  // Positions
  async listPositions(): Promise<Position[]> {
    const res = await api.get('/org/positions');
    return res.data ?? [];
  },
  async createPosition(payload: {
    org_unit_type_id: string;
    name: string;
    investiture_type?: string;
    mandate_duration_days?: number;
    allows_deputy?: boolean;
  }): Promise<Position> {
    const res = await api.post('/org/positions', payload);
    return res.data;
  },
  async updatePosition(id: string, payload: Partial<{
    name: string;
    investiture_type: string;
    mandate_duration_days: number;
    allows_deputy: boolean;
  }>): Promise<Position> {
    const res = await api.patch(`/org/positions/${id}`, payload);
    return res.data;
  },
  async deletePosition(id: string): Promise<void> {
    await api.delete(`/org/positions/${id}`);
  },

  // Mandates
  async listMandates(): Promise<Mandate[]> {
    const res = await api.get('/org/mandates');
    return res.data ?? [];
  },
  async createMandate(payload: {
    position_id: string;
    org_unit_id: string;
    member_id: string;
    start_date: string;
    end_date?: string;
  }): Promise<Mandate> {
    const res = await api.post('/org/mandates', payload);
    return res.data;
  },
  async closeMandate(id: string): Promise<Mandate> {
    const res = await api.patch(`/org/mandates/${id}/close`);
    return res.data;
  },
  async revokeMandate(id: string): Promise<Mandate> {
    const res = await api.patch(`/org/mandates/${id}/revoke`);
    return res.data;
  },
  async getMandatesForMember(memberId: string): Promise<Mandate[]> {
    const res = await api.get(`/org/mandates/member/${memberId}`);
    return res.data ?? [];
  },
};
