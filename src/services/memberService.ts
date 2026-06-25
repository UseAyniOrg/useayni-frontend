import { api } from '@/lib/api';

export interface MemberSearchResult {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export const memberService = {
  async search(query: string): Promise<MemberSearchResult[]> {
    if (!query.trim()) return [];
    const res = await api.get('/members/search', { params: { q: query, limit: 10 } });
    return res.data?.data ?? res.data ?? [];
  },
};
