import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LabeledStepper from '../components/LabeledStepper';
import PolicySummaryCard from '../components/PolicySummaryCard';
import DetailStatCard from '../components/DetailStatCard';
import ImprovementSummaryCard from '../components/ImprovementSummaryCard';
import { colors } from '@/styles/colors';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { SimulationStepCode, SimulationStatus } from '../types';
import { fetchSimulationDetail, type DetailVM } from '../api';
import { useAuthStore } from '@/stores/useAuthStore';
import { AUTH_REQUIRED_EVENT } from '@/community/utils/api';
import { getSessionStep } from '@/api/sessionApi';

// 스텝 상태 계산
function stepStatus(vm: DetailVM): Array<{ stepCode: SimulationStepCode; status: SimulationStatus }> {
    const docDone = vm.docSessionStatus === 'COMPLETED';
    const creditDone = vm.totalCreditScore != null;
    const planDone = vm.planTotalScore != null;
    const finalDone = vm.overallStatus === 'COMPLETED';

    const sDoc: SimulationStatus = docDone ? 'COMPLETED' : (vm.currentStep === 'DOCS' ? 'IN_PROGRESS' : 'PENDING');
    const sCredit: SimulationStatus = creditDone ? 'COMPLETED' : (vm.currentStep === 'CREDIT' ? 'IN_PROGRESS' : 'PENDING');
    const sPlan: SimulationStatus = planDone ? 'COMPLETED' : (vm.currentStep === 'PLAN' ? 'IN_PROGRESS' : 'PENDING');
    const sFinal: SimulationStatus =
        finalDone ? 'COMPLETED' : (vm.currentStep === 'RESULT' ? 'IN_PROGRESS' : 'PENDING');

    return [
        { stepCode: 'DOCUMENT_CHECK', status: sDoc },
        { stepCode: 'CREDIT_CHECK', status: sCredit },
        { stepCode: 'BUSINESS_PLAN', status: sPlan },
        { stepCode: 'FINAL_REVIEW', status: sFinal },
    ];
}

export default function SimulationDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();
    const [vm, setVm] = useState<DetailVM | null>(null);
    const [loading, setLoading] = useState(true);
    const [openImp, setOpenImp] = useState(false);

    const user = useAuthStore((s) => s.user);
    const isLoggedIn = !!user?.email || (user?.roles?.length ?? 0) > 0;

    // ✅ 비로그인: 모달 오픈 + API 호출 스킵
    useEffect(() => {
        if (!isLoggedIn) {
            window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
            setLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn || !id) return;
        let alive = true;
        (async () => {
            try {
                // 먼저 현재 단계 확인
                const stepData = await getSessionStep(id);
                if (!alive) return;
                
                // currentStep이 RESULT가 아니면 해당 단계로 리다이렉트
                if (stepData.currentStep !== 'RESULT') {
                    let redirectPath = '';
                    switch (stepData.currentStep) {
                        case 'DOCS':
                            redirectPath = `/guide/documents/${id}`;
                            break;
                        case 'CREDIT':
                            redirectPath = `/hybrid-evaluation/${id}`;
                            break;
                        case 'PLAN':
                            redirectPath = `/guide/${id}/business-plan/ready`;
                            break;
                    }
                    if (redirectPath) {
                        nav(redirectPath, { replace: true });
                        return;
                    }
                }
                
                // RESULT 단계면 시뮬레이션 상세 데이터 로드
                const data = await fetchSimulationDetail(Number(id));
                if (alive) setVm(data);
            } catch (error) {
                console.error('세션 단계 확인 또는 시뮬레이션 데이터 로드 실패:', error);
                // 에러 발생 시에도 시뮬레이션 데이터 로드 시도
                try {
                    const data = await fetchSimulationDetail(Number(id));
                    if (alive) setVm(data);
                } catch (fallbackError) {
                    console.error('시뮬레이션 데이터 로드 실패:', fallbackError);
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [id, isLoggedIn, nav]);

    // ---- 계산부: 가중합/태그/등급 등 ----
    const metrics = useMemo(() => {
        if (!vm) return null;
        const docPct = vm.docSessionStatus === 'COMPLETED' ? 100 : 0;
        const creditNorm = vm.creditNormPct; // 0~100
        const planScore = vm.planTotalScore ?? 0;

        const expected = vm.totalProbabilityPct; // 백엔드 생성 컬럼 가중합
        const improvedTarget = Math.min(100, Math.round(0.6 * 100 + 0.3 * creditNorm + 0.1 * planScore));
        const pass = expected >= 80;

        const creditGrade = (() => {
            const v = vm.totalCreditScore ?? 0;
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
        const docTag = docPct === 100 ? '충족' : '미충족';

        return { docPct, docTag, creditNorm, creditGrade, planScore, planCat, expected, improvedTarget, pass };
    }, [vm]);

    if (loading) {
        return (
            <div className="p-4 text-center">
                <LoadingSpinner type="dots" color="#25437B" />
            </div>
        );
    }
    if (!isLoggedIn) return <div className="p-4">로그인 후 이용해주세요.</div>;
    if (!vm || !metrics) return <div className="p-4">데이터가 없습니다.</div>;

    const goDetail = (slug: string) => nav(`/simulation/insight/${slug}?id=${vm.id}`);

    const topHints: string[] = [];
    if (metrics.docTag === '미충족') topHints.push('서류 100% 충족 시 대폭 상승');
    if (metrics.planScore < 75)       topHints.push('사업계획서 보완 시 추가 상승');
    if (topHints.length === 0)         topHints.push('소폭 개선 여지');

    return (
        <div className="min-h-screen" style={{ background: colors.bgSoft }}>
            <LabeledStepper steps={stepStatus(vm)} />

            <div className="px-4 mt-3">
                <PolicySummaryCard
                    policyTitle={vm.fundName}
                    expected={metrics.expected}
                    improvedTarget={metrics.improvedTarget}
                    executedAt={vm.startedAt}
                    isPass={metrics.pass}
                />
            </div>

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
                        main={<span>{metrics.docPct}%</span>}
                        desc="제출/전체 100% 충족 시 가점"
                        onClick={() => goDetail('documents')}
                    />

                    <DetailStatCard
                        title="신용등급"
                        chip={{ label: metrics.creditGrade, tone: metrics.creditNorm >= 75 ? 'ok' : metrics.creditNorm >= 55 ? 'warn' : 'bad' }}
                        main={<span>{vm.totalCreditScore ?? '-'}점</span>}
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
