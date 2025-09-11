import api from '@/api';
import type { AxiosResponse } from 'axios';

// 하이브리드 신용점수 응답 타입 정의
export interface HybridCreditScoreResponse {
  sessionId: number;
  totalCreditScore: number;
  hybridCreditScore: number;
  traditionalCreditScore: number;
  lastUpdatedDttm: string;
  salesSummaryScoreScaled: number;
  financialInfoScoreScaled: number;
  operationalInfoScoreScaled: number;
}

export interface CommonResponseDTO<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE_URL = '/api/hybrid-credit-score';

// 하이브리드 신용점수 API 함수들
export const hybridCreditScoreApi = {
  // 하이브리드 신용점수 생성/조회
  async get(sessionId: number): Promise<CommonResponseDTO<HybridCreditScoreResponse>> {
    const { data } = await api.get<CommonResponseDTO<HybridCreditScoreResponse>>(`${BASE_URL}/${sessionId}`);
    return data;
  },

  // 하이브리드 신용점수 계산/업데이트
  async calculate(sessionId: number): Promise<CommonResponseDTO<HybridCreditScoreResponse>> {
    const { data } = await api.post<CommonResponseDTO<HybridCreditScoreResponse>>(`${BASE_URL}/${sessionId}/calculate`);
    return data;
  },

  // 하이브리드 신용점수 결과 조회
  async getResult(sessionId: number): Promise<CommonResponseDTO<HybridCreditScoreResponse>> {
    const { data } = await api.get<CommonResponseDTO<HybridCreditScoreResponse>>(`${BASE_URL}/result/${sessionId}`);
    return data;
  },

  // traditional_credit_score 업데이트
  async updateTraditionalScore(sessionId: number): Promise<CommonResponseDTO<HybridCreditScoreResponse>> {
    const { data } = await api.put<CommonResponseDTO<HybridCreditScoreResponse>>(`${BASE_URL}/${sessionId}/update-traditional-score`);
    return data;
  },
};

export default hybridCreditScoreApi;