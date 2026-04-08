import { useAuthContext } from '@/contexts/AuthContext';

export function useRolesAndPermissions() {
  const { user, isTechTeam, isExternal, hasPosition } = useAuthContext();

  return {
    data: {
      memberId: user?.id ?? '',
      memberName: user?.name ?? '',
      roles: user?.roles ?? [],
      positions: user?.positions ?? [],
    },
    isLoading: false,
    isTechTeam,
    isExternal,
    hasPosition,
  };
}
