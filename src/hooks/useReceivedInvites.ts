import { useCallback, useEffect, useState } from 'react';
import { inviteService } from '@/services/inviteService';
import type { MiscellaneousInvite } from '@/types/invite';
import { getEffectiveInviteStatus } from '@/utils/invite';

export function useReceivedInvites() {
  const [invites, setInvites] = useState<MiscellaneousInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inviteService.listReceivedInvites();
      setInvites(data);
    } catch {
      setError('Não foi possível carregar seus convites.');
      setInvites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pendingCount = invites.filter(
    invite => getEffectiveInviteStatus(invite) === 'pending'
  ).length;

  const pendingInvites = invites.filter(
    invite => getEffectiveInviteStatus(invite) === 'pending'
  );

  const historyInvites = invites.filter(
    invite => getEffectiveInviteStatus(invite) !== 'pending'
  );

  return {
    invites,
    pendingInvites,
    historyInvites,
    pendingCount,
    isLoading,
    error,
    refetch: load,
  };
}
