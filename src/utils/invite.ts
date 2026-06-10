import type { InviteStatus, MiscellaneousInvite } from '@/types/invite';

export const INVITE_STATUS_LABELS: Record<InviteStatus, string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  rejected: 'Recusado',
  cancelled: 'Cancelado',
  expired: 'Expirado',
};

export function isInviteExpired(invite: MiscellaneousInvite): boolean {
  if (invite.status === 'expired') return true;
  if (invite.status !== 'pending') return false;
  return new Date(invite.expiresAt) < new Date();
}

export function formatInviteDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

export function getEffectiveInviteStatus(invite: MiscellaneousInvite): InviteStatus {
  if (isInviteExpired(invite)) return 'expired';
  return invite.status;
}
