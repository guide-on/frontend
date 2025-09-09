import { colors } from '@/styles/colors';
import type { ImprovementSuggestion } from '../types';

export default function ImprovementCard({ s }: { s: ImprovementSuggestion }) {
    return (
        <div className="p-4 rounded-2xl shadow-sm bg-white border" style={{ borderColor: colors.paleBlue }}>
            <div className="text-sm font-semibold mb-1" style={{ color: colors.navy }}>
                {s.targetMetricName}
            </div>
            <p className="text-xs text-gray-600 mb-2">{s.rationale}</p>
            <div className="flex items-center justify-between text-sm">
                <div className="text-gray-700">
                    현재: <b>{s.currentValue ?? '-'}</b> → 제안: <b>{s.suggestedValue ?? '-'}</b>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500">예상 상승</div>
                    <div className="text-base font-bold" style={{ color: colors.blue }}>+{s.expectedProbabilityDelta}%p</div>
                </div>
            </div>
        </div>
    );
}
