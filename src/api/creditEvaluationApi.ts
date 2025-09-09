import api from '@/api';
import type { AxiosResponse } from 'axios';

// 타입 정의
export interface CreditEvaluationCreateRequest {
  memberId: string;  // 백엔드 member_id 컬럼에 맞춤
  
  // 상환이력 (28.4%)
  totalOverdueCount?: number;
  recent12mOverdueCount?: number;
  maxOverdueDays?: number;
  currentOverdueAmount?: number;
  loanDefaultHistory?: number;
  creditCardDelayRate?: number;
  paymentConsistencyScore?: number;
  
  // 부채수준 (24.5%)
  totalDebtAmount?: number;
  monthlyIncome?: number;
  debtToIncomeRatio?: number;
  creditCardUtilizationRate?: number;
  securedVsUnsecuredRatio?: number;
  
  // 신용거래기간 (12.3%)
  creditHistoryMonths?: number;
  oldestCreditAccountMonths?: number;
  newCreditInquiries6m?: number;
  
  // 신용형태 (27.5%)
  activeCreditCardCount?: number;
  totalCreditLimit?: number;
  loanTypeDiversity?: number;
  financialInstitutionCount?: number;
  
  // 비금융/마이데이터 (7.3%)
  alternativeCreditScore?: number;
}

export interface CreditEvaluationUpdateRequest extends CreditEvaluationCreateRequest {
  evaluationDate: string;
}

export interface CreditEvaluationResponse {
  memberId: string;  // 백엔드 member_id 컬럼에 맞춤
  evaluationDate: string;
  
  // 상환이력 (28.4%)
  totalOverdueCount?: number;
  recent12mOverdueCount?: number;
  maxOverdueDays?: number;
  currentOverdueAmount?: number;
  loanDefaultHistory?: number;
  creditCardDelayRate?: number;
  paymentConsistencyScore?: number;
  
  // 부채수준 (24.5%)
  totalDebtAmount?: number;
  monthlyIncome?: number;
  debtToIncomeRatio?: number;
  creditCardUtilizationRate?: number;
  securedVsUnsecuredRatio?: number;
  
  // 신용거래기간 (12.3%)
  creditHistoryMonths?: number;
  oldestCreditAccountMonths?: number;
  newCreditInquiries6m?: number;
  
  // 신용형태 (27.5%)
  activeCreditCardCount?: number;
  totalCreditLimit?: number;
  loanTypeDiversity?: number;
  financialInstitutionCount?: number;
  
  // 비금융/마이데이터 (7.3%)
  alternativeCreditScore?: number;
  
  // 메타데이터
  createdAt?: string;
  updatedAt?: string;
}

export interface CommonResponseDTO<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreditEvaluationListRequest {
  memberId?: string;  // 백엔드 member_id 컬럼에 맞춤
  startDate?: string;
  endDate?: string;
}

const BASE_URL = '/api/credit-evaluation';

// API 함수들
export const creditEvaluationApi = {
  // 신용평가 데이터 생성
  async create(request: CreditEvaluationCreateRequest): Promise<CommonResponseDTO<CreditEvaluationResponse>> {
    const { data } = await api.post<CommonResponseDTO<CreditEvaluationResponse>>(BASE_URL, request);
    return data;
  },

  // 신용평가 데이터 수정
  async update(request: CreditEvaluationUpdateRequest): Promise<CommonResponseDTO<CreditEvaluationResponse>> {
    const { data } = await api.put<CommonResponseDTO<CreditEvaluationResponse>>(BASE_URL, request);
    return data;
  },

  // 신용평가 데이터 조회 (단건)
  async get(memberId: string, evaluationDate: string): Promise<CommonResponseDTO<CreditEvaluationResponse>> {
    const { data } = await api.get<CommonResponseDTO<CreditEvaluationResponse>>(`${BASE_URL}/${memberId}/${evaluationDate}`);
    return data;
  },

  // 신용평가 데이터 목록 조회
  async getList(request: CreditEvaluationListRequest): Promise<CommonResponseDTO<CreditEvaluationResponse[]>> {
    const params = new URLSearchParams();
    if (request.memberId) params.append('memberId', request.memberId);
    if (request.startDate) params.append('startDate', request.startDate);
    if (request.endDate) params.append('endDate', request.endDate);
    
    const { data } = await api.get<CommonResponseDTO<CreditEvaluationResponse[]>>(`${BASE_URL}?${params.toString()}`);
    return data;
  },

  // 신용평가 데이터 삭제
  async delete(memberId: string, evaluationDate: string): Promise<CommonResponseDTO<string>> {
    const { data } = await api.delete<CommonResponseDTO<string>>(`${BASE_URL}/${memberId}/${evaluationDate}`);
    return data;
  },
};

export default creditEvaluationApi;