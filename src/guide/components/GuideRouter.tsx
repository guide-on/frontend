import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/styles/colors';
import { getSimulations, getSurveyStatus } from '@/api/documentApi';

export function GuideRouter() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndRoute = async () => {
      try {
        // 1. 먼저 설문 상태 확인
        console.log('🔄 설문 상태 확인: GET /api/survey/status');
        const surveyStatus = await getSurveyStatus();
        console.log('✅ 설문 상태 응답:', surveyStatus);
        
        if (!surveyStatus.success || !surveyStatus.isCompleted || !surveyStatus.businessId) {
          // 설문이 완료되지 않았으면 설문 페이지로
          console.log('🔀 설문 미완료 -> DocumentSurveyPage로 이동');
          nav('/guide/survey', { replace: true });
          return;
        }

        // 2. 설문이 완료되었으면 세션 존재 여부 확인
        console.log(`🔄 시뮬레이션 세션 확인: GET /api/session/${surveyStatus.businessId}/simulations`);
        const simulationsResponse = await getSimulations(surveyStatus.businessId);
        console.log('✅ 시뮬레이션 세션 응답:', simulationsResponse);
        
        if (simulationsResponse.success && simulationsResponse.sessions && simulationsResponse.sessions.length > 0) {
          // 세션이 존재하면 시뮬레이션 페이지로
          console.log('🔀 세션 존재 -> /simulation으로 이동');
          nav('/simulation', { replace: true });
        } else {
          // 세션이 없으면 자금 목록 페이지로
          console.log('🔀 세션 없음 -> PolicyListPage로 이동');
          nav(`/guide/policy/${surveyStatus.businessId}`, { replace: true });
        }
      } catch (e) {
        console.error('❌ 가이드 라우팅 확인 실패:', e instanceof Error ? e.message : e);
        // 에러 발생 시 기본적으로 설문 페이지로
        nav('/guide/survey', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAndRoute();
  }, [nav]);

  // 로딩 중일 때 표시할 화면
  if (loading) {
    return (
      <div className="max-w-[375px] mx-auto px-4 py-5 flex flex-col gap-4">
        <section className="rounded-xl p-4" style={{ backgroundColor: colors.gray }}>
          <p className="font-bold text-lg mb-1">대출 가이드</p>
          <p className="text-sm leading-5">가이드를 준비하고 있습니다...</p>
        </section>
      </div>
    );
  }

  // 로딩이 완료되면 이 컴포넌트는 표시되지 않음 (다른 페이지로 이동)
  return null;
}