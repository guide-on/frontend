import api from '@/api';

export type SectionDetail = {
  sectionId: number;
  label: string;
  score: number; // 가중 득점
  weight: number; // 가중치
  comment?: string;
  points: string[];
  mappings: string[];
  suggestions: string[];
};

export type EvaluationResult = {
  reportId: number;
  documentId: number;
  totalScore: number; // 0~100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  strengths: string[];
  risks: string[];
  sections: SectionDetail[];
};

const BASE_PLAN = '/api/plan-eval';

export const planEvalApi = {
  /**
   * 사업계획서 평가 트리거
   * 응답 바디 없음(204/200 가정)
   */
  async evaluate(sessionId: number | string): Promise<void> {
    await api.post(`${BASE_PLAN}/session/${sessionId}/evaluate`);
  },

  /**
   * 보고서 결과 조회 (reportId 기준)
   */
  async getReport(reportId: number | string): Promise<EvaluationResult> {
    const { data } = await api.get<EvaluationResult>(
      `${BASE_PLAN}/${reportId}`,
    );
    return data;
  },

  /**
   * 세션 기준 최신 보고서 조회
   */
  async getReportBySession(
    sessionId: number | string,
  ): Promise<EvaluationResult> {
    const { data } = await api.get<EvaluationResult>(
      `${BASE_PLAN}/${sessionId}`,
    );
    return data;
  },
};

export default planEvalApi;
