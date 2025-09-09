import { Link } from 'react-router-dom';

const HybridEvaluation = () => {
  return (
    <div className="px-4 py-6 space-y-5">
      <h1 className="text-center text-2xl font-extrabold text-navy">하이브리드 신용평가</h1>

      <section className="rounded-2xl p-5 shadow-sm bg-paleBlue border border-lightBlue/70">
        <p className="font-semibold mb-1 text-navy">안녕하세요 ㅇㅇㅇ님</p>
        <p className="text-sm text-gray-600">신용도 확인에 앞서 다음은 평가 요소 및 활용 비중입니다.</p>
      </section>

      <section className="rounded-xl flex items-center justify-center w-full shadow-inner bg-white border border-lightBlue/60" style={{ height: 280 }}>
        <span className="text-sm text-gray-700">하이브리드 신용평가 기반의 평가 표</span>
      </section>

      <Link
        to="/hybrid-evaluation/start"
        className="w-full inline-block text-center py-4 rounded-md font-semibold mt-2 bg-navy text-white hover:bg-blue shadow-md transition"
      >
        신용도 확인 시작하기
      </Link>
    </div>
  );
};

export default HybridEvaluation;
