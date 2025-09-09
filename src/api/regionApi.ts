import api from '@/api';

const BASE_URL = '/api/region';

/** 서버 응답 타입 (실제 스펙에 맞게 고도화 필요) */
export type SidoResponse = {
  code: string;
  name: string;
};

export const regionApi = {
  /** 시도 목록 조회 */
  async fetchSidos(): Promise<SidoResponse[]> {
    const { data } = await api.get<SidoResponse[]>(`${BASE_URL}/sido`);
    return data;
  },
};

export default regionApi;
