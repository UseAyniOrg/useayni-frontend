import { api } from '@/lib/api';

export interface PendingMember {
  id: string;
  name: string;
  email_personal: string;
  email_university: string;
  phone: string;
  cpf: string;
  ra: string;
  birth_date: string;
  admission_date: string;
  registration_status: 'approved' | 'pending' | 'rejected';
  city?: { id: string; name: string };
  memberCourses?: Array<{
    status: string;
    courseUniversity?: {
      course?: { id: string; name: string };
      university?: { id: string; name: string };
    };
  }>;
}

export interface ApprovalResponse {
  message: string;
  member?: PendingMember;
  memberId?: string;
}

export const memberApprovalService = {
  // busca só os pendentes que o revisor tem permissão de ver
  // o back já faz o filtro por área (CAE, CAR, etc)
  async getPendingMembers(): Promise<PendingMember[]> {
    const response = await api.get<PendingMember[]>('/members/pending');
    return response.data;
  },

  // aprova o membro, o back libera o acesso dele
  async approveMember(memberId: string): Promise<ApprovalResponse> {
    const response = await api.patch<ApprovalResponse>(
      `/members/${memberId}/approve`
    );
    return response.data;
  },

  // recusa e deleta o cadastro — pode se inscrever de novo se quiser
  async rejectMember(memberId: string, reason?: string): Promise<ApprovalResponse> {
    const response = await api.patch<ApprovalResponse>(
      `/members/${memberId}/reject`,
      { reason }
    );
    return response.data;
  },
};