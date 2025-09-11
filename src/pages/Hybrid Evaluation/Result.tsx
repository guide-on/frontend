import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { CreditEvaluationResponse } from '../../api/creditEvaluationApi';
import type { CreditEvaluationResultResponse } from '../../api/creditEvaluationResultApi';
import type { StoreSummaryResponse } from '../../api/storeSummaryApi';
import { creditEvaluationResultApi } from '../../api/creditEvaluationResultApi';
import { creditEvaluationApi } from '../../api/creditEvaluationApi';
import { storeSummaryApi } from '../../api/storeSummaryApi';
import { useAuthStore } from '../../stores/useAuthStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { createPortal } from 'react-dom';

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
    <span
      className={[
        'absolute left-0 right-0 -bottom-0.5 h-0.5',
        active ? 'bg-blue' : 'bg-transparent',
      ].join(' ')}
    />
  </button>
);

const ExpandableRow = ({
  title,
  desc,
  grade,
  score,
  maxScore,
  details,
}: {
  title: string;
  desc: string;
  grade?: string;
  score?: number;
  maxScore?: number;
  details: { section: string; items: string[] }[];
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border p-4 border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-bold text-gray-900">{title}</div>
        <div className="rounded-lg text-white text-sm font-bold px-2 py-1 flex items-center justify-center bg-blue">
          {score !== undefined && maxScore !== undefined
            ? `${score}/${maxScore}`
            : grade}
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
              <div className="text-sm font-semibold text-gray-900">
                {d.section}
              </div>
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
  evaluationResult,
}: {
  onClose: () => void;
  evaluationResult?: CreditEvaluationResponse | null;
}) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuthStore();

  // sessionId 우선순위: URL 파라미터 > useAuthStore
  const currentSessionId = sessionId ? parseInt(sessionId) : user?.sessionId;
  const [tab, setTab] = useState<'legacy' | 'guideon'>('legacy');
  const [creditResult, setCreditResult] =
    useState<CreditEvaluationResultResponse | null>(null);
  const [creditData, setCreditData] = useState<CreditEvaluationResponse | null>(
    null,
  );
  const [storeSummaryData, setStoreSummaryData] =
    useState<StoreSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 신용평가 결과 조회 (에러가 나도 계속 진행)
        if (currentSessionId) {
          try {
            const resultResponse =
              await creditEvaluationResultApi.get(currentSessionId);
            if (resultResponse.success) {
              setCreditResult(resultResponse.data);
            }
          } catch (resultError) {
            console.warn(
              '신용평가 결과 조회 실패 (데이터가 없을 수 있음):',
              resultError,
            );
          }
        } else {
          console.warn(
            'sessionId를 찾을 수 없어 신용평가 결과를 조회할 수 없습니다.',
          );
        }

        // 최신 신용평가 데이터 조회 (에러가 나도 계속 진행)
        if (currentSessionId) {
          try {
            const listResponse = await creditEvaluationApi.getList({
              sessionId: currentSessionId,
            });
            if (listResponse.success && listResponse.data.length > 0) {
              setCreditData(listResponse.data[0]); // 첫 번째 (최신) 데이터 사용
            }
          } catch (listError) {
            console.warn(
              '신용평가 데이터 조회 실패 (데이터가 없을 수 있음):',
              listError,
            );
          }
        } else {
          console.warn(
            'sessionId를 찾을 수 없어 신용평가 데이터를 조회할 수 없습니다.',
          );
        }

        // 매장 요약 데���터 조회 (guideON 분석용) - sessionId가 있을 때만 조회
        if (currentSessionId) {
          try {
            console.log('매장 요약 데이터 조회 시작');
            const storeSummaryResponse =
              await storeSummaryApi.getMyStoreSummary(currentSessionId, 1, 1);
            console.log('매장 요약 데이터 응답:', storeSummaryResponse);
            if (
              storeSummaryResponse.success &&
              storeSummaryResponse.data.length > 0
            ) {
              setStoreSummaryData(storeSummaryResponse.data[0]); // 첫 번째 (최신) 데이터 사용
              console.log(
                '매장 요약 데이터 설정 완료:',
                storeSummaryResponse.data[0],
              );
            } else {
              console.log(
                '매장 요약 데이터가 없음 - success:',
                storeSummaryResponse.success,
                'data length:',
                storeSummaryResponse.data?.length || 0,
              );
            }
          } catch (storeSummaryError) {
            console.error('매장 요약 데이터 조회 실패:', storeSummaryError);
          }
        } else {
          console.warn(
            'sessionId를 찾을 수 없어 매장 요약 데이터를 조회할 수 없습니다.',
          );
        }
      } catch (error) {
        console.error('Failed to load credit evaluation data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentSessionId]); // sessionId 변경 시 재��행

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

  // 실제 데이터�� 기반으로 legacyRows 생성
  const getLegacyRows = () => {
    if (!creditData || !creditResult) {
      return []; // 데이터가 없으면 빈 배열 반환
    }

    return [
      {
        t: '상환이력',
        d: '연체 발생/해제 이력과 상환 성실도를 평가합니다.',
        score: creditResult.repaymentHistoryScore,
        maxScore: 284,
        details: [
          {
            section: '연체 이력',
            items: [
              `총 연체횟수: ${creditData.totalOverdueCount || 0}회`,
              `최근 12개월 연체: ${creditData.recent12mOverdueCount || 0}회`,
              `최대 연체일수: ${creditData.maxOverdueDays || 0}일`,
              `현재 연체금액: ${(creditData.currentOverdueAmount || 0).toLocaleString()}원`,
            ],
          },
          {
            section: '상환 성실도',
            items: [
              `부도이력: ${creditData.loanDefaultHistory === 1 ? '있음' : '없음'}`,
              `카드연체율: ${creditData.creditCardDelayRate || 0}%`,
              `납부일관성점수: ${creditData.paymentConsistencyScore || 0}점`,
            ],
          },
        ],
      },
      {
        t: '부채수준',
        d: '대출 잔액, 보증채무 등 부담 수준을 평가합니다.',
        score: creditResult.debtLevelScore,
        maxScore: 318,
        details: [
          {
            section: '부채 현황',
            items: [
              `총 부채금액: ${(creditData.totalDebtAmount || 0).toLocaleString()}원`,
              `월소득: ${(creditData.monthlyIncome || 0).toLocaleString()}원`,
              `부채소득비율(DTI): ${creditData.debtToIncomeRatio || 0}%`,
            ],
          },
          {
            section: '신용카드 사용',
            items: [
              `카드사용률: ${creditData.creditCardUtilizationRate || 0}%`,
              `담보대출비중: ${creditData.securedVsUnsecuredRatio || 0}%`,
            ],
          },
        ],
      },
      {
        t: '신용거래기간',
        d: '신용계좌 보유 기간과 경과 기간을 평가합니다.',
        score: creditResult.creditPeriodScore,
        maxScore: 123,
        details: [
          {
            section: '신용기간',
            items: [
              `신용거래기간: ${Math.floor((creditData.creditHistoryMonths || 0) / 12)}년 ${(creditData.creditHistoryMonths || 0) % 12}개월`,
              `최오래된 계좌: ${Math.floor((creditData.oldestCreditAccountMonths || 0) / 12)}년 ${(creditData.oldestCreditAccountMonths || 0) % 12}개월`,
              `최근 6개월 신용조회: ${creditData.newCreditInquiries6m || 0}회`,
            ],
          },
        ],
      },
      {
        t: '신용형태',
        d: '카드 이용 패턴과 현금서비스/할부 사용 등을 평가합니다.',
        score: creditResult.creditPatternScore,
        maxScore: 275,
        details: [
          {
            section: '신용형태',
            items: [
              `활성 신용카드 수: ${creditData.activeCreditCardCount || 0}장`,
              `총 신용한도: ${(creditData.totalCreditLimit || 0).toLocaleString()}원`,
              `대출종류 다양성: ${creditData.loanTypeDiversity || 0}종류`,
              `금융기관 수: ${creditData.financialInstitutionCount || 0}개`,
            ],
          },
        ],
      },
      {
        t: '비금융/마이데이터',
        d: '공과금·통신요금 납부 및 마이데이터 자산 정보를 반영합니다.',
        score: creditResult.nonFinancialScore,
        maxScore: 100,
        details: [
          {
            section: '대안신용점수',
            items: [
              `대안신용점수: ${creditData.alternativeCreditScore || 0}��� (최대 100점)`,
            ],
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
        {
          section: '연체 이력',
          items: [
            '장기연체 발생 없음',
            '단기연체 없음',
            '연체 해제 후 경과 6개월',
          ],
        },
        {
          section: '상환 성실도',
          items: ['원리금 연체 없��� 납부', '자동이체 정상'],
        },
      ],
    },
    {
      t: '부채수준',
      d: '대출 잔액, 보증채무 등 부담 수준을 평가합니다.',
      g: 'A',
      details: [
        {
          section: '대출 현황',
          items: ['고위험 대출 없음', '대출 잔액 감소 추세'],
        },
        {
          section: '보증 정보',
          items: ['보증 발생 없음', '보증 해소 이력 있음'],
        },
      ],
    },
    {
      t: '신용거래기간',
      d: '신용계좌 보유 기간과 경과 기간을 평가합니다.',
      g: 'B',
      details: [
        {
          section: '계좌 보유',
          items: ['최초 계좌 개설 5년 경과', '최근 계좌 1년 2개월 경과'],
        },
      ],
    },
    {
      t: '신용형태',
      d: '카드 이용 패턴과 현금서비스/할부 사용 등을 평가합니다.',
      g: 'A',
      details: [
        {
          section: '카드 사용',
          items: ['신용/체크카드 정상 사용', '과다 할부/현금서비스 사용 없음'],
        },
      ],
    },
    {
      t: '비금융/마이데이터',
      d: '공과금·통신요금 납부 및 마이데이터 자산 정보를 반영합니다.',
      g: 'B',
      details: [
        {
          section: '비금융 납부실적',
          items: ['공과금 성실 납부', '통신요금 연체 없음'],
        },
        { section: '자산 정보', items: ['저축성 자산 보유(마이데이터)'] },
      ],
    },
  ];

  // 총점에서 등급 계산 (0~1000 구간)
  const getTotalGrade = (score: number): string => {
    if (score >= 900) return 'AAA';
    if (score >= 800) return 'AA';
    if (score >= 700) return 'A';
    if (score >= 600) return 'BBB';
    if (score >= 500) return 'BB';
    if (score >= 400) return 'B';
    if (score >= 300) return 'CCC';
    if (score >= 200) return 'CC';
    return 'C';
  };

  // 실제 데���터를 기반으로 guideRows 생성
  const getGuideRows = () => {
    if (!storeSummaryData) {
      return []; // 데이터가 없으면 빈 배열 반환
    }

    const data = storeSummaryData;

    // 매출 성장률 기반 등급 계산
    const getSalesGrade = (
      momGrowth: number,
      yoyGrowth: number,
      cv: number,
    ): string => {
      const avgGrowth = (momGrowth + yoyGrowth) / 2;
      if (avgGrowth >= 15 && cv < 0.3) return 'A+';
      if (avgGrowth >= 10 && cv < 0.4) return 'A';
      if (avgGrowth >= 5 && cv < 0.5) return 'B+';
      if (avgGrowth >= 0 && cv < 0.6) return 'B';
      if (avgGrowth >= -5 && cv < 0.7) return 'C+';
      if (avgGrowth >= -10 && cv < 0.8) return 'C';
      return 'D';
    };

    // 현금흐름 등급 계산
    const getCashFlowGrade = (
      profitRatio: number,
      avgBalance: number,
      cv: number,
    ): string => {
      if (profitRatio > 20 && avgBalance > 50000000 && cv < 0.3) return 'A+';
      if (profitRatio > 15 && avgBalance > 30000000 && cv < 0.4) return 'A';
      if (profitRatio > 10 && avgBalance > 20000000 && cv < 0.5) return 'B+';
      if (profitRatio > 5 && avgBalance > 10000000 && cv < 0.6) return 'B';
      if (profitRatio > 0 && avgBalance > 5000000 && cv < 0.7) return 'C+';
      if (profitRatio >= -5 && avgBalance > 1000000 && cv < 0.8) return 'C';
      return 'D';
    };

    // ESG 등급 계산
    const getESGGrade = (
      energyEff: boolean,
      hygiene: boolean,
      employeeCount: number,
      reviewRating: number,
      wasteManagement: number,
    ): string => {
      let score = 0;
      if (energyEff) score += 20;
      if (hygiene) score += 20;
      if (employeeCount >= 5) score += 20;
      if (reviewRating >= 4.0) score += 20;
      if (wasteManagement <= 5) score += 20;

      if (score >= 90) return 'A+';
      if (score >= 80) return 'A';
      if (score >= 70) return 'B+';
      if (score >= 60) return 'B';
      if (score >= 50) return 'C+';
      if (score >= 40) return 'C';
      return 'D';
    };

    return [
      {
        t: '매출 안정성 및 성장성',
        d: '매출 변동성과 성장률을 종합적으로 분석한 결과입니다.',
        g: getSalesGrade(
          data.momGrowthRate || 0,
          data.yoyGrowthRate || 0,
          data.salesCv || 1,
        ),
        details: [
          {
            section: '매출 현황',
            items: [
              `월 평균 매출: ${(data.totalSalesAmount || 0).toLocaleString()}원`,
              `주중 매출: ${(data.weekdaySalesAmount || 0).toLocaleString()}원`,
              `주말 매출: ${(data.weekendSalesAmount || 0).toLocaleString()}원`,
            ],
          },
          {
            section: '성장률',
            items: [
              `전월 대비 성장률: ${data.momGrowthRate || 0}%`,
              `전년 동월 대비 성장률: ${data.yoyGrowthRate || 0}%`,
            ],
          },
          {
            section: '매출 안정성',
            items: [
              `매출 변동성(CV): ${(data.salesCv || 0).toFixed(3)}`,
              `평균 객단가: ${(data.avgTransactionValue || 0).toLocaleString()}원`,
            ],
          },
        ],
      },
      {
        t: '현금흐름 건전성',
        d: '영업이익과 현금 보유 상황을 분석한 결과입니다.',
        g: getCashFlowGrade(
          data.operatingProfitRatio || 0,
          data.avgAccountBalance || 0,
          data.cashflowCv || 1,
        ),
        details: [
          {
            section: '수익성',
            items: [
              `영업이익률: ${data.operatingProfitRatio || 0}%`,
              `매출원가율: ${data.cogsRatio || 0}%`,
              `임차료율: ${data.rentRatio || 0}%`,
            ],
          },
          {
            section: '현금 관리',
            items: [
              `평균 계좌 잔액: ${(data.avgAccountBalance || 0).toLocaleString()}원`,
              `현금흐름 변동계수: ${(data.cashflowCv || 0).toFixed(3)}`,
              `최소잔액 유지율: ${data.minBalanceMaintenanceRatio || 0}%`,
            ],
          },
        ],
      },
      {
        t: 'ESG',
        d: '환경·사회·지배구조 리스크 관리와 실천 활동을 평가합니다.',
        g: getESGGrade(
          data.participateEnergyEffSupport === true,
          data.hygieneCertified === true,
          data.employmentInsuranceEmployees || 0,
          data.customerReviewAvgRating || 0,
          data.foodWasteKgPerDay || 0,
        ),
        details: [
          {
            section: '환경',
            items: [
              `에너지 효율 지원사업 참여: ${data.participateEnergyEffSupport ? '참여' : '미참여'}`,
              `일일 음식물쓰레기: ${data.foodWasteKgPerDay || 0}kg`,
              `일일 재활용품: ${data.recycleWasteKgPerDay || 0}kg`,
            ],
          },
          {
            section: '사회',
            items: [
              `고용보험 가입자 수: ${data.employmentInsuranceEmployees || 0}명`,
              `위생등급 인증: ${data.hygieneCertified ? '인증됨' : '미인증'}`,
              `고객 리뷰 평균 평점: ${data.customerReviewAvgRating || 0}점`,
            ],
          },
          {
            section: '거버넌스',
            items: [
              `원산지·가격표시 위반: ${data.originPriceViolationCount || 0}회`,
              `세금납부 성실도: ${data.taxPaymentIntegrity || 0}%`,
            ],
          },
        ],
      },
      {
        t: '대표자 금융 신용도(기존 신용점수)',
        d: '대표자의 신용정���를 통해 상환능력 리스크�� 보완 평가합니다.',
        g: creditResult ? getTotalGrade(creditResult.totalScore) : 'N/A',
        details: [
          {
            section: '평가 요소',
            items: [
              '상환이력 - 연체 발생/해제 이력과 상환 성실도',
              '부채수준 - 대출 잔액, 보증채무 등 부담 수준',
              '신용거래기간 - 신용계좌 보유 기간과 경과 기간',
              '신용형태 - 카드 이용 패턴과 현금서비스/할부 사용',
              '비금융/마이데이터 - 공과금·통신요금 납부 실적',
            ],
          },
        ],
      },
    ];
  };

  const guideRows = getGuideRows();

  const rows = tab === 'legacy' ? legacyRows : guideRows;

  return createPortal(
    <div className="fixed inset-0 z-[9998] overflow-auto bg-white p-6">
      <div className="mx-auto w-full max-w-sm space-y-5">
        <h3 className="text-center text-2xl font-extrabold text-navy">
          하이브리드 신용평가 결과
        </h3>

        {loading ? (
          <div className="rounded-2xl border p-5 shadow-sm bg-white border-gray-200">
            <div className="text-center text-sm text-gray-600 flex justify-center">
              <LoadingSpinner type="dots" color="#25437B" />
            </div>
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
              <div className="pb-1 text-gray-600">/ 1000</div>
            </div>
            <div className="mx-auto mt-2 w-24 rounded-full px-3 py-1 text-center text-white text-xs font-bold bg-blue">
              {creditResult ? getTotalGrade(creditResult.totalScore) : 'N/A'}{' '}
              등급
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <TabButton
            label="기존 신용 분석"
            active={tab === 'legacy'}
            onClick={() => setTab('legacy')}
          />
          <TabButton
            label="guideON 분석"
            active={tab === 'guideon'}
            onClick={() => setTab('guideon')}
          />
        </div>
        <div className="h-0.5 w-full rounded bg-gray-200" />

        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border p-4 border-gray-200 bg-white shadow-sm animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : rows.length > 0 ? (
            rows.map((r) => (
              <ExpandableRow
                key={r.t}
                title={r.t}
                desc={r.d}
                grade={r.g}
                score={r.score}
                maxScore={r.maxScore}
                details={r.details}
              />
            ))
          ) : (
            <div className="rounded-xl border p-4 border-gray-200 bg-white shadow-sm text-center">
              <div className="text-gray-500">
                {tab === 'legacy'
                  ? '신용평가 데이터를 찾을 수 없습니다.'
                  : '매장 요약 데��터를 찾을 수 없습니다.'}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {tab === 'legacy'
                  ? '먼저 신용평가를 진행해주세요.'
                  : '매장 데이터가 아직 준비되지 않았습니다.'}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-md border py-3 font-semibold text-gray-800 border-gray-300 hover:bg-gray-50"
        >
          닫기
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default ResultOverlay;
