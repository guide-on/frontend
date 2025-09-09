import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/styles/colors';
import { getDocumentStatus } from '@/api/documentApi';

export default function MydataSyncComplete() {
  const { sessionId = '' } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [completed, setCompleted] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    console.log(`[3] 연동 완료 페이지 로드 ID: ${sessionId}`);
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getDocumentStatus(sessionId);
        if (!mounted) return;
        if (typeof data.progressPercentage === 'number')
          setProgress(Math.round(data.progressPercentage));
        if (typeof data.completedRequirements === 'number')
          setCompleted(data.completedRequirements);
        if (typeof data.totalRequirements === 'number')
          setTotal(data.totalRequirements);
      } catch (e: any) {
        if (!mounted) return;
        setError(
          e?.message || '진행도 정보를 불러오는 중 오류가 발생했습니다.',
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  return (
    <div className="max-w-[375px] mx-auto px-4 py-8 flex flex-col items-center gap-6">
      <div
        className="w-full bg-white rounded-2xl p-6 text-center"
        style={{ border: `1px solid ${colors.paleBlue}` }}
      >
        <div
          className="mx-auto mb-4 w-28 h-28 rounded-full grid place-items-center"
          style={{ background: 'linear-gradient(135deg,#34d39922, #60a5fa22)' }}
        >
          <div
            className="text-white text-4xl font-extrabold"
            style={{ color: colors.navy }}
          >
            ✓
          </div>
        </div>

        <div
          className="text-2xl font-extrabold mb-2"
          style={{ color: colors.navy }}
        >
          마이데이터 수집 완료
        </div>
        <div className="text-sm text-gray-600 mb-4">
          마이데이터로 서류 자동 수집을 시도했습니다. 결과는 아래에서
          확인하세요.
        </div>

        <div className="mb-4 text-left">
          {loading ? (
            <div className="text-sm text-gray-500">진행도 불러오는 중…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-500">전체 서류</div>
                <div className="text-sm font-semibold">
                  {completed ?? 0}/{total ?? 0}
                </div>
              </div>

              <div className="w-full h-3 rounded-full bg-gray-200 mb-2">
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${progress ?? 0}%`,
                    background: progress === 100 ? '#10B981' : '#3b82f6',
                  }}
                />
              </div>

              <div className="text-xs text-gray-500">
                진행률 {progress ?? 0}%
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <button
            onClick={() => nav(`/guide/documents/${sessionId}`)}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white"
            style={{ backgroundColor: colors.navy }}
          >
            서류 확인하러 가기
          </button>
          <button
            onClick={() => nav('/')}
            className="w-full py-3 px-4 rounded-lg font-semibold border"
            style={{ borderColor: colors.navy, color: colors.navy }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>

      <div className="w-full text-sm text-gray-500">
        자동 수집으로 반영되지 않은 항목은 수동으로 업로드하시거나, 서류 확인
        화면에서 상태를 갱신하세요.
      </div>
    </div>
  );
}
