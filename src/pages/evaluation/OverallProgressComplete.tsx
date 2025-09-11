import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/styles/colors';

export default function OverallProgressComplete() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [showButton, setShowButton] = useState<boolean>(false);

  useEffect(() => {
    // 단계별 완료 애니메이션
    const step1Timer = setTimeout(() => setCompletedSteps(1), 800);
    const step2Timer = setTimeout(() => setCompletedSteps(2), 1800);
    const step3Timer = setTimeout(() => setCompletedSteps(3), 2800);

    // 버튼 표시
    const buttonTimer = setTimeout(() => setShowButton(true), 3500);

    return () => {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(buttonTimer);
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: colors.bgSoft }}
    >
      {/* 완료 애니메이션 */}
      <div className="flex flex-col items-center gap-8 mb-8">
        {/* 완료 스피너 (정적) */}
        <div className="relative w-20 h-20">
          <div
            className="w-20 h-20 border-4 rounded-full"
            style={{
              borderColor: `${colors.blue}3a`,
              borderTopColor: colors.blue,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 완료 텍스트 */}
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-2xl font-bold text-green-600">
          모든 검토가 완료되었습니다!
        </h2>
        <p className="text-gray-600 leading-relaxed">
          대출 승인 가능성을 종합적으로 분석했습니다.
          <br />
          시뮬레이션 결과를 확인해보세요!
        </p>
      </div>

      {/* 전체 프로세스 단계별 진행 바 */}
      <div className="w-full max-w-lg space-y-8 mb-10">
        {/* 1-2-3 단계 진행 바 */}
        <div className="flex items-center justify-between px-8">
          {[
            { num: 1, label: '서류\n검증' },
            { num: 2, label: '신용도\n확인' },
            { num: 3, label: '사업계획서\n평가' },
          ].map((step, index) => (
            <>
              <div key={step.num} className="flex flex-col items-center min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-700 ${
                    completedSteps >= step.num
                      ? 'text-white scale-110 shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  style={{
                    backgroundColor:
                      completedSteps >= step.num ? colors.navy : undefined,
                  }}
                >
                  {completedSteps >= step.num ? '✓' : step.num}
                </div>
                <span
                  className={`mt-2 text-xs text-center leading-tight transition-colors duration-700 ${
                    completedSteps >= step.num
                      ? 'font-semibold'
                      : 'text-gray-500'
                  }`}
                  style={{
                    color:
                      completedSteps >= step.num ? colors.navy : undefined,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {step.label}
                </span>
              </div>
              {index < 2 && (
                <div className="flex-1 mx-4">
                  <div
                    className={`w-full h-2 rounded-full transition-all duration-700 ${
                      completedSteps > step.num ? '' : 'bg-gray-200'
                    }`}
                    style={{
                      backgroundColor:
                        completedSteps > step.num ? colors.navy : undefined,
                    }}
                  />
                </div>
              )}
            </>
          ))}
        </div>

      </div>

      {/* 완료 버튼 */}
      {showButton && (
        <div className="w-full max-w-sm animate-fadeIn">
          <button
            onClick={() => {
              if (sessionId) {
                navigate(`/simulation/${sessionId}`);
              }
            }}
            className="w-full rounded-xl py-3 px-6 text-base font-semibold text-white shadow-md transition-all duration-300 hover:opacity-90 hover:scale-105"
            style={{ background: colors.navy }}
          >
            대출 시뮬레이션 결과 확인하러가기
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInComplete {
          0% {
            opacity: 0.5;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-bounce {
          animation: dot-bounce 1.4s ease-in-out infinite both;
        }

        @keyframes dot-bounce {
          0%,
          80%,
          100% {
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
