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
    const checkSurveyStatus = async () => {
      try {
        console.log('🔄 설문 상태 확인: GET /api/survey/status');
        const statusData = await getSurveyStatus();
        console.log('✅ 설문 상태 응답:', statusData);
        
        if (statusData.success && statusData.isCompleted && statusData.businessId) {
          // 설문이 이미 완료된 경우 GuideRouter로 리다이렉트 (세션 존재 여부에 따라 분기)
          console.log('🔀 설문 완료됨 -> GuideRouter로 리다이렉트');
          nav('/guide');
          return;
        }
      } catch (e) {
        console.error('❌ 설문 상태 확인 실패:', e instanceof Error ? e.message : e);
        // 에러가 발생해도 설문을 진행할 수 있도록 함
      } finally {
        setCheckingStatus(false);
      }
    };

    checkSurveyStatus();
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
        message: '설문이 성공적으로 저장되었습니다.',
      });
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : '요청 중 오류가 발생했습니다.';
      console.error(`❌ API 실패: POST /api/survey/submit`, errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToPolicy = () => {
    if (result?.businessId) nav(`/guide/policy/${result.businessId}`);
  };

  // 설문 상태 확인 중이면 로딩 표시
  if (checkingStatus) {
    return (
      <div className="max-w-[375px] mx-auto px-4 py-5 flex flex-col gap-4">
        <section className="rounded-xl p-4" style={{ backgroundColor: colors.gray }}>
          <p className="font-bold text-lg mb-1">대출 가이드</p>
          <p className="text-sm leading-5">설문 상태를 확인하고 있습니다...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-[375px] mx-auto px-4 py-5 flex flex-col gap-4">
      <section
        className="rounded-xl p-4"
        style={{ backgroundColor: colors.gray }}
      >
        <p className="font-bold text-lg mb-1">대출 가이드</p>
        <p className="text-sm leading-5">
          가이드온이 서류 준비를 도와드려요! 정보를 입력하시면 필요한 서류를
          안내해드립니다.
        </p>
      </section>

      {/* Progress Bar */}
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden"
          aria-hidden
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: colors.navy,
            }}
          />
        </div>
        <div className="text-sm text-gray-600 w-16 text-right font-semibold">
          {progressLabel}
        </div>
      </div>

      {/* Current question section (white card) */}
      <section
        className="rounded-xl p-4 flex flex-col gap-3"
        style={{ backgroundColor: colors.white, border: '1px solid #eef0f3' }}
      >
        <p className="font-bold text-lg">{current.label}</p>

        {current.type === 'choice' && (
          <div className="flex flex-col gap-3">
            {current.options.map((opt) => {
              const selected = answers[current.key] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateAnswer(current.key, opt)}
                  className={`w-full py-3 rounded-xl font-semibold border ${selected ? '' : 'bg-white text-gray-800'}`}
                  style={{
                    borderColor: '#e5e7eb',
                    backgroundColor: selected ? colors.navy : '#fff',
                    color: selected ? '#fff' : '#111827',
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
              className="w-full p-3 rounded-xl border outline-none"
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

        <div className="flex gap-2 mt-2">
          {index > 0 && (
            <button
              type="button"
              onClick={goPrev}
              className="flex-1 py-3 rounded-xl font-semibold bg-white border"
              style={{ borderColor: '#e5e7eb' }}
            >
              이전
            </button>
          )}

          {index < total - 1 && (
            <button
              type="button"
              onClick={goNext}
              className={`flex-1 py-3 rounded-xl font-bold ${validateCurrent() ? '' : 'bg-gray-300 text-gray-500'}`}
              style={
                validateCurrent()
                  ? { backgroundColor: colors.navy, color: '#fff' }
                  : undefined
              }
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
              className={`flex-1 py-3 rounded-xl font-bold ${loading ? 'bg-gray-300 text-gray-500' : ''}`}
              style={
                loading
                  ? undefined
                  : { backgroundColor: colors.navy, color: '#fff' }
              }
            >
              {loading ? '검증 중…' : '검증 및 저장'}
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {result?.businessId && (
          <div
            className="mt-2 p-3 rounded-lg"
            style={{
              backgroundColor: result.eligible ? '#e6f7ef' : '#fdecea',
              color: result.eligible ? '#057a55' : '#b91c1c',
            }}
          >
            <p className="text-sm font-semibold">{result.message}</p>
            <p className="text-xs">사업체 ID: {result.businessId}</p>
          </div>
        )}
      </section>

      {/* Navigate to policy list */}
      <button
        type="button"
        onClick={goToPolicy}
        disabled={!result?.businessId}
        className={`w-full py-3 rounded-xl font-bold ${result?.businessId ? '' : 'bg-gray-300 text-gray-500'}`}
        style={
          result?.businessId
            ? { backgroundColor: colors.navy, color: '#fff' }
            : undefined
        }
      >
        다음 단계로 이동
      </button>

    </div>
  );
}

export default DocumentSurveyPage;
