import api from '@/api';

/** 서버에서 내려주는 상태조회 응답 타입 */
export type BizStatusResponse = {
  active: boolean; // true=계속사업자
  code?: string; // "01" | "02" | "03" ...
  label?: string; // "계속사업자" | "휴업자" | "폐업자" ...
  error?: 'INVALID_BNO' | 'NOT_REGISTERED' | 'INACTIVE' | 'UNKNOWN_STATUS';
  message?: string;
  bno?: string; // 정규화된 사업자등록번호
};

const BASE_URL = '/api/biz';

export const bizApi = {
  /**
   * 사업자번호 상태 조회
   * - 숫자 10자리여야 함
   * - active=true: 계속사업자 (정상 운영중)
   * - active=false: 에러/휴업/폐업/미등록 → error/message 참고
   */
  async checkStatus(bno: string): Promise<BizStatusResponse> {
    const { data } = await api.get<BizStatusResponse>(
      `${BASE_URL}/status/check`,
      {
        params: { bno },
      },
    );
    return data;
  },
};

export default bizApi;
