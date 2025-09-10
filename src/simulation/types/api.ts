// CommonResponseDTO 래핑을 고려한 최소 타입
export type ApiStatus = 'IN_PROGRESS' | 'COMPLETED' | 'STOPPED';
export type ApiStep = 'DOCS' | 'CREDIT' | 'PLAN' | 'RESULT';
export type ApiDocSession = 'IN_PROGRESS' | 'COMPLETED' | null;

export interface ApiListItem {
    id: number;
    memberId?: number;
    fundName?: string | null;
    startedAt: string;               // ISO
    currentStep: ApiStep;
    overallStatus: ApiStatus;
    totalProbabilityPct: number;     // 0~100
    docScorePct: number;             // 0 or 100
    creditScorePct: number;          // 0~100
    planScorePct: number;            // 0~100
}

export interface ApiDetail extends ApiListItem {
    updatedAt?: string;
    docSessionStatus: ApiDocSession;
    businessId?: number | null;

    totalCreditScore?: number | null;        // 0~1000
    hybridCreditScore?: number | null;
    traditionalCreditScore?: number | null;
    creditLastUpdated?: string | null;

    planTotalScore?: number | null;          // 0~100
}

export interface ApiPageResponse<T> {
    content: T[];
    page: number;
    size: number;
    total: number;
}

export interface CommonResponseDTO<T> {
    status: number;
    message: string;
    data: T;
}
