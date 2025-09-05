import api from '@/api';

const BASE_URL = '/api/industry';

export type IndustryTag = {
  id: string;
  label: string;
  codes: string[];
};

export const industryApi = {
  /** 산업 태그 목록 조회 */
  async fetchTags(): Promise<IndustryTag[]> {
    const { data } = await api.get<IndustryTag[]>(`${BASE_URL}/catalog/tags`);
    return data;
  },
};

export default industryApi;
