import { useMemo, useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import React from 'react';
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
import { useNavigate } from 'react-router-dom';
import {
  creditEvaluationApi,
  type CreditEvaluationCreateRequest,
  type CreditEvaluationResponse,
} from '../../api/creditEvaluationApi';
import { useAuthStore } from '../../stores/useAuthStore';
import { storeSummaryApi, type CsvUploadRequest, type SalesDataRow } from '../../api/storeSummaryApi';

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

const ESG_STEPS: {
  title: string;
  desc: string;
  items: string[];
}[] = [
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
    desc: 'ESG 중 Governance(투���경영 및 준법경영)을 평가합니다.',
    items: ['성실납세 이력', '4대 보험료 납부 이력', '투명한 정보 공개'],
  },
  {
    title: 'ESG (4/4)',
    desc: 'ESG 추가 지표를 수기 입력합니다.',
    items: ['에너지 사용량 입력', '재활용률 입력', '안전사고 건수 입력', '기타 메모'],
  },
];

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
      'w-full rounded-md px-4 py-3 text-sm flex items-center justify-between border transition-colors',
      active
        ? 'bg-paleBlue border-lightBlue font-bold text-navy shadow-sm'
        : 'bg-white border-gray-200 hover:bg-gray-50',
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

const UploadCard = ({
  onPdfPicked,
  fileName,
  acceptTypes = "application/pdf",
  category,
}: {
  onPdfPicked: (f: File) => void;
  fileName?: string;
  acceptTypes?: string;
  category?: CategoryKey;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (category === 'sales' && f.type === 'text/csv') {
        onPdfPicked(f);
      } else if (f.type === 'application/pdf') {
        onPdfPicked(f);
      } else {
        alert(category === 'sales' ? 'PDF 또는 CSV 파일만 업로드 가능합니다.' : 'PDF 파일만 업로드 가능합니다.');
        e.target.value = '';
      }
    }
  };

  return (
    <div className="rounded-md p-4 space-y-3 border bg-white border-lightBlue/50">
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-paleBlue text-navy hover:bg-lightBlue/20 transition"
      >
        <FaFileUpload />
        <span>
          {fileName ? `업로드됨: ${fileName}` : '파일을 클릭하여 업로드'}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={acceptTypes}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

const StartHybridEvaluation = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
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
  
  // CSV 관련 상태
  const [csvData, setCsvData] = useState<any>(null);
  const [csvUploadStatus, setCsvUploadStatus] = useState<string | null>(null);

  // CSV 컬럼 순서 정의
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
    'weekday_avg_transaction_value',
    'weekend_avg_transaction_value',
    'cash_payment_ratio',
    'card_payment_ratio',
    'revisit_customer_sales_ratio',
    'new_customer_ratio'
  ];

  // ESG 전용 스텝 상태 및 파일명
  const [esgStep, setEsgStep] = useState(1); // 1~4
  const [esgFiles, setEsgFiles] = useState<Record<number, string | undefined>>({
    1: undefined,
    2: undefined,
    3: undefined,
    4: undefined,
  });
  const [esgManual, setEsgManual] = useState({
    energyConsumption: '',
    recyclingRate: '',
    safetyIncidents: '',
    notes: '',
  });

  // CSV 파일 파싱 함수
  const parseCsv = (text: string): string[][] => {
    const lines = text.trim().split('\n');
    return lines.map(line => {
      const row: string[] = [];
      let currentField = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"' && (i === 0 || line[i-1] === ',')) {
          inQuotes = true;
        } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
          inQuotes = false;
        } else if (char === ',' && !inQuotes) {
          row.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      
      row.push(currentField.trim());
      return row;
    });
  };

  // CSV 데이터 검증 함수
  const validateCsvData = (data: string[][]): { isValid: boolean; error?: string; parsedData?: any } => {
    if (data.length === 0) {
      return { isValid: false, error: 'CSV 파일이 비어있습니다.' };
    }

    // 헤더가 있는 경우와 없는 경우 모두 처리
    let dataRows = data;
    let startIndex = 0;

    // 첫 번째 행이 헤더인지 확인 (숫자가 아닌 값이 포함되어 있다면 헤더로 판단)
    const firstRow = data[0];
    const hasHeader = firstRow.some(cell => isNaN(Number(cell)) && cell.trim() !== '');
    
    if (hasHeader) {
      startIndex = 1;
      dataRows = data.slice(1);
    }

    if (dataRows.length === 0) {
      return { isValid: false, error: '데이터 행이 없습니다.' };
    }

    // 각 행이 정확히 18개의 컬럼을 가지는지 확인
    for (let i = 0; i < dataRows.length; i++) {
      if (dataRows[i].length !== csvColumns.length) {
        return { 
          isValid: false, 
          error: `행 ${i + 1 + startIndex}: ${csvColumns.length}개의 컬럼이 필요하지만 ${dataRows[i].length}개가 있습니다.`
        };
      }

      // 각 값이 숫자인지 확인
      for (let j = 0; j < dataRows[i].length; j++) {
        const value = dataRows[i][j].trim();
        if (value === '' || isNaN(Number(value))) {
          return {
            isValid: false,
            error: `행 ${i + 1 + startIndex}, 컬럼 ${j + 1} (${csvColumns[j]}): 숫자 값이 필요합니다. 현재 값: "${value}"`
          };
        }
      }
    }

    // 데이터를 객체 배열로 변환
    const parsedData = dataRows.map(row => {
      const obj: any = {};
      csvColumns.forEach((column, index) => {
        obj[column] = Number(row[index]);
      });
      return obj;
    });

    return { isValid: true, parsedData };
  };

  // CSV 파일 업로드 처리 함수
  const handleCsvUpload = async (file: File) => {
    setCsvUploadStatus('파일을 읽는 중...');
    setError(null);

    try {
      const text = await file.text();
      const parsedCsv = parseCsv(text);
      const validation = validateCsvData(parsedCsv);

      if (!validation.isValid) {
        setError(validation.error || 'CSV 파일 검증에 실패했습니다.');
        setCsvUploadStatus(null);
        return;
      }

      setCsvData(validation.parsedData);
      
      // 백엔드로 데이터 전송
      setCsvUploadStatus('서버에 데이터를 전송하는 중...');
      
      // memberId 확인 - user 객체에서 먼저 확인하고, 없으면 임시 값 사용
      let memberId = user?.memberId;
      if (!memberId) {
        // 로그인되어 있지만 memberId가 없는 경우, 임시로 1을 사용하거나 다른 로직 적용
        console.warn('memberId not found in user object, using fallback');
        memberId = 1; // 또는 적절한 기본값
      }

      // 현재 년월 (YYYY-MM 형식)
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const uploadRequest: CsvUploadRequest = {
        memberId: memberId,
        summaryYearMonth: currentYearMonth,
        salesData: validation.parsedData.map((row: any) => ({
          totalSalesAmount: row.total_sales_amount,
          weekdaySalesAmount: row.weekday_sales_amount,
          weekendSalesAmount: row.weekend_sales_amount,
          lunchSalesRatio: row.lunch_sales_ratio,
          dinnerSalesRatio: row.dinner_sales_ratio,
          transactionCount: row.transaction_count,
          weekdayTransactionCount: row.weekday_transaction_count,
          weekendTransactionCount: row.weekend_transaction_count,
          momGrowthRate: row.mom_growth_rate,
          yoyGrowthRate: row.yoy_growth_rate,
          salesCv: row.sales_cv,
          avgTransactionValue: row.avg_transaction_value,
          weekdayAvgTransactionValue: row.weekday_avg_transaction_value,
          weekendAvgTransactionValue: row.weekend_avg_transaction_value,
          cashPaymentRatio: row.cash_payment_ratio,
          cardPaymentRatio: row.card_payment_ratio,
          revisitCustomerSalesRatio: row.revisit_customer_sales_ratio,
          newCustomerRatio: row.new_customer_ratio
        }))
      };

      const result = await storeSummaryApi.uploadCsvData(uploadRequest);

      if (result.success) {
        setCsvUploadStatus(`${validation.parsedData.length}개의 데이터가 성공적으로 업로드되어 매장 요약 데이터가 업데이트되었습니다.`);
        
        // 파일명 업데이트 및 완료 상태로 변경
        const nextFiles = { ...fileNames, sales: file.name };
        const nextCompleted = { ...completed, sales: true } as Record<CategoryKey, boolean>;
        setFileNames(nextFiles);
        setCompleted(nextCompleted);
        
        try {
          localStorage.setItem('hybridStart.files', JSON.stringify(nextFiles));
          localStorage.setItem('hybridStart.completed', JSON.stringify(nextCompleted));
        } catch {}
      } else {
        setError(result.message || '데이터 업로드에 실패했습니다.');
        setCsvUploadStatus(null);
      }

    } catch (error: any) {
      console.error('CSV 파일 처리 중 오류:', error);
      setError(error.response?.data?.message || error.message || 'CSV 파일 처리 중 오류가 발생했습니다.');
      setCsvUploadStatus(null);
    }
  };

  const handleSubmit = async () => {
    setShowResult(false);
    setSubmitting(true);
    setProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 90));
      }, 100);

      const evaluationData: CreditEvaluationCreateRequest = {
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
          navigate('/hybrid-evaluation/complete');
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
    <div className="px-4 py-6 space-y-5">
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
          <>
            <h3 className="text-xl font-extrabold text-navy">{ESG_STEPS[esgStep - 1].title}</h3>
            <p className="text-sm text-gray-600">{ESG_STEPS[esgStep - 1].desc}</p>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">평가 항목</span>
              <button
                aria-label="도움말"
                onClick={() => setHelpModalOpen(true)}
                className="text-blue hover:text-navy"
              >
                <FaQuestionCircle />
              </button>
            </div>

            <div className="rounded-md p-3 text-sm space-y-1 border border-gray-200 bg-white shadow-sm">
              {ESG_STEPS[esgStep - 1].items.map((it) => (
                <div key={it} className="flex items-start gap-2">
                  <span>•</span>
                  <span>{it}</span>
                </div>
              ))}
            </div>

            {esgStep !== 4 ? (
              <>
                <div className="flex items-center gap-2 pt-2">
                  <span className="font-semibold text-gray-900">관련 서류 첨부</span>
                  <button
                    aria-label="도움말"
                    onClick={() => setAttachHelpModalOpen(true)}
                    className="text-blue hover:text-navy"
                  >
                    <FaQuestionCircle />
                  </button>
                </div>
                <UploadCard
                  fileName={esgFiles[esgStep]}
                  category="esg"
                  onPdfPicked={(f) => {
                    setEsgFiles((prev) => ({ ...prev, [esgStep]: f.name }));
                  }}
                />
              </>
            ) : (
              <div className="flex items-center gap-2 pt-2">
                <span className="font-semibold text-gray-900">수기 입력</span>
              </div>
            )}

            {esgStep === 4 && (
              <div className="mt-2 rounded-md border p-3 space-y-3 bg-paleBlue/30 border-lightBlue">
                <div className="grid grid-cols-1 gap-3">
                  <label className="text-sm text-gray-700">
                    <span className="block font-medium mb-1">에너지 사용량(월간 kWh)</span>
                    <input
                      type="number"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      value={esgManual.energyConsumption}
                      onChange={(e) => setEsgManual({ ...esgManual, energyConsumption: e.target.value })}
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="block font-medium mb-1">폐기물 재활용률(%)</span>
                    <input
                      type="number"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      value={esgManual.recyclingRate}
                      onChange={(e) => setEsgManual({ ...esgManual, recyclingRate: e.target.value })}
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="block font-medium mb-1">안전사고 건수(월간)</span>
                    <input
                      type="number"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      value={esgManual.safetyIncidents}
                      onChange={(e) => setEsgManual({ ...esgManual, safetyIncidents: e.target.value })}
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="block font-medium mb-1">기타 메모</span>
                    <textarea
                      className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-[80px]"
                      value={esgManual.notes}
                      onChange={(e) => setEsgManual({ ...esgManual, notes: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            )}

            {esgStep === 1 && (
              <button
                onClick={() => setEsgStep(2)}
                className="mt-4 w-full rounded-md py-3 text-white font-semibold bg-navy hover:bg-blue shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            )}
            {esgStep === 2 && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEsgStep(1)}
                  className="flex-1 rounded-md border border-gray-300 py-3 text-gray-700"
                >
                  이전
                </button>
                <button
                  onClick={() => setEsgStep(3)}
                  className="flex-1 rounded-md py-3 text-white bg-blue hover:bg-navy transition"
                >
                  다음
                </button>
              </div>
            )}
            {esgStep === 3 && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEsgStep(2)}
                  className="flex-1 rounded-md border border-gray-300 py-3 text-gray-700"
                >
                  이전
                </button>
                <button
                  onClick={() => setEsgStep(4)}
                  className="flex-1 rounded-md py-3 text-white bg-blue hover:bg-navy transition"
                >
                  다음
                </button>
              </div>
            )}
            {esgStep === 4 && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEsgStep(3)}
                  className="flex-1 rounded-md border border-gray-300 py-3 text-gray-700"
                >
                  이전
                </button>
                <button
                  onClick={() => {
                    setCompleted((prev) => ({ ...prev, esg: true }));
                  }}
                  className="flex-1 rounded-md py-3 text-white bg-blue hover:bg-navy transition"
                >
                  완료
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-xl font-extrabold text-navy">{content.title}</h3>
            <p className="text-sm text-gray-600">{content.desc}</p>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">평가 항목</span>
              <button
                aria-label="도움말"
                onClick={() => setHelpModalOpen(true)}
                className="text-blue hover:text-navy"
              >
                <FaQuestionCircle />
              </button>
            </div>

            <div className="rounded-md p-3 text-sm space-y-1 border border-gray-200 bg-white shadow-sm">
              {content.items.map((it) => (
                <div key={it} className="flex items-start gap-2">
                  <span>•</span>
                  <span>{it}</span>
                </div>
              ))}
            </div>

            {selected === 'ceo' && (
              <div className="mt-2 rounded-md border p-3 space-y-2 bg-paleBlue/30 border-lightBlue">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">신용정보 조회 동의:</span>{' '}
                  신용점수를 조회하기 위한 서비스 이용 약관 및 개인(신용)정보 조회
                  동의 절차를 진행합니다.
                </p>
                <button
                  aria-label="신용정보 조회 동의"
                  onClick={() => setConsentModalOpen(true)}
                  className="w-full rounded-md py-3 text-white font-medium bg-blue hover:bg-navy transition"
                >
                  신용정보 조회 동의
                </button>
              </div>
            )}

            {selected === 'cashflow' && (
              <div className="mt-2 rounded-md border p-3 space-y-2 bg-paleBlue/30 border-lightBlue">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">계좌연결 및 조회 동의:</span>{' '}
                  현금흐름 분석을 위해 사업자(또는 대표자) 명의 계좌를 연결하고 최근
                  거래내역 조회에 동의해 주세요.
                </p>
                <button
                  aria-label="계좌연결 및 조회 동의"
                  onClick={() => setBankConsentOpen(true)}
                  className="w-full rounded-md py-3 text-white font-medium bg-blue hover:bg-navy transition"
                >
                  계좌연결 및 조회 동의
                </button>
              </div>
            )}

            {selected !== 'ceo' && selected !== 'cashflow' && (
              <>
                <div className="flex items-center gap-2 pt-2">
                  <span className="font-semibold text-gray-900">관련 서류 첨부</span>
                  <button
                    aria-label="도움말"
                    onClick={() => setAttachHelpModalOpen(true)}
                    className="text-blue hover:text-navy"
                  >
                    <FaQuestionCircle />
                  </button>
                </div>
                <UploadCard
                  fileName={fileNames[selected]}
                  category={selected}
                  acceptTypes={selected === 'sales' ? "application/pdf,.csv,text/csv" : "application/pdf"}
                  onPdfPicked={(f) => {
                    if (selected === 'sales' && f.type === 'text/csv') {
                      handleCsvUpload(f);
                    } else {
                      const nextFiles = { ...fileNames, [selected]: f.name };
                      const nextCompleted = { ...completed, [selected]: true } as Record<CategoryKey, boolean>;
                      setFileNames(nextFiles);
                      setCompleted(nextCompleted);
                      try {
                        localStorage.setItem('hybridStart.files', JSON.stringify(nextFiles));
                        localStorage.setItem('hybridStart.completed', JSON.stringify(nextCompleted));
                      } catch {}
                    }
                  }}
                />
                {/* CSV 업로드 상태 표시 */}
                {selected === 'sales' && csvUploadStatus && (
                  <div className="mt-2 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
                    {csvUploadStatus}
                  </div>
                )}
                {/* CSV 데이터 미리보기 */}
                {selected === 'sales' && csvData && csvData.length > 0 && (
                  <div className="mt-2 p-3 rounded-md bg-blue-50 border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-2">업로드된 데이터 미리보기 (최대 3행)</div>
                    <div className="text-xs text-blue-700 overflow-x-auto">
                      <div className="grid grid-cols-6 gap-1 text-[10px]">
                        <div className="font-semibold">총매출액</div>
                        <div className="font-semibold">평일매출</div>
                        <div className="font-semibold">주말매출</div>
                        <div className="font-semibold">점심비율</div>
                        <div className="font-semibold">저녁비율</div>
                        <div className="font-semibold">거래수</div>
                        {csvData.slice(0, 3).map((row: any, idx: number) => (
                          <React.Fragment key={idx}>
                            <div>{row.total_sales_amount?.toLocaleString()}</div>
                            <div>{row.weekday_sales_amount?.toLocaleString()}</div>
                            <div>{row.weekend_sales_amount?.toLocaleString()}</div>
                            <div>{row.lunch_sales_ratio}%</div>
                            <div>{row.dinner_sales_ratio}%</div>
                            <div>{row.transaction_count?.toLocaleString()}</div>
                          </React.Fragment>
                        ))}
                      </div>
                      {csvData.length > 3 && (
                        <div className="mt-1 text-blue-600">... 및 {csvData.length - 3}개 행 더</div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            {error && (
              <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-4 w-full rounded-md py-3 text-white font-semibold bg-navy hover:bg-blue shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '처리 중...' : '제출하기'}
            </button>
          </>
        )}
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
                const nextCompleted = { ...completed, cashflow: true } as Record<CategoryKey, boolean>;
                setCompleted(nextCompleted);
                try {
                  localStorage.setItem('hybridStart.completed', JSON.stringify(nextCompleted));
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
