import { colors } from '../../styles/colors';
import { Link } from 'react-router-dom';

const HybridEvaluation = () => {
  return (
    <div className="px-4 py-6 space-y-5">
      <h1 className="text-center text-2xl font-bold">하이브리드 신용평가</h1>

      <section
        className="rounded-xl p-5 shadow-sm"
        style={{ backgroundColor: colors.paleBlue, color: '#111', border: `1px solid ${colors.lightBlue}` }}
      >
        <p className="font-semibold mb-1">안녕하세요 ㅇㅇㅇ님</p>
        <p className="text-sm" style={{ color: '#4B5563' }}>
          신용도 확인에 앞서 다음은 평가 요소 및 활용 비중입니다.
        </p>
      </section>

      <section
        className="rounded-md flex items-center justify-center w-full shadow-inner"
        style={{ backgroundColor: colors.gray, border: `1px solid #9CA3AF`, height: 280 }}
      >
        <span className="text-sm" style={{ color: '#374151' }}>
          하이브리드 신용평가 기반의 평가 표
        </span>
      </section>

      <Link
        to="/hybrid-evaluation/start"
        className="w-full inline-block text-center py-4 rounded-md font-semibold mt-2"
        style={{ backgroundColor: colors.navy, color: colors.white }}
      >
        신용도 확인 시작하기
      </Link>
    </div>
  );
};

export default HybridEvaluation;
