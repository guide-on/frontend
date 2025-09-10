import { Link, useParams, useNavigate } from 'react-router-dom';
import { colors } from '@/styles/colors';
import { useAuthStore } from '@/stores/useAuthStore';

const HybridEvaluation = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  console.log('🔍 [HybridEvaluation] URL sessionId:', sessionId);
  console.log('🔍 [HybridEvaluation] user.sessionId:', user?.sessionId);

  const handleStartEvaluation = () => {
    const currentSessionId = sessionId || user?.sessionId;
    console.log('🚀 [HybridEvaluation] handleStartEvaluation - using sessionId:', currentSessionId);
    
    if (!currentSessionId) {
      alert('세션 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }
    navigate(`/hybrid-evaluation/start/${currentSessionId}`);
  };

  return (
    <div
      className="px-4 py-6 h-screen space-y-5"
      style={{ background: colors.bgSoft }}
    >
      <h1 className="text-center text-2xl font-extrabold text-navy">
        하이브리드 신용평가
      </h1>

      <section className="rounded-2xl p-5 shadow-sm bg-paleBlue">
        <p className="font-semibold mb-1 text-navy">안녕하세요 홍길동님</p>
        <p className="text-sm text-gray-600">
          신용도 확인에 앞서 다음은 평가 요소 및 활용입니다.
        </p>
      </section>

      <section
        className="rounded-2xl flex flex-col w-full shadow-inner bg-white"
        style={{ height: 400 }}
      >
        <div className="p-4 text-gray-600">
          <div>
            <h3 className="text-sm mb-1">매출 안정성 및 성장성</h3>
          </div>
          <div>
            <h3 className="text-sm mb-1">현금흐름 건전성</h3>
          </div>
          <div>
            <h3 className="text-sm mb-1">ESG 경영</h3>
          </div>
          <div>
            <h3 className="text-sm mb-4">대표자 금융 신용도</h3>
          </div>
          <hr></hr>
          <div className="mt-3">
            {/* <h3 className="text-base font-semibold mb-1">활용 방안</h3>
            <p className="text-sm text-gray-600">
              각 평가 요소의 활용 방안은 다음과 같습니다.
            </p> */}
            <h3 className="text-base font-semibold text-gray-600 mt-4">
              대표자 금융 신용도
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              기존 신용평가에 해당하는 대표자 금융 신용도를 <br></br>
              기준으로 신용평가 점수가 산출됩니다.
            </p>
            <h3 className="text-base font-semibold text-gray-600 mt-4">
              비금융정보
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              매출 안정성 및 성장성, 현금흐름 건전성, ESG 경영 등 <br></br>
              비금융정보를 활용한 하이브리드 신용평가가 산출됩니다.
            </p>
          </div>
          <div className="text-gray-600 mt-4">
            <h3 className="text-base font-semibold">최종 신용평가 결과</h3>
            <p className="text-sm text-gray-600 mt-1">
              신용평가 시 대표자 금융 신용도와 하이브리드 신용평가가 동시에
              반영됩니다.
            </p>
          </div>
        </div>
      </section>

      <button
        onClick={handleStartEvaluation}
        className="w-full py-4 rounded-md font-semibold mt-5 bg-navy text-white hover:bg-blue shadow-md transition"
      >
        신용도 확인 시작하기
      </button>
    </div>
  );
};

export default HybridEvaluation;
