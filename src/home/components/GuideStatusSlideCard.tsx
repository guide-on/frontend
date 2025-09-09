import { useNavigate } from 'react-router-dom';
import type { SimulationListItem } from '@/simulation/types';
import { ChevronRight } from 'lucide-react';
import Zoom3D from '@/assets/3d/zoom-dynamic-color.png';

const BAR = { COMPLETED: '#10B981', IN_PROGRESS: '#F59E0B', FAILED: '#EF4444', PENDING: '#25437B' } as const;
const BADGE = {
    COMPLETED: 'bg-emerald-50 text-emerald-700',
    IN_PROGRESS: 'bg-amber-50 text-amber-700',
    FAILED: 'bg-red-50 text-red-700',
    PENDING: 'bg-blue-50 text-blue-700',
} as const;
const LABEL = { COMPLETED: '완료', IN_PROGRESS: '진행중', FAILED: '실패', PENDING: '대기' } as const;

export default function GuideStatusSlideCard({ item }: { item: SimulationListItem }) {
    const nav = useNavigate();
    const bar = BAR[(item.status as keyof typeof BAR) ?? 'PENDING'];
    const badge = BADGE[(item.status as keyof typeof BADGE) ?? 'PENDING'];
    const label = LABEL[(item.status as keyof typeof LABEL) ?? 'PENDING'];

    return (
        <div
            onClick={() => nav(`/simulation/${item.id}`)}
            className="snap-center shrink-0 rounded-3xl p-5 bg-white cursor-pointer relative overflow-hidden"
            style={{
                width: 260,
                height: 295,
                boxShadow: '0 14px 32px rgba(17,24,39,0.06)',
            }}
        >
            {/* 3D 아이콘 */}
            <img
                src={Zoom3D}
                alt="simulation icon"
                className="absolute right-4 top-6 w-24 h-24 object-contain pointer-events-none"
            />

            <div className="flex flex-col h-full">
                {/* 상태 뱃지(상단) */}
                <div className="mb-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-semibold ${badge}`}>{label}</span>
                </div>

                <div className="pr-28">
                    <div className="text-[16px] font-extrabold text-gray-900">대출가이드 현황</div>
                    <div className="mt-1 text-[12px] text-gray-600">{item.title}</div>
                </div>

                {/* 예상 승인률 */}
                <div className="mt-3">
                    <div className="text-[12px] text-gray-500">현 예상 승인률</div>
                    <div className="mt-1 text-[26px] leading-[28px] font-black text-gray-900">
                        {item.expectedProbability}%
                    </div>
                </div>

                {/* 게이지 */}
                <div className="mt-3">
                    <div className="w-full h-3 rounded-full bg-gray-200">
                        <div className="h-3 rounded-full" style={{ width: `${item.progressPct}%`, background: bar }} />
                    </div>
                    {/* 진행 관련 오른쪽 아래 정렬 */}
                    <div className="mt-2 text-[11px] text-gray-500 text-right">진행률 {item.progressPct}%</div>
                </div>

                {/* 하단 액션 */}
                <div className="mt-auto flex items-center gap-1 text-[12px] text-gray-400">
                    <span>상세 보기</span>
                    <ChevronRight className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
}
