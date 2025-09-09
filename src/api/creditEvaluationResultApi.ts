import api from '@/api';
import type { CommonResponseDTO } from './creditEvaluationApi';

// 신용평가 결과 타입 정의
export interface CreditEvaluationResultResponse {
  memberId: number;
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
  // 현재 로그인한 사용자의 신용평가 결과 조회
  async get(): Promise<CommonResponseDTO<CreditEvaluationResultResponse>> {
    const { data } = await api.get<CommonResponseDTO<CreditEvaluationResultResponse>>(`${BASE_URL}/me`);
    return data;
  },

  // 모든 신용평가 결과 목록 조회
  async getList(): Promise<CommonResponseDTO<CreditEvaluationResultResponse[]>> {
    const { data } = await api.get<CommonResponseDTO<CreditEvaluationResultResponse[]>>(BASE_URL);
    return data;
  },

  // 점수 범위별 신용평가 결과 조회
  async getByScoreRange(minScore?: number, maxScore?: number): Promise<CommonResponseDTO<CreditEvaluationResultResponse[]>> {
    const params = new URLSearchParams();
    if (minScore) params.append('minScore', minScore.toString());
    if (maxScore) params.append('maxScore', maxScore.toString());
    
    const { data } = await api.get<CommonResponseDTO<CreditEvaluationResultResponse[]>>(`${BASE_URL}/score-range?${params.toString()}`);
    return data;
  }
};

export default creditEvaluationResultApi;