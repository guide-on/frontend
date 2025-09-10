import { colors } from '@/styles/colors';
import type { SimulationStepCode, SimulationStatus } from '../types';

const LABEL: Record<SimulationStepCode, string> = {
    DOCUMENT_CHECK: '서류 검증',
    CREDIT_CHECK: '신용도 확인',
    BUSINESS_PLAN: '사업계획서 평가',
    FINAL_REVIEW: '결과 확인',
};

function circleStyle(status: SimulationStatus) {
    if (status === 'COMPLETED') return { bg: colors.blue, fg: '#fff', ring: colors.blue };
    if (status === 'IN_PROGRESS') return { bg: colors.navy, fg: '#fff', ring: colors.navy };
    if (status === 'FAILED') return { bg: '#EF4444', fg: '#fff', ring: '#EF4444' };
    return { bg: '#E5E7EB', fg: '#111827', ring: '#E5E7EB' };
}

export default function LabeledStepper({
                                           steps,
                                       }: { steps: Array<{ stepCode: SimulationStepCode; status: SimulationStatus }>; }) {
    return (
        <div
            className="relative w-full px-4 py-2"              // 간격 ↓
            style={{ background: colors.bgSoft }}             // ← 연한 회색 배경
        >
            {/* 트랙: 얇고 위쪽 */}
            <div
                className="absolute left-4 right-4 top-[66%] -translate-y-1/2 rounded-full"
                style={{ height: 5, background: '#EAEDF3' }}
            />
            <div className="relative grid grid-cols-4">
                {steps.map((s, i) => {
                    const st = circleStyle(s.status);
                    return (
                        <div key={s.stepCode} className="flex flex-col items-center">
                            <div className="text-[11px] mb-1.5 text-gray-700">{LABEL[s.stepCode]}</div>
                            <div
                                className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold"
                                style={{ background: st.bg, color: st.fg, boxShadow: `0 0 0 2px ${st.ring}` }}
                            >
                                {i + 1}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
