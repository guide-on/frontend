import api from '@/api';
import type { SimulationListItem, SimulationStatus } from './types';
import type { ApiDetail, ApiListItem, ApiPageResponse, CommonResponseDTO, ApiStep, ApiStatus } from './types/api';

// ---- 매핑 유틸 ----
const mapStatus = (s: ApiStatus): SimulationStatus =>
    s === 'COMPLETED' ? 'COMPLETED' : s === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'FAILED';

const stepProgress = (step: ApiStep): number =>
    step === 'DOCS' ? 25 : step === 'CREDIT' ? 50 : step === 'PLAN' ? 75 : 100;

const deriveTags = (row: ApiListItem): string[] => {
    const t: string[] = [];
    if (row.fundName) t.push(`#${row.fundName}`);
    if (row.docScorePct >= 100) t.push('#서류완료');
    if (row.planScorePct > 0 && row.planScorePct < 75) t.push('#사업계획서보완');
    return t.slice(0, 4);
};

// ---- 목록 API ----
export async function fetchSimulationList(page = 0, size = 20): Promise<SimulationListItem[]> {
    const { data } = await api.get<CommonResponseDTO<ApiPageResponse<ApiListItem>>>(
        '/api/simulation/results',
        { params: { page, size }, withCredentials: true }
    );

    const pageData = data.data;
    return pageData.content.map((row) => {
        const expected = Math.round(row.totalProbabilityPct ?? 0);
        const start = Math.round((row.docScorePct ?? 0) * 0.6); // 서류만 가정한 베이스
        return {
            id: row.id,
            title: row.fundName ? `${row.fundName}` : '시뮬레이션',
            startedAt: row.startedAt,
            expectedProbability: expected,
            startProbability: start,
            progressPct: stepProgress(row.currentStep),
            status: mapStatus(row.overallStatus),
            tags: deriveTags(row),
        };
    });
}

// ---- 상세 API (페이지에서 바로 가공해서 사용) ----
export type DetailVM = {
    id: number;
    startedAt: string;
    fundName: string;
    overallStatus: SimulationStatus;
    currentStep: ApiStep;

    // 원자료
    docSessionStatus: 'IN_PROGRESS' | 'COMPLETED' | null;
    totalCreditScore: number | null;
    planTotalScore: number | null;
    totalProbabilityPct: number; // 기대 확률(가중합)

    // 파생
    creditNormPct: number; // 0~100
};

export async function fetchSimulationDetail(id: number): Promise<DetailVM> {
    const { data } = await api.get<CommonResponseDTO<ApiDetail>>(
        `/api/simulation/results/${id}`,
        { withCredentials: true }
    );
    const r = data.data;

    const creditNorm = Math.round(Math.min(100, Math.max(0, (r.totalCreditScore ?? 0) / 10)));
    return {
        id: r.id,
        startedAt: r.startedAt,
        fundName: r.fundName ?? '시뮬레이션',
        overallStatus: mapStatus(r.overallStatus),
        currentStep: r.currentStep,
        docSessionStatus: r.docSessionStatus ?? null,
        totalCreditScore: r.totalCreditScore ?? null,
        planTotalScore: r.planTotalScore ?? null,
        totalProbabilityPct: Math.round(r.totalProbabilityPct ?? 0),
        creditNormPct: creditNorm,
    };
}
