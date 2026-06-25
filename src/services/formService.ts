import { api } from '@/lib/api';

export interface FormQuestionPayload {
  type: 'text' | 'long_text' | 'single' | 'multiple' | 'select' | 'scale' | 'date' | 'yes_no';
  title: string;
  description?: string;
  required?: boolean;
  scale_min?: number;
  scale_max?: number;
  options?: Array<{ label: string }>;
}

export const formService = {
  async createForm(data: Record<string, unknown>) {
    const res = await api.post('/forms', data);
    return res.data;
  },

  async getForm(id: string) {
    const res = await api.get(`/forms/${id}`);
    return res.data;
  },

  async addQuestion(formId: string, data: FormQuestionPayload) {
    const res = await api.post(`/forms/${formId}/questions`, data);
    return res.data;
  },

  async reorderQuestions(formId: string, questionIds: string[]) {
    const res = await api.patch(`/forms/${formId}/questions/reorder`, { question_ids: questionIds });
    return res.data;
  },
};
