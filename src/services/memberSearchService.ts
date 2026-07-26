import { api } from '@/lib/api';
import type { MemberSearchResult } from '@/types/invite';

export type MemberSearchMode = 'name' | 'email';

interface MemberApiRecord {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email_personal?: string;
  email_university?: string;
  profile_picture_url?: string | null;
}

const MOCK_MEMBERS: MemberSearchResult[] = [
  { id: 'user-101', name: 'Pedro Oliveira', email: 'pedro@example.com' },
  { id: 'user-102', name: 'Carla Mendes', email: 'carla.mendes@utfpr.edu.br' },
  { id: 'user-103', name: 'Lucas Ferreira', email: 'lucas@example.com' },
  { id: 'user-104', name: 'Fernanda Lima', email: 'fernanda.lima@utfpr.edu.br' },
  { id: 'user-105', name: 'Ricardo Alves', email: 'ricardo@example.com' },
];

function mapMember(record: MemberApiRecord): MemberSearchResult {
  const name =
    record.name ||
    [record.first_name, record.last_name].filter(Boolean).join(' ') ||
    'Membro';
  return {
    id: record.id,
    name,
    email: record.email_personal || record.email_university,
    avatar: record.profile_picture_url || undefined,
  };
}

function filterMembers(
  members: MemberSearchResult[],
  query: string,
  mode: MemberSearchMode
): MemberSearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return members.filter(member => {
    if (mode === 'email') {
      return member.email?.toLowerCase().includes(normalized) ?? false;
    }
    return member.name.toLowerCase().includes(normalized);
  });
}

const useMock = import.meta.env.VITE_USE_MOCK_INVITES === 'true';

export const memberSearchService = {
  async searchMembers(query: string, mode: MemberSearchMode): Promise<MemberSearchResult[]> {
    if (!query.trim()) return [];

    if (useMock) {
      return filterMembers(MOCK_MEMBERS, query, mode);
    }

    try {
      const response = await api.get<MemberSearchResult[]>('/members/search', {
        params: { q: query.trim(), type: mode },
      });
      return response.data;
    } catch {
      const fallback = await api.get<MemberApiRecord[]>('/members');
      return filterMembers(fallback.data.map(mapMember), query, mode);
    }
  },
};
