import { colors } from '@/styles/colors';

export default function ImprovementSummaryCard({
                                                   currentExpected,
                                                   improvedTarget,
                                                   topHints, // ['서류 100% 충족 시 +55%p', '사업계획서 75점 이상 시 +8%p'] 같은 문구
                                               }: {
    currentExpected: number;
    improvedTarget: number;
    topHints: string[];
}) {
    return (
        <div className="rounded-2xl p-4 bg-white shadow-sm">
            <div className="text-sm font-semibold mb-1" style={{ color: colors.navy }}>
                향상 가능 요약
            </div>
            <div className="flex items-end justify-between">
                <div className="text-[13px] text-gray-700">
                    현재 예상 {currentExpected}% <span className="mx-2">→</span>
                    <b className="text-base" style={{ color: colors.navy }}>최대 {improvedTarget}%</b>
                </div>
                <div className="text-xs text-gray-500">가정: 서류 충족 등</div>
            </div>
            <ul className="mt-2 list-disc pl-5 text-[12px] text-gray-600 space-y-1">
                {topHints.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
        </div>
    );
}
