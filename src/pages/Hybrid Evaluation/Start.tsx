import { useMemo, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  FaBars,
  FaQuestionCircle,
  FaFileUpload,
  FaTimes,
  FaCheckCircle,
} from 'react-icons/fa';
import { colors } from '../../styles/colors';
import LoadingOverlay from './Loading';
import ResultOverlay from './Result';

type CategoryKey = 'sales' | 'cashflow' | 'esg' | 'ceo';

const CATEGORY_CONTENT: Record<
  CategoryKey,
  { title: string; desc: string; items: string[] }
> = {
  sales: {
    title: '매출 안정성 및 성장성',
    desc: '사업이 실제로 돈을 ��마나 잘 벌고 있는지를 평가합니다.',
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
    items: ['환경규제 준수', '근���·거버넌스 정책', '공급망/사회적 책임'],
  },
  ceo: {
    title: '대표자 금융 신용도(기존 신용점수)',
    desc: '대표자의 신용정보를 기반으로 기업의 상환능력 리스크를 보완 평가합니다.',
    items: [
      '상환이력',
      '부채수준',
      '신���거래기간',
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
            <h4 className="text-sm font-extrabold tracking-tight">{title}</h4>
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
    className="w-full rounded-md px-4 py-3 text-sm flex items-center justify-between"
    style={{
      backgroundColor: active ? colors.gray : colors.white,
      border: `1px solid ${active ? '#D1D5DB' : '#E5E7EB'}`,
      fontWeight: active ? 700 : 500,
    }}
  >
    <span className="truncate text-left">{label}</span>
    {done ? <FaCheckCircle color="#16A34A" /> : null}
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

const UploadCard = ({
  onPdfPicked,
  fileName,
}: {
  onPdfPicked: (f: File) => void;
  fileName?: string;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div
      className="rounded-md p-4 space-y-3"
      style={{ border: '1px solid #E5E7EB' }}
    >
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-md"
        style={{ backgroundColor: colors.gray }}
      >
        <FaFileUpload />
        <span>
          {fileName ? `업로드됨: ${fileName}` : '파일을 클릭하여 업로드'}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPdfPicked(f);
        }}
      />
    </div>
  );
};

const StartHybridEvaluation = () => {
  const [selected, setSelected] = useState<CategoryKey>('sales');
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isAttachHelpModalOpen, setAttachHelpModalOpen] = useState(false);
  const [isConsentModalOpen, setConsentModalOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isListOpen, setListOpen] = useState(true);
  const [fileNames, setFileNames] = useState<
    Record<CategoryKey, string | undefined>
  >({
    sales: undefined,
    cashflow: undefined,
    esg: undefined,
    ceo: undefined,
  });
  const [completed, setCompleted] = useState<Record<CategoryKey, boolean>>({
    sales: false,
    cashflow: false,
    esg: false,
    ceo: false,
  });

  const content = useMemo(() => CATEGORY_CONTENT[selected], [selected]);

  const [isSubmitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    setShowResult(false);
    setSubmitting(true);
    setProgress(0);
    const start = Date.now();
    const total = 5000;
    const id = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / total) * 100));
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(id);
        setSubmitting(false);
        setShowResult(true);
      }
    }, 100);
  };

  return (
    <div className="px-4 py-6 space-y-5">
      <h2 className="flex items-center justify-between text-base font-bold">
        <span>항목 선택</span>
        <button aria-label="항목 토글" onClick={() => setListOpen((v) => !v)}>
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

      <section
        className="pt-3 space-y-3"
        style={{ borderTop: '1px solid #E5E7EB' }}
      >
        <h3 className="text-xl font-extrabold">{content.title}</h3>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          {content.desc}
        </p>

        <div className="flex items-center gap-2">
          <span className="font-semibold">평가 항목</span>
          <button aria-label="도움말" onClick={() => setHelpModalOpen(true)}>
            <FaQuestionCircle />
          </button>
        </div>

        <div
          className="rounded-md p-3 text-sm space-y-1"
          style={{ border: '1px solid #E5E7EB' }}
        >
          {content.items.map((it) => (
            <div key={it} className="flex items-start gap-2">
              <span>•</span>
              <span>{it}</span>
            </div>
          ))}
        </div>

        {selected === 'ceo' && (
          <div
            className="mt-2 rounded-md border p-3 space-y-2 bg-gray-50"
            style={{ borderColor: '#E5E7EB' }}
          >
            <p className="text-sm text-gray-700">
              <span className="font-semibold">신용정보 조회 동의:</span>{' '}
              신용점수를 조회하기 위한 서비스 이용 약관 및 개인(신용)���보 조회
              동의 절차를 진행합니다.
            </p>
            <button
              aria-label="신용정보 조회 동의"
              onClick={() => setConsentModalOpen(true)}
              className="w-full rounded-md py-3 text-white font-medium"
              style={{ backgroundColor: colors.blue }}
            >
              신용정보 조회 동의
            </button>
          </div>
        )}

        {selected === 'cashflow' && (
          <div
            className="mt-2 rounded-md border p-3 space-y-2 bg-gray-50"
            style={{ borderColor: '#E5E7EB' }}
          >
            <p className="text-sm text-gray-700">
              <span className="font-semibold">계좌연결 및 조회 동의:</span>{' '}
              현금흐름 분석을 위해 사업자(또는 대표자) 명의 계좌를 연결하고 최근
              거래내역 조회에 동의해 주세요.
            </p>
            <button
              aria-label="계좌연결 및 조회 동의"
              onClick={() => setBankConsentOpen(true)}
              className="w-full rounded-md py-3 text-white font-medium"
              style={{ backgroundColor: colors.blue }}
            >
              계좌연결 및 조회 동의
            </button>
          </div>
        )}

        {selected !== 'ceo' && selected !== 'cashflow' && (
          <>
            <div className="flex items-center gap-2 pt-2">
              <span className="font-semibold">관련 서류 첨부</span>
              <button
                aria-label="도움말"
                onClick={() => setAttachHelpModalOpen(true)}
              >
                <FaQuestionCircle />
              </button>
            </div>
            <UploadCard
              fileName={fileNames[selected]}
              onPdfPicked={(f) => {
                setFileNames((prev) => ({ ...prev, [selected]: f.name }));
                setCompleted((prev) => ({ ...prev, [selected]: true }));
              }}
            />
          </>
        )}
        <button
          onClick={handleSubmit}
          className="mt-4 w-full rounded-md py-3 text-white font-semibold"
          style={{ backgroundColor: colors.blue }}
        >
          제출하기
        </button>
      </section>

      {isSubmitting && <LoadingOverlay progress={progress} />}

      {showResult && <ResultOverlay onClose={() => setShowResult(false)} />}

      <Modal
        open={isHelpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title="평가 항목 도���말"
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
                      활용비중
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
                          className="h-full rounded bg-emerald-500"
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
                          className="h-full rounded bg-emerald-500"
                          style={{ width: '24.5%' }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">신용거래기간</td>
                    <td className="border border-gray-200 p-2">
                      신용 ��래 기간 (최초/최근 개설로부터 기간)
                    </td>
                    <td className="border border-gray-200 p-2 text-right whitespace-nowrap">
                      12.3%
                      <div className="mt-1 h-1.5 rounded bg-gray-100">
                        <div
                          className="h-full rounded bg-emerald-500"
                          style={{ width: '12.3%' }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">신용��태</td>
                    <td className="border border-gray-200 p-2">
                      신용 거래 패턴 (체크/신용카드 이용 정보)
                    </td>
                    <td className="border border-gray-200 p-2 text-right whitespace-nowrap">
                      27.5%
                      <div className="mt-1 h-1.5 rounded bg-gray-100">
                        <div
                          className="h-full rounded bg-emerald-500"
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
                          className="h-full rounded bg-emerald-500"
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
                <span className="font-medium">��기 안내:</span>
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
                      평���영역
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
                      연체 진행 일�� 증가
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
                      보증 및 대출의 발생은 상환부담에 따른 신용위험이 있는
                      것으로 판단되어 평��상 영향��을 행사하며, 반대로 상환
                      시에는 신용위험이 감소된 것으로 판단되어 신용평점에
                      긍정적인 영향을 주�� 됩니다.
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
                      신용거래 기간은 시간이 경��할수록 긍정적인 요인으로
                      분류됩니다.
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50/60">
                    <td className="border border-gray-200 p-2">
                      신용거래 기��� 경과
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
                      영��을 미칩니다.
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
                      비금융/��이데이터
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
                      등록된 저축성 금융자산(수신 등) 거래내역���보 제출 시
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
              학력 등의 민감정보, 현금서비스 소득원 및 신용조회 이���정보는
              신용평가에 반영되지 않습니다.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700">
              항목은 선택된 주제의 세부 평가 요소입니다. 각 항목의 증빙 자료를
              함께 제출하면 정확도가 높아집니다.
            </p>
            <div
              className="mt-3 rounded-md p-3 text-xs space-y-1"
              style={{
                backgroundColor: colors.paleBlue,
                border: `1px solid ${colors.lightBlue}`,
              }}
            >
              <div className="font-semibold text-gray-800">
                현재 ��택: {content.title}
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
          <li>매출·현금흐름 관련 증빙(PDF, 스캔본 등)을 업로드하세요.</li>
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
                본 서비스는 신용점수 ���회 및 신용평가 보조 기능�� 제공합니다.
              </li>
              <li>부정 사용 방지를 위해 본인인증이 필요할 수 있습니다.</li>
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
                수집 항목: 성명, 생년월일, 연락처, CI/DI, 신용점수·등급,
                대출·연체정보 등.
              </li>
              <li>
                이용 목적: 신용점수 조회, 본인확인, 서비스 제공 및 고객 상담.
              </li>
              <li>보유 기간: 동의일로부터 3년 또는 관련 법령에 따른 기간.</li>
              <li>제공 받는 자: 신용정보회사 및 제휴 신용평가 기관.</li>
              <li>
                동의 거부 권리 및 불이익: 동의하지 않을 경�� 신용점수 조회가
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
              className="flex-1 rounded-md py-2 text-white disabled:opacity-50"
              style={{ backgroundColor: colors.blue }}
            >
              동의하고 조회 진행
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StartHybridEvaluation;
