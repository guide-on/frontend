import { colors } from '@/styles/colors';
import { useNavigate } from 'react-router-dom';
import type { SimulationListItem } from '../types';
import { fmtDate } from '../utils/format';

const STATUS = {
    COMPLETED: { label: '완료',  bg: '#DCFCE7', fg: '#047857', bar: '#10B981' },  // green
    IN_PROGRESS: { label: '진행중', bg: '#FFEDD5', fg: '#C2410C', bar: '#F59E0B' }, // orange
    FAILED: { label: '중단',  bg: '#FEE2E2', fg: '#B91C1C', bar: '#EF4444' },       // red
    PENDING: { label: '대기', bg: '#E5E7EB', fg: '#111827', bar: colors.navy },
} as const;

export default function ResultCard({ item }: { item: SimulationListItem }) {
    const nav = useNavigate();
    const st = STATUS[item.status as keyof typeof STATUS] ?? STATUS.PENDING;

    return (
        <div
            className="p-4 rounded-3xl shadow-sm bg-white border cursor-pointer"
            style={{ borderColor: colors.paleBlue }}
            onClick={() => nav(`/simulation/${item.id}`)}
        >
            {/* 상단: 날짜(블루) + 상태 칩(초록/주황/빨강) */}
            <div className="flex items-center justify-between mb-2">
                <div className="text-[13px] font-semibold" style={{ color: colors.navy }}>
                    {fmtDate(item.startedAt)} 시뮬레이션
                </div>
                <span
                    className="text-[11px] px-2 py-1 rounded-full font-semibold"
                    style={{ background: st.bg, color: st.fg }}
                >
          {st.label}
        </span>
            </div>

            {/* 진행 바 */}
            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-2">
                <div className="h-3 rounded-full transition-all" style={{ width: `${item.progressPct}%`, background: st.bar }} />
            </div>

            {/* 시작 ↔ 예상 (양쪽 정렬) */}
            <div className="flex items-center justify-between text-sm mb-2">
                <div className="font-semibold" style={{ color: '#111827' }}>시작: {item.startProbability}%</div>
                <div className="font-extrabold" style={{ color: st.bar }}>예상: {item.expectedProbability}%</div>
            </div>

            {/* 태그 */}
            <div className="mt-1 flex gap-2 flex-wrap">
                {item.tags.map((t, i) => (
                    <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{ background: colors.paleBlue, color: colors.navy }}
                    >
            {t}
          </span>
                ))}
            </div>
        </div>
    );
}
