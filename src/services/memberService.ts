import { api } from '@/lib/api';

export interface MemberSearchResult {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface PendingMember {
  id: string;
  name: string;
  email_personal: string;
  email_university: string;
  phone: string;
  ra: string;
  cpf?: string;
  birth_date: string;
  admission_date: string;
  current_semester?: number;
  profile_picture_url?: string;
  city?: { id: string; name: string };
  memberCourses?: Array<{
    status: string;
    courseUniversity?: {
      course?: { id: string; name: string };
      university?: { id: string; name: string };
    };
  }>;
}

export const memberService = {
  async search(query: string): Promise<MemberSearchResult[]> {
    if (!query.trim()) return [];
    const res = await api.get('/members/search', { params: { q: query, limit: 10 } });
    return res.data?.data ?? res.data ?? [];
  },

  async getPendingMembers(): Promise<PendingMember[]> {
    const res = await api.get('/members/pending');
    return res.data ?? [];
  },

  async approve(id: string): Promise<void> {
    await api.patch(`/members/${id}/approve`);
  },

  async reject(id: string, reason?: string): Promise<void> {
    await api.patch(`/members/${id}/reject`, { reason });
  },

  async editAndApprove(id: string, data: Partial<PendingMember>): Promise<void> {
    await api.patch(`/members/${id}/approve-with-edit`, data);
  },
};
