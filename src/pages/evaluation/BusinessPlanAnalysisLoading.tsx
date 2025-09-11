import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/styles/colors';

export default function BusinessPlanAnalysisLoading() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<number>(0);

  useEffect(() => {
    // 단계별 완료 애니메이션
    const step1Timer = setTimeout(() => setCompletedSteps(1), 800);
    const step2Timer = setTimeout(() => setCompletedSteps(2), 1800);
    const step3Timer = setTimeout(() => setCompletedSteps(3), 2800);
    
    // 4초 후 전체 완료 페이지로 이동
    const navigateTimer = setTimeout(() => {
      if (sessionId) {
        navigate(`/guide/${sessionId}/business-plan/overall-complete`);
      }
    }, 4000);

    return () => {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(navigateTimer);
    };
  }, [sessionId, navigate]);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: colors.bgSoft }}
    >
      {/* 로딩 애니메이션 컨테이너 */}
      <div className="flex flex-col items-center gap-8 mb-12">
        {/* 이중 스피너 컨테이너 */}
        <div className="relative w-20 h-20">
          <div 
            className="w-20 h-20 border-4 border-opacity-10 border-t-4 rounded-full animate-spin"
            style={{ 
              borderColor: `${colors.blue}1a`, 
              borderTopColor: colors.blue 
            }}
          />
          <div 
            className="absolute top-2.5 left-2.5 w-15 h-15 border-3 border-opacity-10 border-t-3 rounded-full animate-spin"
            style={{ 
              borderColor: `${colors.navy}1a`, 
              borderTopColor: colors.navy,
              animation: 'spin 1.5s linear infinite reverse',
              width: '60px',
              height: '60px',
              borderWidth: '3px'
            }}
          />
        </div>

        {/* 점멸 도트 애니메이션 */}
        <div className="flex gap-2">
          <span 
            className="w-3 h-3 rounded-full animate-bounce"
            style={{ 
              background: `linear-gradient(135deg, ${colors.blue} 0%, ${colors.navy} 100%)`,
              animationDelay: '-0.32s'
            }}
          />
          <span 
            className="w-3 h-3 rounded-full animate-bounce"
            style={{ 
              background: `linear-gradient(135deg, ${colors.blue} 0%, ${colors.navy} 100%)`,
              animationDelay: '-0.16s'
            }}
          />
          <span 
            className="w-3 h-3 rounded-full animate-bounce"
            style={{ 
              background: `linear-gradient(135deg, ${colors.blue} 0%, ${colors.navy} 100%)`,
              animationDelay: '0s'
            }}
          />
        </div>
      </div>

      {/* 로딩 텍스트 */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">
          사업계획서 분석 중...
        </h2>
        <p className="text-gray-600 leading-relaxed max-w-sm">
          AI가 귀하의 사업계획서를 꼼꼼히 검토하여<br />
          맞춤형 피드백을 준비하고 있습니다
        </p>
      </div>

      {/* 진행 단계 표시 */}
      <div className="mt-8 space-y-3 text-sm text-gray-500 text-center">
        {[
          { text: '서류 완성도 검토', status: completedSteps >= 1 ? 'completed' : 'pending' },
          { text: '사업 타당성 분석', status: completedSteps >= 2 ? 'completed' : completedSteps === 1 ? 'progress' : 'pending' },
          { text: '자금 계획 정합성 검토', status: completedSteps >= 3 ? 'completed' : completedSteps === 2 ? 'progress' : 'pending' }
        ].map((step, index) => (
          <div 
            key={index}
            className="flex items-center justify-center gap-3 transition-all duration-500"
          >
            <div className="relative">
              {step.status === 'completed' ? (
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              ) : step.status === 'progress' ? (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
              )}
            </div>
            <span className={`transition-colors duration-500 ${
              step.status === 'completed' ? 'text-green-600 font-medium' : 
              step.status === 'progress' ? 'text-blue-600 font-medium' : 
              'text-gray-500'
            }`}>
              {step.text}
              {step.status === 'completed' && ' 완료'}
              {step.status === 'progress' && ' 중...'}
              {step.status === 'pending' && ' 대기'}
            </span>
            {step.status === 'completed' && (
              <div className="text-green-500 text-xs animate-bounce">✓</div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-bounce {
          animation: dot-bounce 1.4s ease-in-out infinite both;
        }
        
        @keyframes dot-bounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}