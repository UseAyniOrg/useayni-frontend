import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Role {
  id: string;
  name: string;
  description: string;
}

interface MemberProfileData {
  id: string;
  name: string;
  phone: string;
  ra: string;
  profile_picture_url?: string;
  birth_date: Date;
  admission_date: Date;
  biography?: string;
  banner_url?: string;
  curriculum_url?: string;
  youtube_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  github_url?: string;
  course?: {
    id: string;
    name: string;
  };
  city?: {
    id: string;
    name: string;
  };
  university?: {
    id: string;
    name: string;
  };
  sponsor?: {
    id: string;
    name: string;
  };
  roles?: Role[];
}

interface UseMemberProfileReturn {
  profile: MemberProfileData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMemberProfile(slug: string | undefined): UseMemberProfileReturn {
  const [profile, setProfile] = useState<MemberProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMemberProfile = async () => {
    if (!slug) {
      setError(new Error('Slug is not provided'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<MemberProfileData>(
        `/members/profile/${slug}`
      );
      setProfile(response.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch member profile');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchMemberProfile();
    }
  }, [slug]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchMemberProfile,
  };
}
