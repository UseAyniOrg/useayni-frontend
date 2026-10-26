import { api } from '@/lib/api';
import type {
  MiscellaneousInvite,
  RejectInvitePayload,
  SendInvitePayload,
} from '@/types/invite';
import { inviteMockService } from './inviteService.mock';

const useMock = import.meta.env.VITE_USE_MOCK_INVITES === 'true';

export const inviteService = {
  async listMiscInvites(miscId: string): Promise<MiscellaneousInvite[]> {
    if (useMock) return inviteMockService.listMiscInvites(miscId);
    const response = await api.get<MiscellaneousInvite[]>(`/miscellaneous/${miscId}/invites`);
    return response.data;
  },

  async listReceivedInvites(): Promise<MiscellaneousInvite[]> {
    if (useMock) return inviteMockService.listReceivedInvites();
    const response = await api.get<MiscellaneousInvite[]>('/members/me/invites');
    return response.data;
  },

  async sendInvite(miscId: string, payload: SendInvitePayload): Promise<MiscellaneousInvite> {
    if (useMock) return inviteMockService.sendInvite(miscId, payload);
    const response = await api.post<MiscellaneousInvite>(
      `/miscellaneous/${miscId}/invites`,
      payload
    );
    return response.data;
  },

  async acceptInvite(miscId: string, inviteId: string): Promise<MiscellaneousInvite> {
    if (useMock) return inviteMockService.acceptInvite(miscId, inviteId);
    const response = await api.patch<MiscellaneousInvite>(
      `/miscellaneous/${miscId}/invites/${inviteId}/accept`
    );
    return response.data;
  },

  async rejectInvite(
    miscId: string,
    inviteId: string,
    payload?: RejectInvitePayload
  ): Promise<MiscellaneousInvite> {
    if (useMock) return inviteMockService.rejectInvite(miscId, inviteId, payload);
    const response = await api.patch<MiscellaneousInvite>(
      `/miscellaneous/${miscId}/invites/${inviteId}/reject`,
      payload ?? {}
    );
    return response.data;
  },

  async cancelInvite(miscId: string, inviteId: string): Promise<void> {
    if (useMock) return inviteMockService.cancelInvite(miscId, inviteId);
    await api.delete(`/miscellaneous/${miscId}/invites/${inviteId}`);
  },
};
