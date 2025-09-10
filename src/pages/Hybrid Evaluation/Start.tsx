import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { FaBars, FaCheckCircle, FaFileUpload, FaQuestionCircle, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../styles/colors';
import LoadingOverlay from './Loading';
import ResultOverlay from './Result';
import type { CreditEvaluationResponse } from '../../api/creditEvaluationApi';

// 카테고리 키
type CategoryKey = 'sales' | 'cashflow' | 'esg' | 'ceo';

// 카테고리 콘텐츠
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
    items: ['상환이력', '부채수준', '신용거래기간', '신용형태', '비금융/마이데이터'],
  },
};

// ESG 단계 텍스트
const ESG_STEPS: { title: string; desc: string; items: string[] }[] = [
  {
    title: 'ESG (1/4)',
    desc: 'ESG 중 Environmental(환경 친화적 운영)을 평가합니다.',
    items: ['자원 관리 및 폐기물 감축', '에너지 효율성'],
  },
  {
    title: 'ESG (2/4)',
    desc: 'ESG 중 Social(사회적 책임 및 지역사회 상생)을 평가합니다.',
    items: ['노란우산 공제 성실 납부', '고객 리뷰', '식품/위생 안전 관리'],
  },
  {
    title: 'ESG (3/4)',
    desc: 'ESG 중 Governance(투명경영 및 준법경영)을 평가합니다.',
    items: ['성실납세 이력', '4대 보험료 납부 이력', '투명한 정보 공개'],
  },
  {
    title: 'ESG (4/4)',
    desc: 'ESG 추가 지표를 수기 입력합니다.',
    items: ['에너지 사용량 입력', '재활용률 입력', '안전사고 건수 입력', '기타 메모'],
  },
];

// 공통 모달
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
            <h4 className="text-sm font-extrabold tracking-tight text-navy">{title}</h4>
          ) : (
            <div />
          )}
          <button aria-label="닫기" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        <div className="px-4 py-3">{children}</div>
      </div>
    </div>
  );
};

// 카테고리 버튼
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
      'w-full rounded-md px-4 py-3 text-sm flex items-center justify-between border transition-colors',
      active ? 'bg-paleBlue border-lightBlue font-bold text-navy shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50',
    ].join(' ')}
  >
    <span className="truncate text-left">{label}</span>
    {done ? <FaCheckCircle className="text-blue" /> : null}
  </button>
);

// 점수 뱃지
const ScoreChip = ({ v }: { v: string }) => {
  const styleMap: Record<string, string> = {
    '--': 'bg-red-100 text-red-700',
    '-': 'bg-red-50 text-red-600',
    '+': 'bg-emerald-50 text-emerald-700',
    '++': 'bg-emerald-100 text-emerald-800',
  };
  const cls = styleMap[v] ?? 'bg-gray-50 text-gray-700';
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${cls}`}>{v}</span>
  );
};

// 업로드 카드
const UploadCard = ({
  onPicked,
  fileName,
  acceptTypes = 'application/pdf',
}: {
  onPicked: (f: File) => void;
  fileName?: string;
  acceptTypes?: string;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onPicked(f);
  };

  return (
    <div className="rounded-md p-4 space-y-3 border bg-white border-lightBlue/50">
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-paleBlue text-navy hover:bg-lightBlue/20 transition"
      >
        <FaFileUpload />
        <span>{fileName ? `업로드됨: ${fileName}` : '파일을 클릭하여 업로드'}</span>
      </button>
      <input ref={inputRef} type="file" accept={acceptTypes} className="hidden" onChange={handleFileChange} />
    </div>
  );
};

const StartHybridEvaluation = () => {
  const navigate = useNavigate();

  // 좌측 카테고리
  const [selected, setSelected] = useState<CategoryKey>('sales');
  const [isListOpen, setListOpen] = useState(true);

  // 파일명 & 완료 상태 - 로컬스토리지 지속
  const defaultFileNames: Record<CategoryKey, string | undefined> = {
    sales: undefined,
    cashflow: undefined,
    esg: undefined,
    ceo: undefined,
  };
  const [fileNames, setFileNames] = useState<Record<CategoryKey, string | undefined>>(() => {
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
  const [completed, setCompleted] = useState<Record<CategoryKey, boolean>>(() => {
    try {
      const raw = localStorage.getItem('hybridStart.completed');
      if (raw) return { ...defaultCompleted, ...JSON.parse(raw) };
    } catch {}
    return defaultCompleted;
  });

  useEffect(() => {
    try {
      localStorage.setItem('hybridStart.files', JSON.stringify(fileNames));
    } catch {}
  }, [fileNames]);
  useEffect(() => {
    try {
      localStorage.setItem('hybridStart.completed', JSON.stringify(completed));
    } catch {}
  }, [completed]);

  const content = useMemo(() => CATEGORY_CONTENT[selected], [selected]);

  // 진행/결과
  const [isSubmitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<CreditEvaluationResponse | null>(null);

  // CSV 처리 상태 (매출)
  const [csvRows, setCsvRows] = useState<string[][] | null>(null);
  const [csvStatus, setCsvStatus] = useState<string | null>(null);

  // CSV 컬럼(순서 고정)
  const csvColumns = [
    'total_sales_amount',
    'weekday_sales_amount',
    'weekend_sales_amount',
    'lunch_sales_ratio',
    'dinner_sales_ratio',
    'transaction_count',
    'weekday_transaction_count',
    'weekend_transaction_count',
    'mom_growth_rate',
    'yoy_growth_rate',
    'sales_cv',
    'avg_transaction_value',
    'cash_payment_ratio',
    'card_payment_ratio',
    'revisit_customer_sales_ratio',
    'new_customer_ratio',
  ];

  // CSV 파서(따옴표/쉼표 처리)
  const parseCsv = (text: string): string[][] => {
    const lines = text.trim().split(/\r?\n/);
    return lines.map((line) => {
      const row: string[] = [];
      let cur = '';
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          // 토글 (CSV 규격 간소화 버전)
          inQ = !inQ;
          continue;
        }
        if (ch === ',' && !inQ) {
          row.push(cur.trim());
          cur = '';
        } else {
          cur += ch;
        }
      }
      row.push(cur.trim());
      return row;
    });
  };

  // CSV 검증
  const validateCsvData = (
    data: string[][],
  ): { isValid: boolean; error?: string } => {
    if (data.length === 0) return { isValid: false, error: 'CSV 파일이 비어있습니다.' };

    let rows = data;
    let startIdx = 0;
    const first = data[0];
    const hasHeader = first.some((c) => isNaN(Number(c)) && c.trim() !== '');
    if (hasHeader) {
      startIdx = 1;
      rows = data.slice(1);
    }

    if (rows.length === 0) return { isValid: false, error: '데이터 행이 없습니다.' };

    for (let i = 0; i < rows.length; i++) {
      if (rows[i].length !== csvColumns.length) {
        return {
          isValid: false,
          error: `행 ${i + 1 + startIdx}: ${csvColumns.length}개의 컬럼이 필요하지만 ${rows[i].length}개가 있습니다.`,
        };
      }
      for (let j = 0; j < rows[i].length; j++) {
        const v = rows[i][j].trim();
        if (v === '' || isNaN(Number(v))) {
          return {
            isValid: false,
            error: `행 ${i + 1 + startIdx}, 컬럼 ${j + 1} (${csvColumns[j]}): 숫자 값이 필요합니다. 현재 값: "${v}"`,
          };
        }
      }
    }

    return { isValid: true };
  };

  // 파일 선택 핸들러
  const handleFilePicked = async (cat: CategoryKey, f: File) => {
    setFileNames((s) => ({ ...s, [cat]: f.name }));
    setCompleted((s) => ({ ...s, [cat]: true }));

    if (cat === 'sales') {
      if (f.type === 'text/csv' || f.name.toLowerCase().endsWith('.csv')) {
        try {
          const text = await f.text();
          const parsed = parseCsv(text);
          const valid = validateCsvData(parsed);
          if (!valid.isValid) {
            setCsvStatus(valid.error || 'CSV 형식 오류');
            setCsvRows(null);
          } else {
            setCsvRows(parsed);
            setCsvStatus('CSV 파일이 유효합니다.');
          }
        } catch (e) {
          console.error(e);
          setCsvStatus('CSV 파일을 읽는 중 오류가 발생했습니다.');
          setCsvRows(null);
        }
      } else {
        setCsvRows(null);
        setCsvStatus(null);
      }
    }
  };

  // 제출(모의 진행)
  const handleSubmit = async () => {
    setSubmitting(true);
    setProgress(0);

    // 진행률 애니메이션
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.floor(elapsed / 30));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        setSubmitting(false);
        setShowResult(true);
      }
    }, 60);
  };

  const contentData = useMemo(() => CATEGORY_CONTENT[selected], [selected]);

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">하이브리드 신용평가</h1>
        <button
          className="grid h-9 w-9 place-items-center rounded-md border text-gray-600 border-gray-200"
          onClick={() => setListOpen((v) => !v)}
          aria-label="목록 열기"
        >
          <FaBars />
        </button>
      </div>

      {/* 좌측 카테고리 목록 */}
      {isListOpen && (
        <div className="grid grid-cols-2 gap-2">
          <CategoryButton active={selected === 'sales'} label="매출 안정성 및 성장성" done={completed.sales} onClick={() => setSelected('sales')} />
          <CategoryButton active={selected === 'cashflow'} label="현금흐름 건전성" done={completed.cashflow} onClick={() => setSelected('cashflow')} />
          <CategoryButton active={selected === 'esg'} label="ESG" done={completed.esg} onClick={() => setSelected('esg')} />
          <CategoryButton active={selected === 'ceo'} label="대표자 금융 신용도" done={completed.ceo} onClick={() => setSelected('ceo')} />
        </div>
      )}

      {/* 본문 */}
      <section className="rounded-2xl border p-5 bg-white border-gray-200 space-y-4">
        <div className="flex items-start gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-full" style={{ backgroundColor: colors.paleBlue, color: colors.blue }}>
            <FaQuestionCircle />
          </div>
          <div>
            <div className="font-bold text-gray-900">{contentData.title}</div>
            <div className="text-sm text-gray-600">{contentData.desc}</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
              {contentData.items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 업로드 - 매출은 CSV/PDF, 나머지는 PDF */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-800">첨부</div>
          <UploadCard
            onPicked={(f) => handleFilePicked(selected, f)}
            fileName={fileNames[selected]}
            acceptTypes={selected === 'sales' ? 'application/pdf,text/csv' : 'application/pdf'}
          />
          {selected === 'sales' && (
            <div className="text-xs text-gray-600">
              • CSV 업로드 시 자동 검사됩니다. {csvStatus && <span className="ml-1 text-gray-800">{csvStatus}</span>}
            </div>
          )}
        </div>

        {/* ESG 가이드 */}
        {selected === 'esg' && (
          <div className="space-y-3">
            {ESG_STEPS.map((s) => (
              <div key={s.title} className="rounded-xl border p-4 bg-gray-50 border-gray-200">
                <div className="text-sm font-semibold text-gray-900">{s.title}</div>
                <div className="text-xs text-gray-600">{s.desc}</div>
                <ul className="mt-2 list-disc pl-5 text-xs text-gray-600">
                  {s.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* 임시 점수 가이드 뱃지 */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-600">영향도</span>
          <ScoreChip v="++" />
          <ScoreChip v="+" />
          <ScoreChip v="-" />
          <ScoreChip v="--" />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full mt-1 rounded-md py-3 font-semibold text-white bg-navy hover:bg-blue shadow"
        >
          신용도 확인 시작하기
        </button>
      </section>

      <div className="text-center">
        <button
          className="text-sm text-gray-600 underline"
          onClick={() => navigate('/hybrid-evaluation')}
        >
          돌아가기
        </button>
      </div>

      {isSubmitting && <LoadingOverlay progress={progress} />}
      {showResult && <ResultOverlay onClose={() => setShowResult(false)} evaluationResult={evaluationResult} />}
    </div>
  );
};

export default StartHybridEvaluation;
