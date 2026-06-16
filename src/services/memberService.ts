import { api } from '@/lib/api';

export interface Member {
  id: string;
  name: string;
  slug?: string;
  email_personal: string;
  email_university: string;
  phone?: string;
  ra: string;
  profile_picture_url?: string;
  registration_status: 'PENDING' | 'APPROVED' | 'REJECTED';
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
  async getAll(): Promise<Member[]> {
    const response = await api.get<Member[]>('/members');
    return response.data;
  },
};
