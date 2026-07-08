import { useAuthContext } from '@/contexts/AuthContext';
import type { ProfilePersona } from '../types/profile';

export function useProfilePersona(profileMemberId: string | undefined): ProfilePersona {
  const { user, isTechTeam } = useAuthContext();

  if (!profileMemberId || !user?.id) return 'visitor';
  if (isTechTeam) return 'admin';
  if (user.id === profileMemberId) return 'owner';
  return 'visitor';
}

export function isProfileOwner(persona: ProfilePersona): boolean {
  return persona === 'owner' || persona === 'admin';
}
