export type SimulationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type SimulationStepCode = 'DOCUMENT_CHECK' | 'CREDIT_CHECK' | 'BUSINESS_PLAN' | 'FINAL_REVIEW';
export type ScoreCategory = 'STRENGTH' | 'NEUTRAL' | 'WEAKNESS';

export interface SimulationListItem {
    id: number;
    title: string;
    startedAt: string;             // ISO
    expectedProbability: number;   // 0~100
    startProbability: number;      // 0~100
    progressPct: number;           // 0~100
    status: SimulationStatus;
    tags: string[];
}

export interface SimulationStep {
    id: number;
    stepCode: SimulationStepCode;
    status: SimulationStatus;
    score?: number | null;
    grade?: string | null;
    notes?: string | null;
}

export interface MetricScore {
    id: number;
    metricCode: string;
    metricName: string;
    category: ScoreCategory;
    value: number;   // 원시값/정규화값 아무거나
    score: number;   // 0~100
}

export interface ImprovementSuggestion {
    id: number;
    targetMetricCode: string;
    targetMetricName: string;
    currentValue: number | null;
    suggestedValue: number | null;
    expectedProbabilityDelta: number; // +%p
    rationale: string;
}

export interface SimulationDetail {
    id: number;
    title: string;
    status: SimulationStatus;
    startedAt: string;
    completedAt?: string | null;
    startProbability: number;
    currentProbability: number;
    expectedProbability: number;
    steps: SimulationStep[];
    metrics: MetricScore[];
    suggestions: ImprovementSuggestion[];
}
