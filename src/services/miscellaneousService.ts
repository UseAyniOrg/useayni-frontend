import { api } from '@/lib/api';

export type MiscType = 'project' | 'event' | 'goal' | 'meeting' | 'activity' | 'form';
export type MiscStatus = 'draft' | 'pending_approval' | 'under_review' | 'active' | 'rejected' | 'archived';
export type MiscParticipation = 'public' | 'private';
export type MiscVisibility = 'public' | 'private';

export interface ScopeRule {
  type: 'general' | 'cae' | 'car' | 'city' | 'university' | 'course' | 'semester';
  cae_id?: string;
  car_id?: string;
  city_id?: string;
  university_id?: string;
  course_id?: string;
  semester?: number;
  // display labels (frontend only, not sent to backend)
  _label?: string;
}

export interface Miscellaneous {
  id: string;
  title: string;
  description: string;
  type: MiscType;
  status: MiscStatus;
  participation_type: MiscParticipation;
  scope_rules?: ScopeRule[];
  max_participants?: number;
  start_date: string;
  end_date?: string;
  cover_url?: string;
  banner_url?: string;
  public_slug?: string;
  public_access_enabled: boolean;
  parent_id?: string;
  visibility?: MiscVisibility;
  created_by: string;
  created_at: string;
  stream_link?: string;
  capacity_presential?: number;
  capacity_online?: number;
  meeting_link?: string;
  agenda?: string;
  goal_target?: number;
  goal_unit?: string;
  goal_progress?: number;
  activity_status?: string;
  activity_priority?: string;
  registration_start_date?: string;
  registration_end_date?: string;
  max_members?: number;
  waitlist_enabled: boolean;
}

export interface MiscFilters {
  type?: MiscType;
  status?: MiscStatus;
  myRole?: 'owner' | 'participant' | 'creator';
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export const miscellaneousService = {
  async create(data: Record<string, unknown>) {
    const res = await api.post('/miscellaneous', data);
    return res.data;
  },

  async list(filters: MiscFilters = {}) {
    const res = await api.get('/miscellaneous', { params: filters });
    return res.data as { data: Miscellaneous[]; total: number };
  },

  async getById(id: string) {
    const res = await api.get(`/miscellaneous/${id}`);
    return res.data as Miscellaneous;
  },

  async update(id: string, data: Record<string, unknown>) {
    const res = await api.patch(`/miscellaneous/${id}`, data);
    return res.data;
  },

  async archive(id: string) {
    const res = await api.patch(`/miscellaneous/${id}/archive`);
    return res.data;
  },

  async remove(id: string) {
    await api.delete(`/miscellaneous/${id}`);
  },

  async getChildren(id: string) {
    const res = await api.get(`/miscellaneous/${id}/children`);
    return res.data as Record<string, Miscellaneous[]>;
  },

  async getPeople(id: string) {
    const res = await api.get(`/miscellaneous/${id}/people`);
    return res.data;
  },

  async addOwner(id: string, memberId: string) {
    const res = await api.post(`/miscellaneous/${id}/owners`, { member_id: memberId });
    return res.data;
  },

  async removeOwner(id: string, userId: string) {
    await api.delete(`/miscellaneous/${id}/owners/${userId}`);
  },

  async addMember(id: string, memberId: string) {
    const res = await api.post(`/miscellaneous/${id}/members`, { member_id: memberId });
    return res.data;
  },

  async removeMember(id: string, userId: string) {
    await api.delete(`/miscellaneous/${id}/members/${userId}`);
  },

  async approve(id: string, comment?: string) {
    const res = await api.patch(`/miscellaneous/${id}/approve`, { comment });
    return res.data;
  },

  async reject(id: string, comment?: string) {
    const res = await api.patch(`/miscellaneous/${id}/reject`, { comment });
    return res.data;
  },

  async requestReview(id: string, comment?: string) {
    const res = await api.patch(`/miscellaneous/${id}/request-review`, { comment });
    return res.data;
  },

  async getApprovalHistory(id: string) {
    const res = await api.get(`/miscellaneous/${id}/approval-history`);
    return res.data;
  },

  async getPendingApprovals() {
    const res = await api.get('/approvals/pending');
    return res.data as Miscellaneous[];
  },

  async createRequest(id: string, data: { title: string; message: string }) {
    const res = await api.post(`/miscellaneous/${id}/requests`, data);
    return res.data;
  },

  async listRequests(id: string) {
    const res = await api.get(`/miscellaneous/${id}/requests`);
    return res.data;
  },

  async reviewRequest(id: string, requestId: string, data: { status: 'approved' | 'rejected'; response_message?: string }) {
    const res = await api.patch(`/miscellaneous/${id}/requests/${requestId}`, data);
    return res.data;
  },

  async createInvite(id: string, data: { invited_user_id: string; message?: string }) {
    const res = await api.post(`/miscellaneous/${id}/invites`, data);
    return res.data;
  },

  async listInvites(id: string) {
    const res = await api.get(`/miscellaneous/${id}/invites`);
    return res.data;
  },

  async acceptInvite(id: string, inviteId: string) {
    const res = await api.patch(`/miscellaneous/${id}/invites/${inviteId}/accept`);
    return res.data;
  },

  async rejectInvite(id: string, inviteId: string, rejection_reason?: string) {
    const res = await api.patch(`/miscellaneous/${id}/invites/${inviteId}/reject`, { rejection_reason });
    return res.data;
  },

  async cancelInvite(id: string, inviteId: string) {
    await api.delete(`/miscellaneous/${id}/invites/${inviteId}`);
  },

  async getMyInvites() {
    const res = await api.get('/invites/mine');
    return res.data;
  },

  async joinWaitlist(id: string) {
    const res = await api.post(`/miscellaneous/${id}/waitlist/join`);
    return res.data;
  },

  async joinMiscellaneous(id: string) {
    const res = await api.post(`/miscellaneous/${id}/join`);
    return res.data;
  },

  async getWaitlist(id: string) {
    const res = await api.get(`/miscellaneous/${id}/waitlist`);
    return res.data;
  },

  async promoteFromWaitlist(id: string, userId: string) {
    const res = await api.post(`/miscellaneous/${id}/waitlist/promote/${userId}`);
    return res.data;
  },

  async closeRegistrations(id: string) {
    const res = await api.post(`/miscellaneous/${id}/registrations/close`);
    return res.data;
  },

  async enablePublicAccess(id: string) {
    const res = await api.post(`/miscellaneous/${id}/public-access/enable`);
    return res.data as { slug: string; url: string };
  },

  async disablePublicAccess(id: string) {
    const res = await api.post(`/miscellaneous/${id}/public-access/disable`);
    return res.data;
  },

  async createAttendanceSession(miscId: string, data: { title: string; mode: string; starts_at: string; ends_at: string }) {
    const res = await api.post(`/miscellaneous/${miscId}/attendance-sessions`, data);
    return res.data;
  },

  async listAttendanceSessions(miscId: string) {
    const res = await api.get(`/miscellaneous/${miscId}/attendance-sessions`);
    return res.data;
  },

  async getAttendanceToken(sessionId: string) {
    const res = await api.get(`/attendance-sessions/${sessionId}/token`);
    return res.data;
  },

  async checkInByQr(sessionId: string, token: string) {
    const res = await api.post(`/attendance-sessions/${sessionId}/check-in`, { token });
    return res.data;
  },

  async manualCheckIn(sessionId: string, userId: string, present: boolean) {
    const res = await api.patch(`/attendance-sessions/${sessionId}/records/${userId}`, { present });
    return res.data;
  },

  async getAttendanceRecords(sessionId: string) {
    const res = await api.get(`/attendance-sessions/${sessionId}/records`);
    return res.data;
  },
};
