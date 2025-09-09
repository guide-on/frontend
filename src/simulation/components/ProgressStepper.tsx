import { colors } from '@/styles/colors';
import type { SimulationStepCode, SimulationStatus } from '../types';

const LABEL: Record<SimulationStepCode, string> = {
    DOCUMENT_CHECK: '서류검증',
    CREDIT_CHECK: '신용도확인',
    BUSINESS_PLAN: '사업계획서 평가',
    FINAL_REVIEW: '결과 확인',
};

function colorByStatus(s: SimulationStatus) {
    switch (s) {
        case 'COMPLETED': return colors.blue;
        case 'IN_PROGRESS': return colors.navy;
        case 'FAILED': return '#EF4444';
        default: return colors.gray;
    }
}

export default function ProgressStepper({
                                            steps,
                                        }: {
    steps: Array<{ stepCode: SimulationStepCode; status: SimulationStatus }>;
}) {
    return (
        <div className="w-full flex items-center gap-3">
            {steps.map((s, i) => (
                <div key={s.stepCode} className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2 w-full">
                        <div
                            className="shrink-0 w-8 h-8 rounded-full grid place-items-center text-white text-xs font-semibold"
                            style={{ background: colorByStatus(s.status) }}
                        >
                            {i + 1}
                        </div>
                        <div className="text-xs font-medium text-gray-700">{LABEL[s.stepCode]}</div>
                    </div>
                    {i < steps.length - 1 && <div className="h-0.5 flex-1" style={{ background: colors.gray }} />}
                </div>
            ))}
        </div>
    );
}
