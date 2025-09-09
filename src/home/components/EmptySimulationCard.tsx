import { colors } from '@/styles/colors';
import { useNavigate } from 'react-router-dom';
import { Megaphone, ChevronRight } from 'lucide-react';

export default function EmptySimulationCard() {
    const nav = useNavigate();
    return (
        <button
            onClick={() => nav('/simulation')}
            className="w-full text-left rounded-3xl p-5 bg-white border shadow-[0_10px_30px_rgba(37,67,123,0.06)] relative overflow-hidden"
            style={{ borderColor: colors.paleBlue }}
        >
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
                        진행 중인 시뮬레이션이 없어요. 새 시뮬을 시작해 보세요!
                    </div>
                    <div className="w-full h-3 rounded-full bg-gray-100" />
                    <div className="mt-2 text-[11px] text-gray-500">진행률 0% · 상태 없음</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
            </div>
        </button>
    );
}
