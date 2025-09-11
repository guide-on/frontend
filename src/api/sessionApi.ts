import api from './index';

export interface SessionStepResponse {
  success: boolean;
  currentStep: 'DOCS' | 'CREDIT' | 'PLAN' | 'RESULT';
  sessionId: number;
}

export async function getSessionStep(sessionId: string | number): Promise<SessionStepResponse> {
  const response = await api.get(`/api/session/step/${sessionId}`);
  
  if (response.status !== 200) {
    throw new Error(`세션 단계 조회 실패: ${response.status}`);
  }
  
  return response.data;
}