import { colors } from '@/styles/colors';
import type { MetricScore } from '../types';
import { useNavigate } from 'react-router-dom';

export default function QuickTiles({ metrics }: { metrics: MetricScore[] }) {
    const nav = useNavigate();

    const top4 = metrics.slice(0, 4); // 우선 4개 노출(백엔드 연결 시 중요도 순 정렬 추천)
    const goto = (m: MetricScore) => {
        // 관련 페이지로 이동(임시 라우팅)
        const q =
            m.metricCode === 'DOCUMENT_COMPLETENESS' ? 'document' :
                m.metricCode === 'CREDIT_SCORE' ? 'credit' :
                    m.metricCode === 'CASHFLOW_STABILITY' ? 'cashflow' : 'repay';
        nav(`/guide?tab=${q}`);
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            {top4.map((m) => (
                <button
                    key={m.id}
                    onClick={() => goto(m)}
                    className="p-4 rounded-2xl bg-white text-left"
                    style={{ border: `2px solid ${colors.paleBlue}` }}
                >
                    <div className="text-sm font-semibold mb-1" style={{ color: colors.navy }}>{m.metricName}</div>
                    <div className="text-2xl font-extrabold" style={{ color: colors.navy }}>{m.score}</div>
                    <div className="text-[11px] text-gray-500">값: {m.value}</div>
                </button>
            ))}
        </div>
    );
}
