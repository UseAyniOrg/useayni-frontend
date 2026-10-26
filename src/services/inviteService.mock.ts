import type {
  MiscellaneousInvite,
  RejectInvitePayload,
  SendInvitePayload,
} from '@/types/invite';

const MOCK_MISC_ID = 'mock-misc-001';

let mockInvites: MiscellaneousInvite[] = [
  {
    id: 'invite-001',
    miscellaneousId: MOCK_MISC_ID,
    invitedByUserId: 'owner-001',
    invitedUserId: 'user-current',
    message: 'Venha participar da nossa reunião de planejamento!',
    status: 'pending',
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    miscellaneous: { id: MOCK_MISC_ID, title: 'Reunião de Planejamento Q2' },
    invitedByUser: { id: 'owner-001', name: 'Maria Silva', email: 'maria@example.com' },
  },
  {
    id: 'invite-002',
    miscellaneousId: 'misc-002',
    invitedByUserId: 'owner-002',
    invitedUserId: 'user-current',
    message: 'Projeto colaborativo entre CARs.',
    status: 'accepted',
    expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    miscellaneous: { id: 'misc-002', title: 'Projeto Colaborativo CAR' },
    invitedByUser: { id: 'owner-002', name: 'João Santos', email: 'joao@example.com' },
  },
  {
    id: 'invite-003',
    miscellaneousId: MOCK_MISC_ID,
    invitedByUserId: 'owner-001',
    invitedUserId: 'user-003',
    status: 'pending',
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    invitedUser: { id: 'user-003', name: 'Ana Costa', email: 'ana@example.com' },
  },
];

function delay(ms = 400): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const inviteMockService = {
  async listMiscInvites(miscId: string): Promise<MiscellaneousInvite[]> {
    await delay();
    return mockInvites.filter(invite => invite.miscellaneousId === miscId);
  },

  async listReceivedInvites(): Promise<MiscellaneousInvite[]> {
    await delay();
    return mockInvites.filter(invite => invite.invitedUserId === 'user-current');
  },

  async sendInvite(miscId: string, payload: SendInvitePayload): Promise<MiscellaneousInvite> {
    await delay();
    const duplicate = mockInvites.find(
      invite =>
        invite.miscellaneousId === miscId &&
        invite.invitedUserId === payload.invitedUserId &&
        invite.status === 'pending'
    );
    if (duplicate) {
      throw Object.assign(new Error('Já existe um convite pendente para este usuário nesta miscelânea.'), {
        response: { status: 400, data: { message: 'Já existe um convite pendente para este usuário nesta miscelânea.' } },
      });
    }

    const invite: MiscellaneousInvite = {
      id: `invite-${Date.now()}`,
      miscellaneousId: miscId,
      invitedByUserId: 'owner-001',
      invitedUserId: payload.invitedUserId,
      message: payload.message,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      invitedUser: {
        id: payload.invitedUserId,
        name: 'Usuário convidado',
        email: 'convidado@example.com',
      },
    };
    mockInvites = [invite, ...mockInvites];
    return invite;
  },

  async acceptInvite(miscId: string, inviteId: string): Promise<MiscellaneousInvite> {
    await delay();
    const invite = mockInvites.find(i => i.id === inviteId && i.miscellaneousId === miscId);
    if (!invite) {
      throw Object.assign(new Error('Convite não encontrado.'), {
        response: { status: 404, data: { message: 'Convite não encontrado.' } },
      });
    }
    if (invite.status === 'expired' || new Date(invite.expiresAt) < new Date()) {
      throw Object.assign(new Error('Este convite expirou.'), {
        response: { status: 400, data: { message: 'Este convite expirou.' } },
      });
    }
    if (invite.status !== 'pending') {
      throw Object.assign(new Error('Este convite não está mais pendente.'), {
        response: { status: 400, data: { message: 'Este convite não está mais pendente.' } },
      });
    }
    invite.status = 'accepted';
    invite.respondedAt = new Date().toISOString();
    return invite;
  },

  async rejectInvite(
    miscId: string,
    inviteId: string,
    payload?: RejectInvitePayload
  ): Promise<MiscellaneousInvite> {
    await delay();
    const invite = mockInvites.find(i => i.id === inviteId && i.miscellaneousId === miscId);
    if (!invite) {
      throw Object.assign(new Error('Convite não encontrado.'), {
        response: { status: 404, data: { message: 'Convite não encontrado.' } },
      });
    }
    if (invite.status !== 'pending') {
      throw Object.assign(new Error('Este convite não está mais pendente.'), {
        response: { status: 400, data: { message: 'Este convite não está mais pendente.' } },
      });
    }
    invite.status = 'rejected';
    invite.rejectionReason = payload?.rejectionReason;
    invite.respondedAt = new Date().toISOString();
    return invite;
  },

  async cancelInvite(miscId: string, inviteId: string): Promise<void> {
    await delay();
    const invite = mockInvites.find(i => i.id === inviteId && i.miscellaneousId === miscId);
    if (!invite) {
      throw Object.assign(new Error('Convite não encontrado.'), {
        response: { status: 404, data: { message: 'Convite não encontrado.' } },
      });
    }
    if (invite.status !== 'pending') {
      throw Object.assign(new Error('Apenas convites pendentes podem ser cancelados.'), {
        response: { status: 400, data: { message: 'Apenas convites pendentes podem ser cancelados.' } },
      });
    }
    invite.status = 'cancelled';
    invite.respondedAt = new Date().toISOString();
  },
};
