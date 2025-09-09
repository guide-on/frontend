import { useState, useEffect } from 'react';
import type { CreditEvaluationResponse } from '../../api/creditEvaluationApi';
import type { CreditEvaluationResultResponse } from '../../api/creditEvaluationResultApi';
import { creditEvaluationResultApi } from '../../api/creditEvaluationResultApi';
import { creditEvaluationApi } from '../../api/creditEvaluationApi';
import { useAuthStore } from '../../stores/useAuthStore';

const TabButton = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={[
      'relative px-3 py-2 text-sm font-medium',
      active ? 'text-navy' : 'text-gray-500',
    ].join(' ')}
  >
    {label}
    <span className={['absolute left-0 right-0 -bottom-0.5 h-0.5', active ? 'bg-blue' : 'bg-transparent'].join(' ')} />
  </button>
);

const ExpandableRow = ({
  title,
  desc,
  grade,
  details,
}: {
  title: string;
  desc: string;
  grade: string;
  details: { section: string; items: string[] }[];
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border p-4 border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-bold text-gray-900">{title}</div>
        <div className="rounded-full text-white text-sm font-bold w-8 h-8 flex items-center justify-center bg-blue">
          {grade}
        </div>
      </div>
      <div className="mt-1 text-sm text-gray-600">{desc}</div>
      <div className="mt-3 h-2 w-full rounded bg-paleBlue">
        <div className="h-full w-11/12 rounded bg-blue" />
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 w-full flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm border border-gray-200"
      >
        <span>상세 내역 보기</span>
        <span className="text-gray-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {details.map((d) => (
            <div key={d.section}>
              <div className="text-sm font-semibold text-gray-900">{d.section}</div>
              <ul className="mt-1 list-disc pl-5 text-sm text-gray-600">
                {d.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ResultOverlay = ({ 
  onClose, 
  evaluationResult 
}: { 
  onClose: () => void;
  evaluationResult?: CreditEvaluationResponse | null;
}) => {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'legacy' | 'guideon'>('legacy');
  const [creditResult, setCreditResult] = useState<CreditEvaluationResultResponse | null>(null);
  const [creditData, setCreditData] = useState<CreditEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      
      try {
        setLoading(true);
        
        // 신용평가 결과 조회 (에러가 나도 계속 진행)
        try {
          const resultResponse = await creditEvaluationResultApi.get();
          if (resultResponse.success) {
            setCreditResult(resultResponse.data);
          }
        } catch (resultError) {
          console.warn('신용평가 결과 조회 실패 (데이터가 없을 수 있음):', resultError);
        }
        
        // 최신 신용평가 데이터 조회 (에러가 나도 계속 진행)
        try {
          const listResponse = await creditEvaluationApi.getList({});
          if (listResponse.success && listResponse.data.length > 0) {
            setCreditData(listResponse.data[0]); // 첫 번째 (최신) 데이터 사용
          }
        } catch (listError) {
          console.warn('신용평가 데이터 조회 실패 (데이터가 없을 수 있음):', listError);
        }
        
      } catch (error) {
        console.error('Failed to load credit evaluation data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // 컴포넌트 마운트 시에만 실행

  // 점수를 등급으로 변환하는 함수
  const getGradeFromScore = (score: number, maxScore: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'D';
  };

  // 실제 데이터를 기반으로 legacyRows 생성
  const getLegacyRows = () => {
    if (!creditData || !creditResult) {
      return []; // 데이터가 없으면 빈 배열 반환
    }

    return [
      {
        t: '상환이력',
        d: '연체 발생/해제 이력과 상환 성실도를 평가합니다.',
        g: getGradeFromScore(creditResult.repaymentHistoryScore, 284),
        details: [
          { 
            section: '연체 이력', 
            items: [
              `총 연체횟수: ${creditData.totalOverdueCount || 0}회`,
              `최근 12개월 연체: ${creditData.recent12mOverdueCount || 0}회`,
              `최대 연체일수: ${creditData.maxOverdueDays || 0}일`,
              `현재 연체금액: ${(creditData.currentOverdueAmount || 0).toLocaleString()}원`
            ]
          },
          { 
            section: '상환 성실도', 
            items: [
              `부도이력: ${creditData.loanDefaultHistory === 1 ? '있음' : '없음'}`,
              `카드연체율: ${creditData.creditCardDelayRate || 0}%`,
              `납부일관성점수: ${creditData.paymentConsistencyScore || 0}점`
            ]
          },
        ],
      },
      {
        t: '부채수준',
        d: '대출 잔액, 보증채무 등 부담 수준을 평가합니다.',
        g: getGradeFromScore(creditResult.debtLevelScore, 318),
        details: [
          { 
            section: '부채 현황', 
            items: [
              `총 부채금액: ${(creditData.totalDebtAmount || 0).toLocaleString()}원`,
              `월소득: ${(creditData.monthlyIncome || 0).toLocaleString()}원`,
              `부채소득비율(DTI): ${creditData.debtToIncomeRatio || 0}%`
            ]
          },
          { 
            section: '신용카드 사용', 
            items: [
              `카드사용률: ${creditData.creditCardUtilizationRate || 0}%`,
              `담보대출비중: ${creditData.securedVsUnsecuredRatio || 0}%`
            ]
          },
        ],
      },
      {
        t: '신용거래기간',
        d: '신용계좌 보유 기간과 경과 기간을 평가합니다.',
        g: getGradeFromScore(creditResult.creditPeriodScore, 123),
        details: [
          { 
            section: '신용기간', 
            items: [
              `신용거래기간: ${Math.floor((creditData.creditHistoryMonths || 0) / 12)}년 ${(creditData.creditHistoryMonths || 0) % 12}개월`,
              `최오래된 계좌: ${Math.floor((creditData.oldestCreditAccountMonths || 0) / 12)}년 ${(creditData.oldestCreditAccountMonths || 0) % 12}개월`,
              `최근 6개월 신용조회: ${creditData.newCreditInquiries6m || 0}회`
            ]
          },
        ],
      },
      {
        t: '신용형태',
        d: '카드 이용 패턴과 현금서비스/할부 사용 등을 평가합니다.',
        g: getGradeFromScore(creditResult.creditPatternScore, 275),
        details: [
          { 
            section: '신용형태', 
            items: [
              `활성 신용카드 수: ${creditData.activeCreditCardCount || 0}장`,
              `총 신용한도: ${(creditData.totalCreditLimit || 0).toLocaleString()}원`,
              `대출종류 다양성: ${creditData.loanTypeDiversity || 0}종류`,
              `금융기관 수: ${creditData.financialInstitutionCount || 0}개`
            ]
          },
        ],
      },
      {
        t: '비금융/마이데이터',
        d: '공과금·통신요금 납부 및 마이데이터 자산 정보를 반영합니다.',
        g: getGradeFromScore(creditResult.nonFinancialScore, 100),
        details: [
          { 
            section: '대안신용점수', 
            items: [
              `대안신용점수: ${creditData.alternativeCreditScore || 0}점 (최대 100점)`
            ]
          },
        ],
      },
    ];
  };

  const legacyRows = getLegacyRows();

  const staticLegacyRows = [
    {
      t: '상환이력',
      d: '연체 발생/해제 이력과 상환 성실도를 평가합니다.',
      g: 'A',
      details: [
        { section: '연체 이력', items: ['장기연체 발생 없음', '단기연체 없음', '연체 해제 후 경과 6개월'] },
        { section: '상환 성실도', items: ['원리금 연체 없이 납부', '자동이체 정상'] },
      ],
    },
    {
      t: '부채수준',
      d: '대출 잔액, 보증채무 등 부담 수준을 평가합니다.',
      g: 'A',
      details: [
        { section: '대출 현황', items: ['고위험 대출 없음', '대출 잔액 감소 추세'] },
        { section: '보증 정보', items: ['보증 발생 없음', '보증 해소 이력 있음'] },
      ],
    },
    {
      t: '신용거래기간',
      d: '신용계좌 보유 기간과 경과 기간을 평가합니다.',
      g: 'B',
      details: [
        { section: '계좌 보유', items: ['최초 계좌 개설 5년 경과', '최근 계좌 1년 2개월 경과'] },
      ],
    },
    {
      t: '신용형태',
      d: '카드 이용 패턴과 현금서비스/할부 사용 등을 평가합니다.',
      g: 'A',
      details: [
        { section: '카드 사용', items: ['신용/체크카드 정상 사용', '과다 할부/현금서비스 사용 없음'] },
      ],
    },
    {
      t: '비금융/마이데이터',
      d: '공과금·통신요금 납부 및 마이데이터 자산 정보를 반영합니다.',
      g: 'B',
      details: [
        { section: '비금융 납부실적', items: ['공과금 성실 납부', '통신요금 연체 없음'] },
        { section: '자산 정보', items: ['저축성 자산 보유(마이데이터)'] },
      ],
    },
  ];

  const guideRows = [
    {
      t: '매출 안정성 및 성장성',
      d: '매출이 꾸준히 증가하며 전년보다 사업이 성장하고 있습니다.',
      g: 'A',
      details: [
        { section: '월/분기별 매출 추이', items: ['최근 12개월 상승 추세', '전년 대비 +13%'] },
        { section: '매출 변동성', items: ['변동성 낮음', '시즌 영향 제한적'] },
        { section: '전년/월 동기 대비 성장률', items: ['월 기준 +8%', '분기 기준 +6%'] },
      ],
    },
    {
      t: '현금흐름 건전성',
      d: '현금 유입/유출이 안정적으로 관리되고 있습니다.',
      g: 'A',
      details: [
        { section: '영업현금흐름', items: ['최근 4분기 연속 플러스', '현금보유 확대'] },
        { section: '부채상환 커버리지', items: ['DSCR 1.5배 이상'] },
      ],
    },
    {
      t: 'ESG',
      d: '환경·사회·지배구조 리스크 관리와 실천 활동을 평가합니다.',
      g: 'A',
      details: [
        { section: '환경', items: ['폐기물 분리배출 준수', '에너지 절감 활동'] },
        { section: '사회/거버넌스', items: ['근로기준 준수', '투명한 의사결정'] },
      ],
    },
    {
      t: '대표자 금융 신용도(기존 신용점수)',
      d: '대표자의 신용정보를 통해 상환능력 리스크를 보완 평가합니다.',
      g: 'A',
      details: [
        { section: '평가 요소', items: ['상환이력/부채수준/신용기간/형태/비금융'] },
      ],
    },
  ];

  const rows = tab === 'legacy' ? legacyRows : guideRows;

  // 총점에서 등급 계산
  const getTotalGrade = (score: number): string => {
    if (score >= 850) return 'A+';
    if (score >= 750) return 'A';
    if (score >= 650) return 'B+';
    if (score >= 550) return 'B';
    if (score >= 450) return 'C+';
    if (score >= 350) return 'C';
    return 'D';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-white p-6">
      <div className="mx-auto w-full max-w-sm space-y-5">
        <h3 className="text-center text-2xl font-extrabold text-navy">하이브리드 신용평가 결과</h3>

        {loading ? (
          <div className="rounded-2xl border p-5 shadow-sm bg-white border-gray-200">
            <div className="text-center text-sm text-gray-600">데이터 로딩 중...</div>
            <div className="mt-4 animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border p-5 shadow-sm bg-white border-gray-200">
            <div className="text-center text-sm text-gray-600">종합 점수</div>
            <div className="mt-1 flex items-end justify-center gap-2">
              <div className="text-5xl font-extrabold text-gray-900">
                {creditResult?.totalScore || 0}
              </div>
              <div className="pb-1 text-gray-600">/ 980</div>
            </div>
            <div className="mx-auto mt-2 w-24 rounded-full px-3 py-1 text-center text-white text-xs font-bold bg-blue">
              {creditResult ? getTotalGrade(creditResult.totalScore) : 'N/A'} 등급
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div className="text-center">
                <div className="font-semibold text-gray-900">상환이력</div>
                <div>{creditResult ? getGradeFromScore(creditResult.repaymentHistoryScore, 284) : 'N/A'}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">부채수준</div>
                <div>{creditResult ? getGradeFromScore(creditResult.debtLevelScore, 318) : 'N/A'}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">신용거래기간</div>
                <div>
                  {creditData && creditData.creditHistoryMonths 
                    ? `${Math.floor(creditData.creditHistoryMonths / 12)}년 ${creditData.creditHistoryMonths % 12}개월`
                    : 'N/A'
                  }
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">신용형태</div>
                <div>{creditResult ? getGradeFromScore(creditResult.creditPatternScore, 275) : 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <TabButton label="기존 신용 분석" active={tab === 'legacy'} onClick={() => setTab('legacy')} />
          <TabButton label="guideON 분석" active={tab === 'guideon'} onClick={() => setTab('guideon')} />
        </div>
        <div className="h-0.5 w-full rounded bg-gray-200" />

        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-xl border p-4 border-gray-200 bg-white shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : rows.length > 0 ? (
            rows.map((r) => (
              <ExpandableRow key={r.t} title={r.t} desc={r.d} grade={r.g} details={r.details} />
            ))
          ) : (
            <div className="rounded-xl border p-4 border-gray-200 bg-white shadow-sm text-center">
              <div className="text-gray-500">신용평가 데이터를 찾을 수 없습니다.</div>
              <div className="text-sm text-gray-400 mt-1">먼저 신용평가를 진행해주세요.</div>
            </div>
          )}
        </div>

        <button onClick={onClose} className="w-full rounded-md border py-3 font-semibold text-gray-800 border-gray-300 hover:bg-gray-50">
          닫기
        </button>
      </div>
    </div>
  );
};

export default ResultOverlay;
