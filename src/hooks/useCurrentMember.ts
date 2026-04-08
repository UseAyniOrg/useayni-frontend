import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthContext } from '@/contexts/AuthContext';

interface CurrentMemberData {
  id: string;
  name: string;
  phone?: string;
  email_personal?: string;
  email_university?: string;
  ra?: string;
  profile_picture_url?: string;
  birth_date?: string;
  city_id?: string;
  admission_date?: string;
  sponsor?: string;
  biography?: string;
  banner_url?: string;
  curriculum_url?: string;
  youtube_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  github_url?: string;
  slug?: string;
}

export function useCurrentMember() {
  const [member, setMember] = useState<CurrentMemberData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthContext();

  const fetchCurrentMember = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<CurrentMemberData>(`/members/${user.id}`);
      setMember(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch current member'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchCurrentMember();
  }, [user?.id]);

  return { member, isLoading, error, refetch: fetchCurrentMember };
}
