import { api } from '@/lib/api';

export interface StateOption {
  id: string;
  name: string;
  uf: string;
}

export interface CityOption {
  id: string;
  name: string;
  state_id: string;
}

export interface UniversityOption {
  id: string;
  name: string;
  acronym?: string | null;
  city_id?: string | null;
}

export interface CourseUniversityOption {
  id: string;
  course_id: string;
  university_id: string;
  city_id: string;
}

export interface CourseOption {
  id: string;
  name: string;
  courseUniversities?: CourseUniversityOption[];
}

export const academicService = {
  async getStates() {
    const response = await api.get<StateOption[]>('/states');
    return response.data;
  },

  async getCitiesByState(stateId: string) {
    const response = await api.get<CityOption[]>('/cities', {
      params: { stateId },
    });
    return response.data;
  },

  async getUniversities(params?: {
    q?: string;
    stateId?: string;
    stateUf?: string;
    cityId?: string;
  }) {
    const response = await api.get<UniversityOption[]>('/universities', {
      params,
    });
    return response.data;
  },

  async getCoursesByUniversity(universityId: string, cityId?: string) {
    const response = await api.get<CourseOption[]>('/courses', {
      params: { universityId, cityId },
    });
    return response.data;
  },
};
