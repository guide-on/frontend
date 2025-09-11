import api from '@/api';
import type { CommonResponseDTO } from './creditEvaluationApi';

// 신용평가 결과 타입 정의
export interface CreditEvaluationResultResponse {
  sessionId: number;
  totalScore: number;
  repaymentHistoryScore: number;
  debtLevelScore: number;
  creditPeriodScore: number;
  creditPatternScore: number;
  nonFinancialScore: number;
  scoreCalculatedDttm: string;
}

const BASE_URL = '/api/credit-evaluation-result';

// 신용평가 결과 API 함수들
export const creditEvaluationResultApi = {
  // 특정 사용자의 신용평가 결과 조회 (백엔드와 매칭)
  async get(sessionId: number): Promise<CommonResponseDTO<CreditEvaluationResultResponse>> {
    const { data } = await api.get<CommonResponseDTO<CreditEvaluationResultResponse>>(`${BASE_URL}/${sessionId}`);
    return data;
  },

  // 현재 로그인한 사용자의 신용평가 결과 조회 (편의 메소드)
  async getMe(sessionId: number): Promise<CommonResponseDTO<CreditEvaluationResultResponse>> {
    return this.get(sessionId);
  }
};

export default creditEvaluationResultApi;