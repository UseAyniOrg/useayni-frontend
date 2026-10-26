export type InviteStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';

export interface InviteUserSummary {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface InviteMiscellaneousSummary {
  id: string;
  title: string;
}

export interface MiscellaneousInvite {
  id: string;
  miscellaneousId: string;
  invitedByUserId: string;
  invitedUserId: string;
  message?: string;
  status: InviteStatus;
  rejectionReason?: string;
  expiresAt: string;
  respondedAt?: string;
  createdAt: string;
  invitedUser?: InviteUserSummary;
  invitedByUser?: InviteUserSummary;
  miscellaneous?: InviteMiscellaneousSummary;
}

export interface SendInvitePayload {
  invitedUserId: string;
  message?: string;
}

export interface RejectInvitePayload {
  rejectionReason?: string;
}

export interface MemberSearchResult {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}
