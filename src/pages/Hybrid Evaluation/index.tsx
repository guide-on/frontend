import { Link } from 'react-router-dom';
import { colors } from '@/styles/colors';

const HybridEvaluation = () => {
  return (
    <div
      className="px-4 py-6 h-screen space-y-5"
      style={{ background: colors.bgSoft }}
    >
      <h1 className="text-center text-xl font-extrabold text-navy">
        하이브리드 신용평가
      </h1>

      <section className="rounded-2xl p-5 shadow-[0_12px_36px_rgba(17,24,39,0.06)] bg-paleBlue">
        <p className="font-semibold mb-1 text-navy">안녕하세요 홍길동님</p>
        <p className="text-sm text-gray-600">
          신용도 확인에 앞서 다음은 평가 요소 및 활용입니다.
        </p>
      </section>

      <section
        className="rounded-2xl flex flex-col w-full shadow-[0_12px_36px_rgba(17,24,39,0.06)] bg-white"
        style={{ height: 410 }}
      >
        <div className="p-4 text-gray-600">
          <div className="text-base font-semibold mb-1 text-navy">
            평가 요소
          </div>
          <div>
            <h3 className="text-sm">- 매출 안정성 및 성장성</h3>
          </div>
          <div>
            <h3 className="text-sm">- 현금흐름 건전성</h3>
          </div>
          <div>
            <h3 className="text-sm">- ESG 경영</h3>
          </div>
          <div>
            <h3 className="text-sm mb-4">- 대표자 금융 신용도</h3>
          </div>
          <hr></hr>
          <div className="mt-3">
            {/* <h3 className="text-base font-semibold mb-1">활용 방안</h3>
            <p className="text-sm text-gray-600">
              각 평가 요소의 활용 방안은 다음과 같습니다.
            </p> */}
            <h3 className="text-base font-semibold text-navy mt-4">
              대표자 금융 신용도
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              기존 신용평가에 해당하는 대표자 금융 신용도를 <br></br>
              기준으로 신용평가 점수가 산출됩니다.
            </p>
            <h3 className="text-base font-semibold text-navy mt-4">
              비금융정보
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              매출 안정성 및 성장성, 현금흐름 건전성, ESG 경영 등 <br></br>
              비금융정보를 활용한 하이브리드 신용평가가 산출됩니다.
            </p>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-navy">
              최종 신용평가 결과
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              신용평가 시 대표자 금융 신용도와
              <br /> 하이브리드 신용평가가 동시에 반영됩니다.
            </p>
          </div>
        </div>
      </section>

      <Link
        to="/hybrid-evaluation/start"
        className="w-full inline-block text-center py-4 rounded-md font-semibold mt-5 bg-navy text-white hover:bg-blue shadow-md transition"
      >
        신용도 확인 시작하기
      </Link>
    </div>
  );
};

export default HybridEvaluation;
