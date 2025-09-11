import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/styles/colors';
import {
  postDocumentSurvey,
  getSurveyStatus,
  type DocumentSurveyPayload,
} from '@/api/documentApi';

type Question =
  | {
      key: keyof DocumentSurveyPayload;
      type: 'choice';
      label: string;
      options: string[];
    }
  | {
      key: keyof DocumentSurveyPayload;
      type: 'number';
      label: string;
      placeholder?: string;
    };

export function DocumentSurveyPage() {
  const nav = useNavigate();

  // Temporary questions (will be fetched from DB later)
  const questions: Question[] = useMemo(
    () => [
      {
        key: 'loanPurpose',
        type: 'choice',
        label: '어떤 자금이 필요하신가요?',
        options: ['운전자금', '시설자금'],
      },
      {
        key: 'businessYears',
        type: 'number',
        label: '업력(년)',
        placeholder: '예: 3',
      },
      {
        key: 'annualRevenue',
        type: 'number',
        label: '연매출(원)',
        placeholder: '예: 200000000',
      },
      {
        key: 'employeeCount',
        type: 'number',
        label: '직원 수(명)',
        placeholder: '예: 5',
      },
      {
        key: 'placeType',
        type: 'choice',
        label: '사업장 형태를 선택해주세요',
        options: ['임대', '자가', '전대차'],
      },
    ],
    [],
  );

  const [answers, setAnswers] = useState<Partial<DocumentSurveyPayload>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    businessId?: string | number;
    eligible?: boolean;
    message?: string;
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const total = questions.length;
  const progressPercent = Math.round(((index + 1) / total) * 100);
  const progressLabel = `${index + 1}/${total}`;

  const current = questions[index];

  // 페이지 로드 시 설문 완료 상태 확인
  useEffect(() => {
    let mounted = true;
    
    const checkSurveyStatus = async () => {
      if (!mounted) return;
      try {
        console.log('🔄 설문 상태 확인: GET /api/survey/status');
        const statusData = await getSurveyStatus();
        console.log('✅ 설문 상태 응답:', statusData);
        
        if (statusData.success && statusData.isCompleted && statusData.businessId) {
          // 설문이 이미 완료된 경우 자금 목록 페이지로 리다이렉트
          console.log('🔀 설문 완료됨 -> 자금 목록 페이지로 리다이렉트');
          nav(`/guide/policy/${statusData.businessId}`);
          return;
        }
      } catch (e) {
        console.error('❌ 설문 상태 확인 실패:', e instanceof Error ? e.message : e);
        // 에러가 발생해도 설문을 진행할 수 있도록 함
      } finally {
        if (mounted) {
          setCheckingStatus(false);
        }
      }
    };

    checkSurveyStatus();
    
    return () => {
      mounted = false;
    };
  }, [nav]);

  const updateAnswer = (
    key: keyof DocumentSurveyPayload,
    value: string | number,
  ) => {
    setAnswers((a) => ({ ...a, [key]: value }));
  };

  const validateCurrent = () => {
    const val = answers[current.key];
    if (current.type === 'number') {
      return (
        val !== undefined &&
        val !== null &&
        val !== '' &&
        !Number.isNaN(Number(val))
      );
    }
    if (current.type === 'choice') {
      return typeof val === 'string' && val.length > 0;
    }
    return true;
  };

  const goNext = () => {
    if (!validateCurrent()) return;
    if (index < total - 1) setIndex((s) => s + 1);
  };

  const goPrev = () => {
    if (index > 0) setIndex((s) => s - 1);
  };

  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (loading) return;

    // final validation: ensure all questions answered
    for (const q of questions) {
      const v = answers[q.key];
      if (
        v === undefined ||
        v === null ||
        v === '' ||
        (q.type === 'number' && Number.isNaN(Number(v)))
      ) {
        setError('모든 문항에 답변해 주세요.');
        return;
      }
    }

    setError(null);
    setLoading(true);
    try {
      // Build payload matching backend field meanings
      const payload: DocumentSurveyPayload = {
        loanPurpose: String(answers.loanPurpose),
        businessYears: Number(answers.businessYears),
        annualRevenue: Number(answers.annualRevenue),
        employeeCount: Number(answers.employeeCount),
        placeType: String(answers.placeType ?? ''),
      };

      console.log(`🔄 API 요청: POST /api/survey/submit`, payload);
      const data = await postDocumentSurvey(payload);
      console.log(
        `✅ API 응답: POST /api/survey/submit`,
        data.success !== false ? 'SUCCESS' : 'FAILED',
      );

      setResult({
        businessId: data.businessId,
        eligible: true,
        message: '대출가이드가 완료되었습니다.',
      });
      
      // 완료 후 자동으로 자금 목록 페이지로 이동
      setTimeout(() => {
        nav(`/guide/policy/${data.businessId}`);
      }, 1500);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : '요청 중 오류가 발생했습니다.';
      console.error(`❌ API 실패: POST /api/survey/submit`, errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  // 설문 상태 확인 중이면 로딩 표시
  if (checkingStatus) {
    return (
      <div className="min-h-screen pb-24" style={{ background: colors.bgSoft }}>
        <div className="max-w-[420px] mx-auto px-4 py-6 flex flex-col gap-6">
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/50">
            <p className="font-bold text-lg mb-2 text-gray-900">대출 가이드</p>
            <p className="text-sm leading-5 text-gray-600">설문 상태를 확인하고 있습니다...</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: colors.bgSoft }}>
      <div className="max-w-[420px] mx-auto px-4 py-6 flex flex-col gap-6">
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/50">
          <p className="font-bold text-lg mb-2 text-gray-900">대출 가이드</p>
          <p className="text-sm leading-5 text-gray-600">
            가이드온이 서류 준비를 도와드려요! 정보를 입력하시면 필요한 서류를
            안내해드립니다.
          </p>
        </section>

        {/* Progress Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-medium text-gray-600">진행상황</span>
            <span className="text-xs font-semibold text-gray-800">{progressLabel}</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: colors.navy,
              }}
            />
          </div>
        </div>

        {/* Current question section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/50 flex flex-col gap-4">
          <p className="font-semibold text-lg text-gray-900">{current.label}</p>

          {current.type === 'choice' && (
            <div className="flex flex-col gap-2">
              {current.options.map((opt) => {
                const selected = answers[current.key] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateAnswer(current.key, opt)}
                    className={`w-full py-3 rounded-lg font-medium border transition-all duration-200 hover:scale-[1.01] text-sm ${selected ? 'shadow-md' : 'bg-white hover:bg-gray-50/50 shadow-sm'}`}
                    style={{
                      borderColor: selected ? colors.navy : '#e5e7eb',
                      backgroundColor: selected ? colors.navy : '#fff',
                      color: selected ? '#fff' : '#374151',
                    }}
                    aria-pressed={selected}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {current.type === 'number' && (
            <div className="flex flex-col gap-2">
              <input
                type="number"
                className="w-full p-3 rounded-lg border-2 border-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all bg-white/70 backdrop-blur-sm text-sm"
                placeholder={current.placeholder}
                value={answers[current.key] ?? ''}
                onChange={(e) =>
                  updateAnswer(
                    current.key,
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
              />
            </div>
          )}

          <div className="flex gap-3 mt-5">
            {index > 0 && (
              <button
                type="button"
                onClick={goPrev}
                className="flex-1 py-3 rounded-lg font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-100/80 transition-all text-sm shadow-sm"
              >
                이전
              </button>
            )}

            {index < total - 1 && (
              <button
                type="button"
                onClick={goNext}
                className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${validateCurrent() ? 'shadow-sm hover:scale-[1.01]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                style={{
                  backgroundColor: validateCurrent() ? colors.navy : undefined,
                  color: validateCurrent() ? '#fff' : undefined,
                }}
                disabled={!validateCurrent()}
              >
                다음
              </button>
            )}

            {index === total - 1 && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'shadow-sm hover:scale-[1.01]'}`}
                style={{
                  backgroundColor: loading ? undefined : colors.navy,
                  color: loading ? undefined : '#fff',
                }}
              >
                {loading ? '처리 중…' : '완료'}
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {result?.businessId && (
            <div
              className="mt-4 p-4 rounded-xl shadow-sm border"
              style={{
                backgroundColor: result.eligible ? '#ecfdf5' : '#fef2f2',
                borderColor: result.eligible ? '#a7f3d0' : '#fecaca',
                color: result.eligible ? '#065f46' : '#dc2626',
              }}
            >
              <p className="text-sm font-semibold mb-1">{result.message}</p>
              <p className="text-xs opacity-75">잠시 후 맞춤 자금 목록을 보여드릴게요...</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default DocumentSurveyPage;
