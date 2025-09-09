import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { SimulationDetail } from '../types';
import LabeledStepper from '../components/LabeledStepper';
import DonutGauge from '../components/DonutGauge';
import ImprovementCard from '../components/ImprovementCard';
import StatusChip from '../components/StatusChip';
import { colors } from '@/styles/colors';
import { MOCK_DETAIL } from '../utils/mock';

export default function SimulationDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState<SimulationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [openImp, setOpenImp] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => {
            const key = Number(id);
            setData(MOCK_DETAIL[key] ?? null);
            setLoading(false);
        }, 200);
        return () => clearTimeout(t);
    }, [id]);

    const impSummary = useMemo(() => {
        if (!data) return { sum: 0, max: 0, target: 0 };
        const sum = data.suggestions.reduce((a, s) => a + s.expectedProbabilityDelta, 0);
        const target = Math.min(100, data.expectedProbability + sum);
        const max = Math.max(...data.suggestions.map((s) => s.expectedProbabilityDelta), 0);
        return { sum, max, target };
    }, [data]);

    if (loading) return <div className="p-4">로딩 중...</div>;
    if (!data) return <div className="p-4">데이터가 없습니다.</div>;

    return (
        <div className="max-w-[420px] mx-auto pb-24">
            {/* 상단: 스텝퍼(텍스트/뒤로가기 제거) */}
            <div className="border-b bg-white">
                <LabeledStepper steps={data.steps.map(s => ({ stepCode: s.stepCode, status: s.status }))} />
            </div>

            {/* 제목 + 도넛 게이지 + 요약 */}
            <div className="px-4 mt-3">
                <div className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: colors.paleBlue }}>
                    <div className="text-base font-extrabold mb-3" style={{ color: colors.navy }}>
                        {data.title}
                    </div>
                    <div className="flex gap-4">
                        <DonutGauge value={data.currentProbability} />
                        <div className="flex-1 text-sm">
                            <div className="mb-2">
                                <b>예상 확률</b>:{' '}
                                <span className="font-extrabold" style={{ color: colors.navy }}>
                  {data.expectedProbability}%
                </span>
                            </div>
                            <div className="mb-2"><b>시작 확률</b>: {data.startProbability}%</div>
                            <div className="mb-2">
                                <b>상태</b>:{' '}
                                {data.status === 'COMPLETED' ? '완료' :
                                    data.status === 'IN_PROGRESS' ? '진행중' :
                                        data.status === 'FAILED' ? '중단' : '대기'}
                            </div>
                            <div className="text-[12px] text-gray-500">
                                최근 업데이트: {new Date(data.startedAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 상세 분석 결과(네모 4개는 여기만 유지) */}
            <div className="px-4 py-1">
                <h3 className="text-sm font-semibold mb-2" style={{ color: colors.navy }}>상세 분석 결과</h3>
                <div className="grid grid-cols-2 gap-3">
                    {data.metrics.map(m => (
                        <div key={m.id} className="p-3 rounded-2xl border bg-white" style={{ borderColor: colors.paleBlue }}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-xs font-medium text-gray-800">{m.metricName}</div>
                                <StatusChip
                                    label={m.category === 'WEAKNESS' ? '부족' : m.category === 'STRENGTH' ? '양호' : '보통'}
                                    category={m.category}
                                />
                            </div>
                            <div className="text-2xl font-bold" style={{ color: colors.navy }}>{m.score}</div>
                            <div className="text-[11px] text-gray-500">값: {m.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 개선안: 접기/펼치기 (개선시 도달 가능 확률을 내부로 이동) */}
            <div className="px-4 py-3">
                <button
                    onClick={() => setOpenImp(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white border font-semibold"
                    style={{ borderColor: colors.paleBlue, color: colors.navy }}
                >
                    향상 방법과 예상 확률 {openImp ? '닫기' : '자세히 보기'}
                    <span className={`transition-transform ${openImp ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {openImp && (
                    <div className="mt-3 space-y-3">
                        {/* 개선 시 도달 가능 확률 요약 배너 */}
                        <div className="rounded-2xl p-4 bg-white border shadow-sm" style={{ borderColor: colors.paleBlue }}>
                            <div className="text-sm font-semibold mb-1" style={{ color: colors.navy }}>
                                개선 시 도달 가능 확률
                            </div>
                            <div className="flex items-end justify-between">
                                <div className="text-[13px] text-gray-600">
                                    현재 예상 {data.expectedProbability}% <span className="mx-2">→</span>
                                    <b className="text-base" style={{ color: colors.navy }}>최대 {impSummary.target}%</b>
                                </div>
                                <div className="text-xs text-gray-500">총 상승 여지: +{impSummary.sum}%p</div>
                            </div>
                        </div>

                        {/* 개선안 리스트 */}
                        {data.suggestions.map(s => <ImprovementCard key={s.id} s={s} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
