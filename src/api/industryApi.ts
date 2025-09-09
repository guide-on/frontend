import api from '@/api';

const BASE_URL = '/api/industry';

export type KsicItem = { code: string; name: string };
export type KsicSearchResponse = {
  list: KsicItem[];
  totalCount: number;
  totalPage: number;
  pageNum: number;
  amount: number;
};

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

  async search(params: {
    code?: string;
    name?: string;
    page?: number;
    amount?: number;
  }): Promise<KsicSearchResponse> {
    const { code, name, page = 1, amount = 10 } = params || {};
    const { data } = await api.get<KsicSearchResponse>(
      '/api/industry/code/ksic5',
      {
        params: { code, name, page, amount },
      },
    );
    return data;
  },
};

export default industryApi;
