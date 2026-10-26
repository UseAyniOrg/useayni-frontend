import { api } from '@/lib/api';
import type { ExternalRegistrationField } from './miscellaneousService';

export interface ExternalProfileType {
  key: string;
  name: string;
  description: string;
  fields: ExternalRegistrationField[];
}

export const externalProfileService = {
  async publicTypes(): Promise<ExternalProfileType[]> {
    return (await api.get<ExternalProfileType[]>('/members/registration-profile-types')).data;
  },
  async listTypes(organizationId?: string): Promise<ExternalProfileType[]> {
    const response = await api.get<ExternalProfileType[]>(organizationId
      ? `/organizations/${organizationId}/external-profile-types` : '/org/external-profile-types');
    return response.data;
  },
  async saveTypes(profiles: ExternalProfileType[], organizationId?: string): Promise<ExternalProfileType[]> {
    const response = await api.put<ExternalProfileType[]>(organizationId
      ? `/organizations/${organizationId}/external-profile-types` : '/org/external-profile-types', profiles);
    return response.data;
  },
};
