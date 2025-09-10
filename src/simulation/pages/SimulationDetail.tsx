import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { SimulationDetail } from '../types';
import LabeledStepper from '../components/LabeledStepper';
import PolicySummaryCard from '../components/PolicySummaryCard';
import DetailStatCard from '../components/DetailStatCard';
import ImprovementSummaryCard from '../components/ImprovementSummaryCard';
import { colors } from '@/styles/colors';
import { MOCK_DETAIL } from '../utils/mock';

/** 연한 회색 느낌표 (타이틀 옆) */
function InfoHint() {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative inline-block">
            <button
                aria-label="점수 산정 안내"
                onClick={() => setOpen(v => !v)}
                className="w-5 h-5 rounded-full grid place-items-center text-[11px]"
                style={{
                    background: '#FFFFFF',
                    color: '#9CA3AF',
                    border: '1px solid #E5E7EB', // 얇은 연회색 테두리
                }}
            >
                !
            </button>
            {open && (
                <div
                    className="absolute z-10 mt-2 w-72 text-[12px] leading-relaxed rounded-xl shadow-lg p-3 right-0"
                    style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#374151' }}
                >
                    이 점수는 <b>가이드온(Guide ON)</b> 전용 방식으로,
                    <br />서류(60)·신용(30)·사업계획서(10) 가중합 결과입니다.
                    <br />금융기관의 실제 평가와 다를 수 있습니다.
                </div>
            )}
        </div>
    );
}

export default function SimulationDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();
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

    // ---- 계산부 -------------------------------------------------------------
    const metrics = useMemo(() => {
        const byName = (n: string) => data?.metrics.find(m => m.metricName.includes(n));
        const doc = byName('서류완성도');
        const credit = byName('신용등급');
        const plan = byName('사업계획서') || byName('사업 계획서') || byName('사업계획서 평가');

        const docPct = doc?.value ?? null;
        const docScore = docPct === 100 ? 100 : 0;

        const creditRaw = credit?.value ?? null;
        const creditNorm = creditRaw != null ? Math.max(0, Math.min(100, Math.round((creditRaw / 1000) * 100))) : 0;

        const planScore = plan?.value ?? plan?.score ?? 0;

        const expected = Math.round(0.6 * docScore + 0.3 * creditNorm + 0.1 * planScore);
        const docTag = docScore === 100 ? '충족' : '미충족';

        const creditGrade = (() => {
            const v = creditRaw ?? 0;
            if (v >= 900) return 'AAA';
            if (v >= 800) return 'AA';
            if (v >= 700) return 'A';
            if (v >= 600) return 'BBB';
            if (v >= 500) return 'BB';
            if (v >= 400) return 'B';
            if (v >= 300) return 'CCC';
            if (v >= 200) return 'CC';
            return 'C';
        })();

        const planCat = planScore >= 90 ? '양호' : planScore >= 75 ? '보통' : planScore >= 55 ? '부족' : '위험';
        const improvedTarget = Math.min(100, Math.round(0.6 * 100 + 0.3 * creditNorm + 0.1 * planScore));
        const pass = expected >= 80;

        return {
            docPct, docTag, creditRaw, creditNorm, creditGrade, planScore, planCat,
            expected, improvedTarget, pass,
        };
    }, [data]);

    if (loading) return <div className="p-4">로딩 중...</div>;
    if (!data) return <div className="p-4">데이터가 없습니다.</div>;

    const goDetail = (slug: string) => nav(`/simulation/insight/${slug}?id=${data.id}`);

    // 개선 힌트(상위 2개만)
    const topHints: string[] = [];
    if (metrics.docTag === '미충족') topHints.push('서류 100% 충족 시 대폭 상승');
    if (metrics.planScore < 75)       topHints.push('사업계획서 보완 시 추가 상승');
    if (topHints.length === 0)         topHints.push('소폭 개선 여지');

    // ---- UI -------------------------------------------------------------
    return (
        <div className="min-h-screen" style={{ background: colors.bgSoft }}>
            <LabeledStepper steps={data.steps.map(s => ({ stepCode: s.stepCode, status: s.status }))} />

            {/* 상단 요약 카드 (테두리 X + 그림자) */}
            {/* 상단 요약 카드 (간격 살짝 축소) */}
            <div className="px-4 mt-3">
                <PolicySummaryCard
                    policyTitle="KB 소상공인 지원 정책자금"
                    expected={metrics.expected}
                    improvedTarget={metrics.improvedTarget}
                    executedAt={data.startedAt}
                    isPass={metrics.pass}
                />
            </div>


            {/* 상세 분석 결과 */}
            <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-[15px] font-bold" style={{color: colors.navy}}>상세 분석 결과</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <DetailStatCard
                        title="대출 가능 여부"
                        chip={{ label: metrics.pass ? '가능' : '불가능', tone: metrics.pass ? 'ok' : 'bad' }}
                        main={<span>{metrics.pass ? 'P' : 'NP'}</span>}
                        desc="80% 이상 PASS"
                        onClick={() => goDetail('pass')}
                    />

                    <DetailStatCard
                        title="서류완성도"
                        chip={{ label: metrics.docTag, tone: metrics.docTag === '충족' ? 'ok' : 'warn' }}
                        main={<span>{metrics.docPct ?? '-'}%</span>}
                        desc="제출/전체 100% 충족 시 가점"
                        onClick={() => goDetail('documents')}
                    />

                    <DetailStatCard
                        title="신용등급"
                        chip={{ label: metrics.creditGrade, tone: metrics.creditNorm >= 75 ? 'ok' : metrics.creditNorm >= 55 ? 'warn' : 'bad' }}
                        main={<span>{metrics.creditRaw ?? '-'}점</span>}
                        desc={`1000점 기준 변환 (${metrics.creditNorm}%)`}
                        onClick={() => goDetail('credit')}
                        showSearchIcon
                    />

                    <DetailStatCard
                        title="사업계획서 평가"
                        chip={{
                            label: metrics.planCat,
                            tone: metrics.planScore >= 90 ? 'ok' : metrics.planScore >= 75 ? 'ok' : metrics.planScore >= 55 ? 'warn' : 'bad',
                        }}
                        main={<span>{metrics.planScore}점</span>}
                        desc="0~100점 (위험/부족/보통/양호)"
                        onClick={() => goDetail('business-plan')}
                        showSearchIcon
                    />
                </div>
            </div>

            {/* 개선 요약: 펼치면 '한 장'만 */}
            <div className="px-4 pb-24">
                <button
                    onClick={() => setOpenImp(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white font-semibold shadow-sm"
                    style={{ color: colors.navy }}
                >
                    향상 방법과 예상 확률 {openImp ? '닫기' : '자세히 보기'}
                    <span className={`transition-transform ${openImp ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {openImp && (
                    <div className="mt-3">
                        <ImprovementSummaryCard
                            currentExpected={metrics.expected}
                            improvedTarget={metrics.improvedTarget}
                            topHints={topHints}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
