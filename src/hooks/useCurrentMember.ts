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
  course_id?: string;
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

interface UseCurrentMemberReturn {
  member: CurrentMemberData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCurrentMember(): UseCurrentMemberReturn {
  const [member, setMember] = useState<CurrentMemberData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { memberId } = useAuthContext();

  const fetchCurrentMember = async () => {
    if (!memberId) {
      setError(new Error('Member ID is not provided'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<CurrentMemberData>(
        `/members/${memberId}`
      );
      setMember(response.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch current member');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      fetchCurrentMember();
    }
  }, [memberId]);

  return {
    member,
    isLoading,
    error,
    refetch: fetchCurrentMember,
  };
}
