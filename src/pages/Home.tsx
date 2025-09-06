import { Link } from 'react-router-dom';
import { colors } from '../styles/colors';

const Home = () => (
  <div className="px-4 py-6">
    <div className="flex flex-col items-center justify-center h-96 space-y-6">
      <div className="text-2xl font-bold">홈 페이지</div>
      <Link
        to="/hybrid-evaluation"
        className="w-full text-center py-4 rounded-md font-semibold"
        style={{ backgroundColor: colors.navy, color: colors.white }}
      >
        하이브리드 신용평가로 이동
      </Link>
    </div>
  </div>
);

export default Home;
