import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { isAxiosError } from 'axios';

interface Role {
  id: string;
  name: string;
  description: string;
}

export interface MemberProfileData {
  id: string;
  name: string;
  phone?: string;
  ra?: string;
  profile_picture_url?: string;
  birth_date?: string;
  admission_date?: string;
  biography?: string;
  banner_url?: string;
  curriculum_url?: string;
  youtube_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  github_url?: string;
  slug?: string;
  status?: string;
  current_semester?: number | null;
  email_personal?: string;
  email_university?: string;
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
    profile_picture_url?: string;
  };
  roles?: Role[];
}

export interface MemberProfileEnrichment {
  slug?: string;
  status?: string;
  current_semester?: number | null;
  email_personal?: string;
  email_university?: string;
}

interface UseMemberProfileReturn {
  profile: MemberProfileData | null;
  enrichment: MemberProfileEnrichment | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function parseProfileError(err: unknown): Error {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    const message = err.response?.data?.message;

    if (status === 404) {
      return new Error('Membro não encontrado');
    }

    if (typeof message === 'string' && /not found|não encontrado/i.test(message)) {
      return new Error('Membro não encontrado');
    }

    if (typeof message === 'string') {
      return new Error(message);
    }

    if (Array.isArray(message)) {
      return new Error(message.join(', '));
    }
  }

  return err instanceof Error ? err : new Error('Falha ao carregar perfil');
}

export function useMemberProfile(
  slug: string | undefined,
  viewerId?: string
): UseMemberProfileReturn {
  const [profile, setProfile] = useState<MemberProfileData | null>(null);
  const [enrichment, setEnrichment] = useState<MemberProfileEnrichment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMemberProfile = useCallback(async () => {
    if (!slug) {
      setError(new Error('Slug não informado'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<MemberProfileData>(`/members/profile/${slug}`);
      setProfile(response.data);

      if (viewerId && response.data.id === viewerId) {
        try {
          const memberResponse = await api.get<MemberProfileEnrichment & { id: string }>(
            `/members/${viewerId}`
          );
          setEnrichment({
            slug: memberResponse.data.slug,
            status: memberResponse.data.status,
            current_semester: memberResponse.data.current_semester,
            email_personal: memberResponse.data.email_personal,
            email_university: memberResponse.data.email_university,
          });
        } catch {
          setEnrichment(null);
        }
      } else {
        setEnrichment(null);
      }
    } catch (err) {
      setProfile(null);
      setEnrichment(null);
      setError(parseProfileError(err));
    } finally {
      setIsLoading(false);
    }
  }, [slug, viewerId]);

  useEffect(() => {
    if (slug) {
      fetchMemberProfile();
    }
  }, [slug, fetchMemberProfile]);

  return {
    profile,
    enrichment,
    isLoading,
    error,
    refetch: fetchMemberProfile,
  };
}
