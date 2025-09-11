import { useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  FaBars,
  FaQuestionCircle,
  FaTimes,
  FaCheckCircle,
} from 'react-icons/fa';
import LoadingOverlay from './Loading';
import ResultOverlay from './Result';
import { useNavigate, useParams } from 'react-router-dom';
import {
  creditEvaluationApi,
  type CreditEvaluationCreateRequest,
  type CreditEvaluationResponse,
} from '../../api/creditEvaluationApi';
import { useAuthStore } from '../../stores/useAuthStore';
import { EsgSection } from './components/EsgSection';
import { SalesSection } from './components/SalesSection';
import { CashflowSection } from './components/CashflowSection';
import { CeoSection } from './components/CeoSection';
import { UploadCard } from './components/UploadCard';
import { colors } from '@/styles/colors';

type CategoryKey = 'sales' | 'cashflow' | 'esg' | 'ceo';

const CATEGORY_CONTENT: Record<
  CategoryKey,
  { title: string; desc: string; items: string[] }
> = {
  sales: {
    title: '매출 안정성 및 성장성',
    desc: '사업이 실제로 돈을 얼마나 잘 벌고 있는지를 평가합니다.',
    items: ['월/분기별 매출 추이', '매출 변동성', '전년/월 동기 대비 성장률'],
  },
  cashflow: {
    title: '현금흐름 건전성',
    desc: '현금의 유입과 유출이 안정적으로 관리되고 있는지를 평가합니다.',
    items: ['영업현금흐름 추이', '부채상환 커버리지', '현금보유 및 유동성'],
  },
  esg: {
    title: 'ESG',
    desc: '환경·사회·지배구조 측면에서의 리스크와 지속가능성을 평가합니다.',
    items: ['환경규제 준수', '근로·거버넌스 정책', '공급망/사회적 책임'],
  },
  ceo: {
    title: '대표자 금융 신용도(기존 신용점수)',
    desc: '대표자의 신용정보를 기반으로 기업의 상환능력 리스크를 보완 평가합니다.',
    items: [
      '상환이력',
      '부채수준',
      '신용거래기간',
      '신용형태',
      '비금융/마이데이터',
    ],
  },
};

const Modal = ({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[343px] max-h-[calc(100vh-64px)] mx-4 overflow-auto rounded-xl bg-white shadow-lg">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-white/95 px-4 py-3 backdrop-blur">
          {title ? (
            <h4 className="text-sm font-extrabold tracking-tight text-navy">
              {title}
            </h4>
          ) : (
            <div />
          )}
          <button
            aria-label="닫기"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        <div className="px-4 py-3">{children}</div>
      </div>
    </div>
  );
};

const CategoryButton = ({
  active,
  label,
  done,
  onClick,
}: {
  active: boolean;
  label: string;
  done?: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={[
      'w-full rounded-xl px-4 py-3 text-sm flex items-center justify-between transition-colors shadow-[0_12px_36px_rgba(17,24,39,0.06)]',
      active
        ? 'bg-paleBlue font-semibold text-navy shadow-sm'
        : 'bg-white hover:bg-gray-50',
    ].join(' ')}
  >
    <span className="truncate text-left">{label}</span>
    {done ? <FaCheckCircle className="text-blue" /> : null}
  </button>
);

const ScoreChip = ({ v }: { v: string }) => {
  const styleMap: Record<string, string> = {
    '--': 'bg-red-100 text-red-700',
    '-': 'bg-red-50 text-red-600',
    '+': 'bg-emerald-50 text-emerald-700',
    '++': 'bg-emerald-100 text-emerald-800',
  };
  const cls = styleMap[v] ?? 'bg-gray-50 text-gray-700';
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${cls}`}
    >
      {v}
    </span>
  );
};

const StartHybridEvaluation = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  console.log('🔍 [StartHybridEvaluation] URL sessionId:', sessionId);
  console.log('🔍 [StartHybridEvaluation] user.sessionId:', user?.sessionId);
  const [selected, setSelected] = useState<CategoryKey>('sales');
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isAttachHelpModalOpen, setAttachHelpModalOpen] = useState(false);
  const [isConsentModalOpen, setConsentModalOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isBankConsentOpen, setBankConsentOpen] = useState(false);
  const [bankConsentChecked, setBankConsentChecked] = useState(false);
  const [isListOpen, setListOpen] = useState(true);
  const defaultFileNames: Record<CategoryKey, string | undefined> = {
    sales: undefined,
    cashflow: undefined,
    esg: undefined,
    ceo: undefined,
  };
  const [fileNames, setFileNames] = useState<
    Record<CategoryKey, string | undefined>
  >(() => {
    try {
      const raw = localStorage.getItem('hybridStart.files');
      if (raw) return { ...defaultFileNames, ...JSON.parse(raw) };
    } catch {}
    return defaultFileNames;
  });
  const defaultCompleted: Record<CategoryKey, boolean> = {
    sales: false,
    cashflow: false,
    esg: false,
    ceo: false,
  };
  const [completed, setCompleted] = useState<Record<CategoryKey, boolean>>(
    () => {
      try {
        const raw = localStorage.getItem('hybridStart.completed');
        if (raw) return { ...defaultCompleted, ...JSON.parse(raw) };
      } catch {}
      return defaultCompleted;
    },
  );

  const content = useMemo(() => CATEGORY_CONTENT[selected], [selected]);

  // persist selection states
  useEffect(() => {
    try {
      localStorage.setItem('hybridStart.completed', JSON.stringify(completed));
    } catch {}
  }, [completed]);
  useEffect(() => {
    try {
      localStorage.setItem('hybridStart.files', JSON.stringify(fileNames));
    } catch {}
  }, [fileNames]);

  const [isSubmitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [evaluationResult, setEvaluationResult] =
    useState<CreditEvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  

  const handleSubmit = async () => {
    setShowResult(false);
    setSubmitting(true);
    setProgress(0);
    setError(null);

    try {
      // sessionId 검증
      console.log('🚀 [StartHybridEvaluation] handleSubmit - using sessionId:', sessionId);
      if (!sessionId) {
        throw new Error('세션 ID가 없어 신용평가를 진행할 수 없습니다. 다시 로그인해주세요.');
      }

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 90));
      }, 100);

      const evaluationData: CreditEvaluationCreateRequest = {
        sessionId: sessionId,
        totalOverdueCount: 0,
        recent12mOverdueCount: 0,
        maxOverdueDays: 0,
        currentOverdueAmount: 0,
        loanDefaultHistory: 0,
        creditCardDelayRate: 5.2,
        paymentConsistencyScore: 85,
        totalDebtAmount: 50000000,
        monthlyIncome: 8000000,
        debtToIncomeRatio: 62.5,
        creditCardUtilizationRate: 35.0,
        securedVsUnsecuredRatio: 70.0,
        creditHistoryMonths: 48,
        oldestCreditAccountMonths: 72,
        newCreditInquiries6m: 2,
        activeCreditCardCount: 3,
        totalCreditLimit: 15000000,
        loanTypeDiversity: 4,
        financialInstitutionCount: 2,
        alternativeCreditScore: 72,
      };

      const response = await creditEvaluationApi.create(evaluationData);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        setEvaluationResult(response.data);
        setTimeout(() => {
          setSubmitting(false);
          navigate(`/hybrid-evaluation/complete/${sessionId}`);
        }, 500);
      } else {
        throw new Error(response.message || '평��� 생성에 실패했습니다.');
      }
    } catch (err: any) {
      setSubmitting(false);
      setError(
        err.response?.data?.message ||
          err.message ||
          '신용평가 처리 중 오류가 발생했습니다.',
      );
      console.error('Credit evaluation error:', err);
    }
  };

  return (
    <div className="px-4 py-6 space-y-5" style={{ background: colors.bgSoft }}>
      <h2 className="flex items-center justify-between text-base font-bold text-navy">
        <span>항목 선택</span>
        <button
          aria-label="항목 토글"
          onClick={() => setListOpen((v) => !v)}
          className="text-gray-600 hover:text-navy"
        >
          <FaBars />
        </button>
      </h2>

      {isListOpen && (
        <div className="space-y-3">
          <CategoryButton
            active={selected === 'sales'}
            label="매출 안정성 및 성장성"
            done={completed.sales}
            onClick={() => setSelected('sales')}
          />
          <CategoryButton
            active={selected === 'cashflow'}
            label="현금흐름 건전성"
            done={completed.cashflow}
            onClick={() => setSelected('cashflow')}
          />
          <CategoryButton
            active={selected === 'esg'}
            label="ESG"
            done={completed.esg}
            onClick={() => setSelected('esg')}
          />
          <CategoryButton
            active={selected === 'ceo'}
            label="대표자 금융 신용도(기존 신용점수)"
            done={completed.ceo}
            onClick={() => setSelected('ceo')}
          />
        </div>
      )}

      <section className="pt-3 space-y-3 border-t border-gray-200">
        {selected === 'esg' ? (
          <EsgSection
            completed={completed}
            onHelpClick={() => setHelpModalOpen(true)}
            onAttachHelpClick={() => setAttachHelpModalOpen(true)}
            onComplete={() => {
              setCompleted((prev) => ({ ...prev, esg: true }));
            }}
          />
        ) : selected === 'sales' ? (
          <SalesSection
            content={content}
            fileNames={fileNames}
            completed={completed}
            error={error}
            isSubmitting={isSubmitting}
            sessionId={sessionId || ''}
            onHelpClick={() => setHelpModalOpen(true)}
            onAttachHelpClick={() => setAttachHelpModalOpen(true)}
            onFileUpload={(f) => {
              const nextFiles = { ...fileNames, [selected]: f.name };
              const nextCompleted = {
                ...completed,
                [selected]: true,
              } as Record<CategoryKey, boolean>;
              setFileNames(nextFiles);
              setCompleted(nextCompleted);
              try {
                localStorage.setItem(
                  'hybridStart.files',
                  JSON.stringify(nextFiles),
                );
                localStorage.setItem(
                  'hybridStart.completed',
                  JSON.stringify(nextCompleted),
                );
              } catch {}
            }}
            onCsvUploadComplete={(fileName) => {
              // sales 항목을 완료로 표시
              setCompleted((prev) => ({ ...prev, sales: true }));
              
              // 파일명 저장
              setFileNames((prev) => ({ ...prev, sales: fileName }));
              
              // 로컬 스토리지에 상태 저장
              try {
                localStorage.setItem('hybridStart.completed', JSON.stringify({ ...completed, sales: true }));
                localStorage.setItem('hybridStart.files', JSON.stringify({ ...fileNames, sales: fileName }));
              } catch (storageError) {
                console.warn('로컬 스토리지 저장 실패:', storageError);
              }
            }}
            onSubmit={handleSubmit}
          />
        ) : selected === 'cashflow' ? (
          <CashflowSection
            content={content}
            completed={completed}
            error={error}
            isSubmitting={isSubmitting}
            onHelpClick={() => setHelpModalOpen(true)}
            onBankConsentClick={() => setBankConsentOpen(true)}
            onSubmit={handleSubmit}
          />
        ) : selected === 'ceo' ? (
          <CeoSection
            content={content}
            completed={completed}
            error={error}
            isSubmitting={isSubmitting}
            onHelpClick={() => setHelpModalOpen(true)}
            onConsentClick={() => setConsentModalOpen(true)}
            onSubmit={handleSubmit}
          />
        ) : null}
      </section>

      {isSubmitting && <LoadingOverlay progress={progress} />}

      {showResult && (
        <ResultOverlay
          onClose={() => setShowResult(false)}
          evaluationResult={evaluationResult}
        />
      )}

      <Modal
        open={isHelpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title="평가 항목 도움말"
      >
        {selected === 'ceo' ? (
          <div className="space-y-6 text-[12px] text-gray-800">
            <div className="overflow-x-auto">
              <h5 className="mb-2 text-xs font-bold text-gray-700">
                활용비중 요약
              </h5>
              <table className="w-full border-collapse rounded-md overflow-hidden border border-gray-200 text-[12px]">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="border border-gray-200 p-2 text-left font-semibold">
                      평가 요소
                    </th>
                    <th className="border border-gray-200 p-2 text-left font-semibold">
                      상세내용
                    </th>
                    <th className="border border-gray-200 p-2 text-right font-semibold">
                      활��비중
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">상환이력</td>
                    <td className="border border-gray-200 p-2">
                      현재 연체 및 과거 채무 상환 이력
                    </td>
                    <td className="border border-gray-200 p-2 text-right whitespace-nowrap">
                      28.4%
                      <div className="mt-1 h-1.5 rounded bg-gray-100">
                        <div
                          className="h-full rounded bg-blue"
                          style={{ width: '28.4%' }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">부채수준</td>
                    <td className="border border-gray-200 p-2">
                      채무 부담 정보 (대출 및 보증채무 등)
                    </td>
                    <td className="border border-gray-200 p-2 text-right whitespace-nowrap">
                      24.5%
                      <div className="mt-1 h-1.5 rounded bg-gray-100">
                        <div
                          className="h-full rounded bg-blue"
                          style={{ width: '24.5%' }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">신용거래기간</td>
                    <td className="border border-gray-200 p-2">
                      신용 거래 기간 (최초/최근 개설로부터 기간)
                    </td>
                    <td className="border border-gray-200 p-2 text-right whitespace-nowrap">
                      12.3%
                      <div className="mt-1 h-1.5 rounded bg-gray-100">
                        <div
                          className="h-full rounded bg-blue"
                          style={{ width: '12.3%' }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">신용형태</td>
                    <td className="border border-gray-200 p-2">
                      신용 거래 패턴 (체크/신용카드 이용 정보)
                    </td>
                    <td className="border border-gray-200 p-2 text-right whitespace-nowrap">
                      27.5%
                      <div className="mt-1 h-1.5 rounded bg-gray-100">
                        <div
                          className="h-full rounded bg-blue"
                          style={{ width: '27.5%' }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      비금융/마이데이터
                    </td>
                    <td className="border border-gray-200 p-2">
                      비금융/마이데이터정보(성실납부실적 등)
                    </td>
                    <td className="border border-gray-200 p-2 text-right whitespace-nowrap">
                      7.3%
                      <div className="mt-1 h-1.5 rounded bg-gray-100">
                        <div
                          className="h-full rounded bg-blue"
                          style={{ width: '7.3%' }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 p-2 font-semibold">
                      계
                    </td>
                    <td className="border border-gray-200 p-2" />
                    <td className="border border-gray-200 p-2 text-right font-semibold">
                      100.0%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                <span className="font-medium">표기 안내:</span>
                <ScoreChip v="++" /> 긍정적 영향이 큼
                <ScoreChip v="+" /> 긍정적 영향
                <ScoreChip v="-" /> 부정적 영향
                <ScoreChip v="--" /> 부정적 영향이 큼
              </div>
              <h5 className="mb-2 text-xs font-bold text-gray-700">
                세부 변동 요인
              </h5>
              <table className="w-full border-collapse rounded-md overflow-hidden border border-gray-200 text-[12px]">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="border border-gray-200 p-2 text-left font-semibold">
                      평가영역
                    </th>
                    <th className="border border-gray-200 p-2 text-left font-semibold">
                      신용평가 요소
                    </th>
                    <th className="border border-gray-200 p-2 text-center font-semibold">
                      일반고객군
                    </th>
                    <th className="border border-gray-200 p-2 text-center font-semibold">
                      장기연체군
                    </th>
                    <th className="border border-gray-200 p-2 text-left font-semibold">
                      평가개요
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td
                      className="border border-gray-200 align-top p-2"
                      rowSpan={6}
                    >
                      상환이력정보
                    </td>
                    <td className="border border-gray-200 p-2">
                      장기연체 발생
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="--" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="--" />
                    </td>
                    <td className="border border-gray-200 p-2" rowSpan={6}>
                      단기연체의 기준은 5영업일 10만원 이상이며, 장기연체는 90일
                      이상 연체 등을 기준으로 하고 있습니다. 단, 임시적
                      소액연체는 신용평가에 활용되지 않습니다.
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      단기연체 발생
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="--" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="--" />
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      연체 진행 일수 증가
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="--" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="--" />
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">연체 해제</td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="++" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      연체 해제 일수 경과
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50/60">
                    <td className="border border-gray-200 p-2 font-medium">
                      비중
                    </td>
                    <td className="border border-gray-200 p-2 text-center font-medium">
                      27.4%
                    </td>
                    <td className="border border-gray-200 p-2 text-center font-medium">
                      47.8%
                    </td>
                    <td className="border border-gray-200 p-2" />
                  </tr>

                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td
                      className="border border-gray-200 align-top p-2"
                      rowSpan={8}
                    >
                      부채수준
                    </td>
                    <td className="border border-gray-200 p-2">
                      고위험 대출 발생
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="--" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="--" />
                    </td>
                    <td className="border border-gray-200 p-2" rowSpan={8}>
                      보증 및 대출의 발��은 상환부담에 따른 신용위험이 있는
                      것으로 판단되어 평가상 영향력을 행사하며, 반대로 상환
                      시에는 신용위���이 감소된 것으로 판단되어 신용평점에
                      긍정적인 영향을 주게 됩니다.
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      고위험 외 대출 발생
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="-" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="-" />
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      대출 잔액 증가
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="-" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="-" />
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      대출 분할 상환
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      대출 전액 상환
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="++" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="++" />
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">보증 발생</td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="-" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="-" />
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">보증 해소</td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50/60">
                    <td className="border border-gray-200 p-2 font-medium">
                      비중
                    </td>
                    <td className="border border-gray-200 p-2 text-center font-medium">
                      23.6%
                    </td>
                    <td className="border border-gray-200 p-2 text-center font-medium">
                      42.8%
                    </td>
                    <td className="border border-gray-200 p-2" />
                  </tr>

                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td
                      className="border border-gray-200 align-top p-2"
                      rowSpan={3}
                    >
                      신용거래기간
                    </td>
                    <td className="border border-gray-200 p-2">
                      신용거래 기간 없음
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="-" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="-" />
                    </td>
                    <td className="border border-gray-200 p-2" rowSpan={3}>
                      신용거래 기간은 시간이 경과할수록 긍정적인 요인으로
                      분류됩니다.
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      신용거래 기간 경과
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="++" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="++" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50/60">
                    <td className="border border-gray-200 p-2 font-medium">
                      비중
                    </td>
                    <td className="border border-gray-200 p-2 text-center font-medium">
                      12.5%
                    </td>
                    <td className="border border-gray-200 p-2 text-center font-medium">
                      9.4%
                    </td>
                    <td className="border border-gray-200 p-2" />
                  </tr>

                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td
                      className="border border-gray-200 align-top p-2"
                      rowSpan={5}
                    >
                      신용형태정보
                    </td>
                    <td className="border border-gray-200 p-2">
                      신용/체크카드 사용 개설
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="++" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="++" />
                    </td>
                    <td className="border border-gray-200 p-2" rowSpan={5}>
                      연체없이 사용하는 신용카드 사용은 긍정적인 요인이며,
                      지속/습관적인 할부 및 현금서비스의 과다 사용은 부정적인
                      영향을 미칩니다.
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      신용/체크카드 사용 금액 적정
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      과다 할부 사용
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="-" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="-" />
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      현금서비스 사용
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="-" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="-" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50/60">
                    <td className="border border-gray-200 p-2 font-medium">
                      비중
                    </td>
                    <td className="border border-gray-200 p-2 text-center font-medium">
                      28.9%
                    </td>
                    <td className="border border-gray-200 p-2 text-center font-medium">
                      0.0%
                    </td>
                    <td className="border border-gray-200 p-2" />
                  </tr>

                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td
                      className="border border-gray-200 align-top p-2"
                      rowSpan={5}
                    >
                      비금융/마이데이터
                    </td>
                    <td className="border border-gray-200 p-2">증빙소득</td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                    <td className="border border-gray-200 p-2" rowSpan={5}>
                      국민연금/건강보험/통신요금/아파트관리비 납부내역,
                      소득금액증명(소득여부만 확인) 등 비금융정보 제출 시
                      신용평점에 긍정적 요인으로 반영됩니다. 마이데이터를 통해
                      등록된 저축성 금융자산(수신 등) 거래내역정보 제출 시
                      신용평점에 긍정적 요인으로 반영됩니다.
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      비금융 성실납부실적
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      저축성 금융자산(수신 등) 마이데이터 정보
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <ScoreChip v="+" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50/60">
                    <td className="border border-gray-200 p-2 font-medium">
                      비중
                    </td>
                    <td className="border border-gray-200 p-2 text-center font-medium">
                      7.7%
                    </td>
                    <td className="border border-gray-200 p-2 text-center font-medium">
                      0.0%
                    </td>
                    <td className="border border-gray-200 p-2" />
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-gray-600">
              학력 등의 민감정보, 현금서비스 소득원 및 신용조회 이력정보는
              신용평가에 반영되지 않습니다.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700">
              항목은 선택된 주제의 세부 평가 요소입니다. 각 항목의 증빙 자료를
              함께 제출하면 정확도가 높아집니다.
            </p>
            <div className="mt-3 rounded-md p-3 text-xs space-y-1 bg-paleBlue border border-lightBlue">
              <div className="font-semibold text-navy">
                현재 선택: {content.title}
              </div>
              {content.items.map((it) => (
                <div key={it} className="flex items-start gap-2">
                  <span>•</span>
                  <span>{it}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={isAttachHelpModalOpen}
        onClose={() => setAttachHelpModalOpen(false)}
        title="관련 서류 첨부 도움말"
      >
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>매출·현금흐름 관련 증빙(PDF, 스캔본 등)��� 업로드하세요.</li>
          <li>파일 형식: PDF 권장, 최대 20MB.</li>
          <li>민감정보는 가급적 마스킹 후 제출해 주세요.</li>
        </ul>
      </Modal>

      <Modal
        open={isConsentModalOpen}
        onClose={() => setConsentModalOpen(false)}
        title="신용정보 조회 동의"
      >
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            신용점수 조회를 위해 아래 약관 및 개인(신용)정보 처리에 동의해
            주세요.
          </p>
          <div className="rounded-md border border-gray-200 p-3">
            <div className="text-xs font-bold mb-1">서비스 이용 약관 요약</div>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                본 서비스는 신용점수 조회 및 신용평가 보조 기능을 제공합니다.
              </li>
              <li>부정 사용 방지를 위해 본인인증이 필요����� 수 있습니다.</li>
              <li>
                약관은 관련 법령 개정 또는 서비스 정책에 따라 변경될 수
                있습니다.
              </li>
            </ul>
          </div>
          <div className="rounded-md border border-gray-200 p-3">
            <div className="text-xs font-bold mb-1">
              개인(신용)정보 수집·이용·제공 동의
            </div>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                수집 ���목: 성명, 생년월일, 연락처, CI/DI, 신용점수·등급,
                대출·연체정보 등.
              </li>
              <li>
                이용 목적: 신용점수 조회, 본인확인, 서비스 제공 및 고객 상담.
              </li>
              <li>보유 기간: 동의일로부터 3년 또는 관련 법령에 따른 기간.</li>
              <li>제공 받는 자: 신용정보회사 및 제휴 신용평가 기관.</li>
              <li>
                동의 거부 권리 및 불이익: 동의하지 않을 경우 신용점수 조회가
                제한됩니다.
              </li>
            </ul>
          </div>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
            />
            <span>위 내용을 확인하고 동의합니다.</span>
          </label>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setConsentModalOpen(false)}
              className="flex-1 rounded-md border border-gray-300 py-2 text-gray-700"
            >
              취소
            </button>
            <button
              disabled={!consentChecked}
              onClick={() => {
                setConsentModalOpen(false);
                setConsentChecked(false);
                setCompleted((prev) => ({ ...prev, ceo: true }));
              }}
              className="flex-1 rounded-md py-2 text-white disabled:opacity-50 bg-blue hover:bg-navy transition"
            >
              동의하고 조회 진행
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isBankConsentOpen}
        onClose={() => setBankConsentOpen(false)}
        title="계좌연결 및 조회 동의"
      >
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            현금흐름 분석을 위해 사업자(또는 대표자) 명의의 은행 계좌를 연결하고
            최근 거래내역 조회����� 동의해 주세요.
          </p>
          <div className="rounded-md border border-gray-200 p-3">
            <div className="text-xs font-bold mb-1">동의 내용 요약</div>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                조회 범위: 최근 거래내역, 잔액, 입·출금 내역 등 분석에 필요한
                항목.
              </li>
              <li>이용 목적: 현금흐름 건전성 평가 및 결과 제공.</li>
              <li>보유 기간: 동의일로부터 3년 또는 관련 법령에 따른 기간.</li>
              <li>제공 받는 자: 연결 대행사 및 금융API 제공기관.</li>
            </ul>
          </div>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={bankConsentChecked}
              onChange={(e) => setBankConsentChecked(e.target.checked)}
            />
            <span>위 내용을 확인하고 계좌연결 및 조회에 동의합니다.</span>
          </label>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setBankConsentOpen(false)}
              className="flex-1 rounded-md border border-gray-300 py-2 text-gray-700"
            >
              취소
            </button>
            <button
              disabled={!bankConsentChecked}
              onClick={() => {
                setBankConsentOpen(false);
                setBankConsentChecked(false);
                const nextCompleted = {
                  ...completed,
                  cashflow: true,
                } as Record<CategoryKey, boolean>;
                setCompleted(nextCompleted);
                try {
                  localStorage.setItem(
                    'hybridStart.completed',
                    JSON.stringify(nextCompleted),
                  );
                } catch {}
                navigate('/bank-connect');
              }}
              className="flex-1 rounded-md py-2 text-white disabled:opacity-50 bg-blue hover:bg-navy transition"
            >
              동의하고 계좌 연결 진행
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StartHybridEvaluation;
