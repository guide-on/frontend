import { colors } from '@/styles/colors';
import { useNavigate } from 'react-router-dom';
import type { SimulationListItem } from '@/simulation/types';
import { Megaphone } from 'lucide-react';

const STATUS_BAR = {
    COMPLETED: '#10B981',   // green
    IN_PROGRESS: '#F59E0B', // orange
    FAILED: '#EF4444',      // red
    PENDING: colors.navy,
} as const;

export default function GuideStatusSlideCard({ item }: { item: SimulationListItem }) {
    const nav = useNavigate();
    const bar = STATUS_BAR[item.status as keyof typeof STATUS_BAR] ?? colors.navy;

    return (
        <div
            onClick={() => nav(`/simulation/${item.id}`)}
            className="snap-center shrink-0 w-[330px] rounded-3xl p-5 bg-white border shadow-[0_14px_40px_rgba(37,67,123,0.08)] mr-4 cursor-pointer relative overflow-hidden"
            style={{ borderColor: colors.paleBlue }}
        >
            <div className="absolute -right-10 -top-14 w-52 h-52 rounded-full opacity-20 pointer-events-none"
                 style={{ background: `radial-gradient(closest-side, ${colors.lightBlue}, transparent)` }} />
            <div className="flex items-start gap-3">
                <div className="shrink-0 w-12 h-12 rounded-2xl grid place-items-center"
                     style={{ background: colors.paleBlue, color: colors.navy }}>
                    <Megaphone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="text-base font-extrabold mb-1" style={{ color: colors.navy }}>
                        대출가이드 현황 및 바로가기
                    </div>
                    <div className="text-[12px] text-gray-600 mb-3">
                        {`${item.title} · 시작 ${item.startProbability}% → 예상 ${item.expectedProbability}%`}
                    </div>

                    <div className="w-full h-3 rounded-full bg-gray-200">
                        <div className="h-3 rounded-full" style={{ width: `${item.progressPct}%`, background: bar }} />
                    </div>
                    <div className="mt-2 text-[11px] text-gray-500">진행률 {item.progressPct}%</div>
                </div>
            </div>
        </div>
    );
}
