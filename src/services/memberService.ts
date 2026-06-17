import { api } from '@/lib/api';

/** Membro simplificado para seleção/exibição. */
export interface MemberOption {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
}

interface MemberListResponse {
  id: string;
  name: string;
  slug?: string | null;
  profile_picture_url?: string | null;
}

const mapMember = (member: MemberListResponse): MemberOption => ({
  id: member.id,
  name: member.name,
  slug: member.slug || '',
  avatar: member.profile_picture_url || undefined,
});

/** Lista todos os membros (GET /members) para uso em seletores de busca. */
export async function listMembers(): Promise<MemberOption[]> {
  const { data } = await api.get<MemberListResponse[]>('/members');
  return data.map(mapMember);
}
