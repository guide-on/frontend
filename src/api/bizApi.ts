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

/** OCR 응답 타입 (스샷 기준 필드) */
export type OcrBizRegResponse = {
  rawText?: string;
  bizRegNo?: string; // 하이픈 없이 10자리
  companyName?: string;
  ownerName?: string;
  bizType?: string;
  bizItems?: string;
  address?: string;
  openedOn?: string; // yyyy-MM-dd
  ocrConfidence?: number; // 0.0 ~ 1.0
};

const BASE_BIZ = '/api/biz';
const BASE_OCR = '/api/ocr';

export const bizApi = {
  /**
   * 사업자번호 상태 조회
   * - 숫자 10자리여야 함
   * - active=true: 계속사업자 (정상 운영중)
   * - active=false: 에러/휴업/폐업/미등록 → error/message 참고
   */
  async checkStatus(bno: string): Promise<BizStatusResponse> {
    const { data } = await api.get<BizStatusResponse>(
      `${BASE_BIZ}/status/check`,
      {
        params: { bno },
      },
    );
    return data;
  },
  /** 사업자등록증 OCR 업로드 (file 필드) */
  async ocrBizReg(file: File): Promise<OcrBizRegResponse> {
    const form = new FormData();
    form.append('file', file);

    // Content-Type 은 브라우저가 boundary 포함해 자동 설정 => 명시 X
    const { data } = await api.post<OcrBizRegResponse>(
      `${BASE_OCR}/bizreg`,
      form,
    );
    return data;
  },
};

export default bizApi;
