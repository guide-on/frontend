import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/styles/colors';

type ScoreDetail = {
  key: string;
  label: string;
  score: number; // 0-100
  weight: number; // % weight for total
  comment: string;
  points: string[]; // 평가 포인트 요지
  mappings: string[]; // 서식 맵핑
  suggestions: string[];
};

type EvaluationPayload = {
  fileName: string;
  uploadedAt: string;
  totalScore: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  pass: boolean;
  successProbability: number; // 0-100
  strengths: string[];
  risks: string[];
  sections: ScoreDetail[];
};

const mock: EvaluationPayload = {
  fileName: '사업계획서_홍길동.pdf',
  uploadedAt: '2025-08-31T02:10:00Z',
  totalScore: 84,
  grade: 'A',
  pass: true,
  successProbability: 80,
  strengths: [
    '시장/경쟁 분석 구조가 명확하고 수치 근거가 있음',
    '자금용도와 매출 목표의 연계성이 좋음',
    '경영진 역량이 업종과 일치함',
  ],
  risks: ['외주 비중이 높아 원가 변동 위험 존재', '거래처 집중도 개선 필요'],
  sections: [
    {
      key: 's1',
      label: '영업현황의 구체성·완결성',
      score: 8,
      weight: 10,
      comment: '주요 생산·판매 비중 및 최근 추이가 비교적 명확함.',
      points: [
        '주 생산품목 명확성',
        '최근 매출/수출 추이 기재',
        '생산·판매비중 합계 일관성',
      ],
      mappings: ['영업현황'],
      suggestions: ['최근 12개월 매출 추이를 그래프로 제시'],
    },
    {
      key: 's2',
      label: '제품/서비스 정의 & 경쟁력',
      score: 12,
      weight: 15,
      comment: '용도·특성과 ��별점이 구체적이며 가격/품질 근거가 일부 제시됨.',
      points: [
        '개요·용도/특성의 명료성',
        '차별점/단가·가격대 근거',
        '고객가치 서술',
      ],
      mappings: ['생산품목 개요', '용도 및 특성'],
      suggestions: ['경쟁사 대비 비교표 추가'],
    },
    {
      key: 's3',
      label: '대표자/경영진 역량',
      score: 8,
      weight: 10,
      comment: '업력 연속성과 직무 적합 경력이 확인됨.',
      points: ['업력 연속성', '역량-성과 연결', '적합 경력', '��직 보완성'],
      mappings: ['경력', '경영진(대표 제외)'],
      suggestions: ['핵심 인력 KPI 및 역할 명시'],
    },
    {
      key: 's4',
      label: '거래처·매출 구조의 안정성',
      score: 7,
      weight: 10,
      comment: '상위 거래처 집중도가 다소 높음.',
      points: [
        '거래처 다양성/집중도',
        '결제조건·외상비율 타당성',
        '거래처간 지속성',
      ],
      mappings: ['주요 거래처'],
      suggestions: ['신규 채널 발굴 계획 보완'],
    },
    {
      key: 's5',
      label: '생산/운영 체계의 현실성',
      score: 8,
      weight: 10,
      comment: '가동상황과 보유시설이 생산방식과 대체로 일치.',
      points: ['가동일/시간 현실성', '공장·기계·건물 보유', '생산방식과 일치'],
      mappings: ['가동상황', '주요 보유시설', '생산방식'],
      suggestions: ['외주 리스크 대응 프로세스 추가'],
    },
    {
      key: 's6',
      label: '향후 사업계획의 실행가능성',
      score: 8,
      weight: 15,
      comment: 'KPI와 단계 로드맵, 리스크 대응이 비교적 구체적임.',
      points: [
        'KPI',
        '단���별 실행 로드맵',
        '리스크/대응',
        '마케팅·인력·운영 계획',
      ],
      mappings: ['향후 사업계획'],
      suggestions: ['분���별 KPI 체크포인트 표기'],
    },
    {
      key: 's7',
      label: '자금용도의 적정성',
      score: 8,
      weight: 10,
      comment: '용도-성과 연결과 세부 항목화가 양호함.',
      points: ['용도-성과 연결', '세부 항목화·시기', '단가 근거'],
      mappings: ['자금용도 및 사업계획'],
      suggestions: ['인건비 산출 근거 표 추가'],
    },
    {
      key: 's8',
      label: '자금소요 내역의 타당성',
      score: 7,
      weight: 8,
      comment: '견적/시세 근거가 제시되며 중복/누락 없음.',
      points: ['산출근거 명확', '시설/운전 구분 명확', '중���·누락 없음'],
      mappings: ['자금소요 내역'],
      suggestions: ['주요 항목 견적서 사본 첨부'],
    },
    {
      key: 's9',
      label: '자금조달 계획의 신뢰성',
      score: 6,
      weight: 8,
      comment: '자체자금 비중과 차입 조건의 현실성이 무난함.',
      points: ['자체자금 비중', '타 차입 구조·조건 현실성', '총액 일치'],
      mappings: ['자금조달 계획'],
      suggestions: ['금리/기간 변동 ��나리오 민감도 분석'],
    },
    {
      key: 's10',
      label: '데이터 일관성·증빙',
      score: 4,
      weight: 4,
      comment: '비율·합계의 논리 일치가 잘 유지되고 증빙이 명확함.',
      points: ['합계/비율 논리 일치', '크로스체크', '증빙내역 명시'],
      mappings: ['전 섹션 공통'],
      suggestions: ['중요 수치 출처 각주 표기'],
    },
  ],
};

const Bar: React.FC<
  { value: number } & React.HTMLAttributes<HTMLDivElement>
> = ({ value, className }) => {
  return (
    <div className={`w-full h-2 rounded-full bg-slate-200 ${className ?? ''}`}>
      <div
        className="h-2 rounded-full"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: colors.blue,
        }}
      />
    </div>
  );
};

const BusinessPlanResult: React.FC = () => {
  const navi = useNavigate();
  const goLogin = () => navi('/auth/login');

  const d = mock;
  const [tab, setTab] = React.useState<'legacy' | 'guideon'>('guideon');
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  const legacySummary: {
    key: string;
    title: string;
    desc: string;
    score: number;
  }[] = [
    {
      key: 'rev',
      title: '매출 안정성 및 성장성',
      desc: '사업이 실제로 돈을 얼마나 잘 벌고 있는지를 ���가합니다.',
      score: 82,
    },
    {
      key: 'cash',
      title: '현금흐름 건전성',
      desc: '현금 순환과 결제 조건의 건전성을 평가합니다.',
      score: 83,
    },
    {
      key: 'esg',
      title: 'ESG',
      desc: '가게 운영 관련 실천적인 행동들을 중심으로 평가합니다.',
      score: 88,
    },
  ];

  return (
    <div className="px-4 py-5">
      <div className="max-w-sm mx-auto w-full" style={{ maxWidth: 400 }}>
        <div className="pt-1">
          <div
            className="bg-white border p-5 rounded-2xl shadow-sm"
            style={{ borderColor: colors.navyBorder }}
          >
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <div className="text-[12px] text-slate-500 mb-1">종합 점수</div>
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-black text-slate-900">
                    {d.totalScore}
                  </div>
                  <div className="pb-1 text-slate-400">/ 100</div>
                </div>
                <div className="mt-2 inline-flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold ${d.pass ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {d.pass ? '통과' : '미흡'}
                  </span>
                </div>
              </div>
              <div className="justify-self-end text-right">
                <div className="text-[12px] text-slate-500 mb-1">등급</div>
                <div className="text-6xl leading-none font-black text-navy">
                  {d.grade}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
              <div className="flex items-center gap-1">
                <i className="fa-regular fa-file-lines" /> {d.fileName}
              </div>
              <div className="text-right">
                업로드 {new Date(d.uploadedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="mt-2 flex border-b border-gray-200 mb-1">
            <button
              className={`flex-1 py-3 px-4 text-center font-semibold transition-all ${tab === 'legacy' ? 'tab-active' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setTab('legacy')}
            >
              포인트 요약
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-semibold transition-all ${tab === 'guideon' ? 'tab-active' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setTab('guideon')}
            >
              세부 평가 항목
            </button>
          </div>

          {tab === 'legacy' && (
            <div className="mt-5 space-y-3">
              <div
                className="rounded-xl bg-paleBlue border p-3"
                style={{ borderColor: colors.lightBlue }}
              >
                <div className="text-xs font-semibold text-navy mb-1">강점</div>
                <ul className="list-disc pl-4 text-xs text-navy space-y-1">
                  {d.strengths.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
                <div className="text-xs font-semibold text-rose-700 mb-1">
                  개선
                </div>
                <ul className="list-disc pl-4 text-xs text-rose-800 space-y-1">
                  {d.risks.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === 'guideon' && (
            <div className="mt-4 space-y-3">
              {d.sections.map((s) => (
                <div
                  key={s.key}
                  className="rounded-2xl border"
                  style={{ borderColor: colors.navyBorder }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpen((o) => ({ ...o, [s.key]: !o[s.key] }))
                    }
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <div className="text-[15px] font-semibold text-gray-900 truncate">
                            {s.label}
                          </div>
                          <div className="flex gap-1 text-sm">
                            <span className="text-gray-800 font-bold">
                              {s.score}
                            </span>
                            <span>/</span>
                            <span className="text-gray-500">{s.weight}</span>
                          </div>
                        </div>
                        <div className="mt-1">
                          <Bar value={(s.score * 100) / s.weight} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <i
                          className={`fa-solid ${open[s.key] ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-400`}
                        ></i>
                      </div>
                    </div>
                  </button>
                  {open[s.key] && (
                    <div className="px-4 pb-4">
                      <p className="text-xs text-gray-600 mb-2">{s.comment}</p>
                      <div className="mb-2">
                        <div className="text-[11px] font-semibold text-gray-500 mb-1">
                          평��� 항목
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {s.mappings.map((m, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="text-[11px] font-semibold text-gray-500 mb-1">
                          평가 포인트
                        </div>
                        <ul className="list-disc pl-5 text-xs text-gray-700 space-y-1">
                          {s.points.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                      {s.suggestions.length > 0 && (
                        <div className="mt-3">
                          <div className="text-[11px] font-semibold text-gray-500 mb-1">
                            개선 제안
                          </div>
                          <ul className="list-disc pl-5 text-xs text-gray-700 space-y-1">
                            {s.suggestions.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* <div className="mt-6 flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 border rounded-md py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border-gray-200"
            >
              저장/인쇄
            </button>
            <button
              onClick={goLogin}
              className="flex-1 text-white py-2 rounded-md font-bold text-sm shadow"
              style={{ background: colors.navy }}
            >
              로그인으로
            </button>
          </div> */}
        </div>

        {/* <p className="mt-3 text-[11px] text-gray-600">
          실제 평가는 업로드된 서류를 기반으로 백엔드에서 수행되며, 본 화면은
          예시 데이터로 구성되었습니다.
        </p> */}
      </div>

      <style>{`
        .tab-active { color: #5A89E2; border-bottom: 2px solid #5A89E2; }
      `}</style>
    </div>
  );
};

export default BusinessPlanResult;
