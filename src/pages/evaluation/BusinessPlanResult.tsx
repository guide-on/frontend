import React from 'react';
import { useParams } from 'react-router-dom';
import { colors } from '@/styles/colors';
import { planEvalApi } from '@/api/bizPlanApi';
import type { EvaluationResult, SectionDetail } from '@/api/bizPlanApi';

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
  const { sessionId } = useParams<{ sessionId: string }>();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<EvaluationResult | null>(null);
  const [tab, setTab] = React.useState<'legacy' | 'guideon'>('guideon');
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    let mounted = true;
    async function run() {
      if (!sessionId) {
        setError('세션 정보가 없습니다.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await planEvalApi.getReportBySession(sessionId);
        if (mounted) {
          setData(res);
          setError(null);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || '결과를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  return (
    <div className="px-4 py-5" style={{ background: colors.bgSoft, minHeight: '100vh' }}>
      <div className="max-w-sm mx-auto w-full" style={{ maxWidth: 400 }}>
        <div className="pt-1">
          <div
            className="bg-white p-5 rounded-2xl"
            style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
          >
            {loading ? (
              <div className="text-sm text-gray-600">불러오는 중…</div>
            ) : error ? (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>
            ) : data ? (
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">종합 점수</div>
                  <div className="flex items-end gap-2">
                    <div className="text-4xl font-black text-slate-900">
                      {data.totalScore}
                    </div>
                    <div className="pb-1 text-slate-400">/ 100</div>
                  </div>
                </div>
                <div className="justify-self-end text-right">
                  <div className="text-[12px] text-slate-500 mb-1">등급</div>
                  <div className="text-6xl leading-none font-black text-navy">
                    {data.grade}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div 
            className="mt-4 bg-white rounded-2xl"
            style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex border-b border-gray-200">
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
              <div className="p-4 space-y-3">
                <div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: '#eff6ff' }}
                >
                  <div className="text-xs font-semibold text-navy mb-1">강점</div>
                  <ul className="list-disc pl-4 text-xs text-navy space-y-1">
                    {(data?.strengths ?? []).map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
                <div 
                  className="rounded-xl p-3"
                  style={{ backgroundColor: '#fef2f2' }}
                >
                  <div className="text-xs font-semibold text-rose-700 mb-1">
                    개선
                  </div>
                  <ul className="list-disc pl-4 text-xs text-rose-800 space-y-1">
                    {(data?.risks ?? []).map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === 'guideon' && (
              <div className="p-4 space-y-3">
              {(data?.sections ?? []).map((s: SectionDetail) => {
                const key = String(s.sectionId);
                const bar = s.weight ? (s.score * 100) / s.weight : 0;
                return (
                  <div
                    key={key}
                    className="rounded-2xl bg-white"
                    style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
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
                            <Bar value={bar} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <i
                            className={`fa-solid ${open[key] ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-400`}
                          ></i>
                        </div>
                      </div>
                    </button>
                    {open[key] && (
                      <div className="px-4 pb-4">
                        {s.comment && (
                          <p className="text-xs text-gray-600 mb-2">{s.comment}</p>
                        )}
                        <div className="mb-2">
                          <div className="text-[11px] font-semibold text-gray-500 mb-1">
                            평가 항목
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
                );
              })}
              </div>
            )}
          </div>
        </div>

        <style>{`
          .tab-active { color: #5A89E2; border-bottom: 2px solid #5A89E2; }
        `}</style>
      </div>
    </div>
  );
};

export default BusinessPlanResult;
