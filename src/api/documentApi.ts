import api from '@/api';

export type DocumentSurveyPayload = {
  loanPurpose: string;
  businessYears: number;
  annualRevenue: number; // KRW
  employeeCount: number;
  placeType?: string; // 임대 | 자가 | 전대차
};

export type DocumentSurveyResponse = {
  businessId: number | string;
  success?: boolean;
  message?: string;
  [key: string]: any;
};

export type SimulationSession = {
  sessionId: string | number;
  policyId: string | number;
  policyName: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progressPercentage?: number;
  completedRequirements?: number;
  totalRequirements?: number;
};

export type SimulationListResponse = {
  success: boolean;
  businessId: string | number;
  sessions: SimulationSession[];
  message?: string;
};

export type SurveyStatusResponse = {
  success: boolean;
  isCompleted: boolean;
  businessId?: number | string;
  surveyData?: {
    businessId: number | string;
    memberId: number | string;
    loanPurpose: string;
    industryCode?: string;
    businessPeriod: number;
    revenue: number;
    employees: number;
    placeType: string;
    surveyCompletedAt: string | null;
  };
};

const BASE_URL = '/api/survey';

export const documentApi = {
  // Backend expects: { loanPurpose, businessPeriod, revenue, employees, placeType }
  async postDocumentSurvey(
    payload: DocumentSurveyPayload,
  ): Promise<DocumentSurveyResponse> {
    const body = {
      loanPurpose: payload.loanPurpose,
      businessPeriod: Number(payload.businessYears) * 12, // 연수를 개월로 변환
      revenue: Number(payload.annualRevenue),
      employees: Number(payload.employeeCount),
      placeType: payload.placeType ?? '',
    };

    const { data } = await api.post<DocumentSurveyResponse>(
      `${BASE_URL}/submit`,
      body,
    );
    return data;
  },

  async getPolicies(businessId: string | number): Promise<PolicyItem[]> {
    const { data } = await api.get<PolicyItem[]>(`/api/policy/${businessId}`);
    return data;
  },

  async createApplicationSession(params: {
    businessId: string | number;
    policyId: string | number;
  }): Promise<{
    sessionId: string | number;
    success?: boolean;
    message?: string;
  }> {
    const { data } = await api.post('/api/session/create', params);
    return data;
  },

  async createRequiredDocuments(sessionId: string | number): Promise<{
    success: boolean;
    sessionId: string | number;
    policyName: string;
    documentGroups: DocumentGroup[];
    totalGroups: number;
  }> {
    const { data } = await api.get(`/api/document/required/${sessionId}`);
    return data;
  },

  async getDocumentStatus(sessionId: string | number): Promise<{
    success: boolean;
    sessionId: string | number;
    policyName: string;
    totalRequirements: number;
    completedRequirements: number;
    progressPercentage: number;
    documentGroups: Array<{
      groupKey: string;
      label: string;
      minSelect: number;
      description?: string;
      submitted: number;
      isCompleted: boolean;
      documents: Array<{
        id: number;
        name: string;
        mydataEligible: boolean;
        status: string;
        uploadStatus: string;
        isSelected: boolean;
        isMydataRetrieved: boolean;
      }>;
    }>;
  }> {
    const { data } = await api.get(`/api/document/status/${sessionId}`);
    return data;
  },

  async uploadDocument(
    sessionId: string | number,
    documentId: string | number,
    file: File,
  ): Promise<{
    success: boolean;
    message: string;
    documentId: string | number;
    fileName: string;
  }> {
    const formData = new FormData();
    formData.append('documentId', String(documentId));
    formData.append('file', file);

    const { data } = await api.post(
      `/api/document/upload/${sessionId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return data;
  },

  async mydataSync(
    sessionId: string | number,
    agreements: { serviceTerms: boolean; privacyPolicy: boolean; thirdPartyConsent: boolean },
  ): Promise<{ success: boolean; message?: string }> {
    const payload = { agreements };
    console.log('mydataSync API 요청 Payload:', JSON.stringify(payload, null, 2));
    const { data } = await api.post(`/api/document/mydata-sync/${sessionId}`, payload);
    return data;
  },

  async getSimulations(businessId: string | number): Promise<SimulationListResponse> {
    const { data } = await api.get<SimulationListResponse>(`/api/session/${businessId}/simulations`);
    return data;
  },

  async getSurveyStatus(): Promise<SurveyStatusResponse> {
    const { data } = await api.get<SurveyStatusResponse>(`${BASE_URL}/status`);
    return data;
  },
};

// 기존 함수 형태로도 export (호환성 유지)
export async function postDocumentSurvey(payload: DocumentSurveyPayload) {
  return documentApi.postDocumentSurvey(payload);
}

export type PolicyItem = {
  id?: number | string;
  policyId?: number | string;
  name?: string;
  title?: string;
  policyName?: string;
  policyType?: string;
  rate?: string | number; // e.g. 2.4%
  interestRate?: string | number;
  baseRate?: number;
  limit?: string | number;
  limitAmount?: string | number;
  loanLimit?: number;
  term?: string;
  termYears?: number;
  conditions?: string;
  [key: string]: any;
};

// 기존 함수 형태로도 export (호환성 유지)
export async function getPolicies(businessId: string | number) {
  return documentApi.getPolicies(businessId);
}

export async function createApplicationSession(params: {
  businessId: string | number;
  policyId: string | number;
}): Promise<{
  sessionId: string | number;
  success?: boolean;
  message?: string;
}> {
  return documentApi.createApplicationSession(params);
}

export type DocumentItem = {
  documentId?: string | number;
  name: string;
  mydataEligible: boolean;
  status: 'pending' | 'completed' | 'failed';
};

export type DocumentGroup = {
  groupKey: string;
  label: string;
  minSelect: number;
  description?: string;
  documents: DocumentItem[];
};

export async function createRequiredDocuments(
  sessionId: string | number,
): Promise<{
  success: boolean;
  sessionId: string | number;
  policyName: string;
  documentGroups: DocumentGroup[];
  totalGroups: number;
}> {
  return documentApi.createRequiredDocuments(sessionId);
}

export async function getDocumentStatus(sessionId: string | number): Promise<{
  success: boolean;
  sessionId: string | number;
  policyName: string;
  totalRequirements: number;
  completedRequirements: number;
  progressPercentage: number;
  documentGroups: Array<{
    groupKey: string;
    label: string;
    minSelect: number;
    description?: string;
    submitted: number;
    isCompleted: boolean;
    documents: Array<{
      id: number;
      name: string;
      mydataEligible: boolean;
      status: string;
      uploadStatus: string;
      isSelected: boolean;
      isMydataRetrieved: boolean;
    }>;
  }>;
}> {
  return documentApi.getDocumentStatus(sessionId);
}

export async function uploadDocument(
  sessionId: string | number,
  documentId: string | number,
  file: File,
): Promise<{
  success: boolean;
  message: string;
  documentId: string | number;
  fileName: string;
}> {
  return documentApi.uploadDocument(sessionId, documentId, file);
}

export async function mydataSync(
  sessionId: string | number,
  agreements: { serviceTerms: boolean; privacyPolicy: boolean; thirdPartyConsent: boolean },
): Promise<{ success: boolean; message?: string }> {
  return documentApi.mydataSync(sessionId, agreements);
}

export async function getSimulations(businessId: string | number): Promise<SimulationListResponse> {
  return documentApi.getSimulations(businessId);
}

export async function getSurveyStatus(): Promise<SurveyStatusResponse> {
  return documentApi.getSurveyStatus();
}

export default documentApi;
