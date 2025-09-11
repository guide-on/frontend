import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getDocumentStatus } from '@/api/documentApi';
import type {} from '@/api/documentApi';
import { colors } from '@/styles/colors';
import { CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { planEvalApi } from '@/api/bizPlanApi';
import ProcessStepHeader from '@/components/guide/ProcessStepHeader';

type DocStatus = Awaited<ReturnType<typeof getDocumentStatus>>;

export default function BusinessPlanReady() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DocStatus | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!sessionId) {
        setError('세션 정보가 없습니다.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getDocumentStatus(sessionId);
        if (mounted) {
          setData(res);
          setError(null);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || '서류 상태를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  // 사업계획서만 제출되어도 시작 가능
  const businessPlanSubmitted = useMemo(() => {
    if (!data) return false;
    const groups = data.documentGroups ?? [];
    const matchText = (txt: string) => {
      const t = (txt || '').replace(/\s+/g, '').toLowerCase();
      return (
        t.includes('사업계획서') ||
        (t.includes('사업') && t.includes('계획서')) ||
        t.includes('businessplan')
      );
    };
    for (const g of groups) {
      if (matchText(g.label)) {
        for (const d of g.documents) {
          const submitted =
            d.isMydataRetrieved ||
            d.uploadStatus === 'completed' ||
            d.status === 'completed';
          if (submitted) return true;
        }
      }
      for (const d of g.documents) {
        if (matchText(d.name)) {
          const submitted =
            d.isMydataRetrieved ||
            d.uploadStatus === 'completed' ||
            d.status === 'completed';
          if (submitted) return true;
        }
      }
    }
    return false;
  }, [data]);

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{ background: colors.bgSoft }}
    >
      <ProcessStepHeader currentStep={3} />

      <div className="px-4 py-5 flex-1">
        <div className="max-w-sm mx-auto">
          {/* 헤더 문구 */}
          <section className="rounded-2xl p-6 bg-white shadow-sm mb-4">
            <h3 className="text-xl leading-tight font-extrabold text-gray-900">
              작성하신 <span style={{ color: colors.blue }}>사업계획서</span>를
              평가해드려요!
            </h3>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              사업계획서를 제출하지 않으셨다면 아래의 서류 확인으로 이동해 제출
              후 평가를 진행해주세요.
            </p>
          </section>

          {/* 미니 �����어로 */}
          <section
            className="mb-4 rounded-2xl overflow-hidden shadow-sm"
            style={{
              background: 'linear-gradient(to right, #eff6ff, #eef2ff)',
            }}
          >
            <div className="p-6 flex items-center gap-4">
              <div className="shrink-0 inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white shadow-sm">
                <FileText className="w-8 h-8" style={{ color: colors.blue }} />
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-semibold text-gray-900 truncate">
                  {data?.policyName ?? '사업계획서 평가'}
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  최근 업로드하신 파일을 기반으로 평가합니다.
                </div>
              </div>
              <Sparkles
                className="ml-auto w-6 h-6"
                style={{ color: colors.blue }}
              />
            </div>
          </section>

          {/* 어떤 점을 평가하나요 */}
          <section className="mb-4 rounded-2xl p-6 bg-white shadow-sm">
            <h3 className="text-sm font-bold text-gray-900">
              어떤 점을 평가하나요?
            </h3>
            <ul className="mt-3 space-y-2">
              {[
                {
                  title: '서류 완성도',
                  desc: '누락/오탈자, 합계·비율 일관성 검사',
                },
                {
                  title: '사업 타당성',
                  desc: '제품·시장·운영 계획의 구체성 점검',
                },
                {
                  title: '자금 계획 정합성',
                  desc: '시설/운전 합계, 조달 구조 크로스체크',
                },
                {
                  title: '리스크 신호',
                  desc: '거래처 집중도, 외주 비중 등 위험요인',
                },
                {
                  title: '개선 제안',
                  desc: '승인 관점에서 보완 포인트를 문장으로 제시',
                },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 w-4 h-4"
                    style={{ color: colors.blue }}
                  />
                  <p className="text-[13px]">
                    <span className="font-semibold text-gray-900">
                      {item.title}
                    </span>
                    <span className="text-gray-600"> — {item.desc}</span>
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-lg bg-blue-50/60 text-[12px] text-gray-700 p-3">
              업로드된 파일은 본 서비스의 승인 시뮬레이션을 위해서만 이용됩니다.
              실제 대출 심사 결과는 금융사 정책·심사 기준에 따라 달라질 수
              있어요.
            </div>

            {loading && (
              <div className="mt-3 text-xs text-gray-600">불러오는 중…</div>
            )}
            {error && (
              <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
                {error}
              </div>
            )}
          </section>

          {/* 하단 액션 */}
          <div className="mt-6">
            <button
              onClick={async () => {
                if (!sessionId) return;
                try {
                  setStarting(true);
                  await planEvalApi.evaluate(sessionId);
                } catch (e) {
                  console.error('평가 시작 실패', e);
                } finally {
                  navigate(`/guide/${sessionId}/business-plan/analysis-loading`);
                }
              }}
              disabled={starting}
              className="w-full rounded-xl py-4 font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: colors.navy }}
            >
              {starting ? '시작 중…' : '평가하기'}
            </button>
          </div>

          {!businessPlanSubmitted && (
            <p className="mt-3 text-xs text-gray-600">
              사업계획서를 제출하면 평가를 바로 시작할 수 있습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
