import { colors } from '@/styles/colors';
import { useNavigate } from 'react-router-dom';
import type { SimulationListItem } from '@/simulation/types';
import { Megaphone, ChevronRight } from 'lucide-react';

export default function GuideStatusCard({ active }: { active: SimulationListItem }) {
    const nav = useNavigate();
    const pct = active.progressPct ?? 0;
    const bar = pct >= 100 ? colors.blue : pct >= 75 ? '#F59E0B' : colors.navy;

    return (
        <button
            onClick={() => nav(`/simulation/${active.id}`)}
            className="w-full text-left rounded-3xl p-5 bg-white border shadow-[0_10px_30px_rgba(37,67,123,0.06)] relative overflow-hidden"
            style={{ borderColor: colors.paleBlue }}
        >
            {/* 장식 원형 그라데이션 */}
            <div
                className="absolute -right-6 -top-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(closest-side, ${colors.lightBlue}, transparent)` }}
            />
            <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-2xl grid place-items-center"
                     style={{ background: colors.paleBlue, color: colors.navy }}>
                    <Megaphone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <div className="text-[15px] font-extrabold mb-1" style={{ color: colors.navy }}>
                        대출가이드 현황 및 바로가기
                    </div>
                    <div className="text-[12px] text-gray-600 mb-3">
                        {`${active.title} · 시작 ${active.startProbability}% → 예상 ${active.expectedProbability}%`}
                    </div>

                    <div className="w-full h-3 rounded-full bg-gray-200">
                        <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, background: bar }} />
                    </div>

                    <div className="mt-2 text-[11px] text-gray-500">
                        진행률 {pct}% · 상태 {active.status === 'COMPLETED' ? '완료' : active.status === 'IN_PROGRESS' ? '진행중' : '대기'}
                    </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
            </div>
        </button>
    );
}
