import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaRegBuilding } from 'react-icons/fa';
import { Search } from 'lucide-react';

const routeTitle = (path: string) => {
  // 정확 매칭
  if (path === '/') return '홈';
  if (path === '/guide') return '대출가이드';
  if (path === '/support') return '공공지원금';
  if (path === '/mypage') return '마이페이지';
  if (path === '/community') return '커뮤니티';

  // 커뮤니티 하위
  if (path.startsWith('/community/cases')) return '동일업종 승인 사례';
  if (path.startsWith('/community/freeboard')) return '자유게시판';
  if (path.startsWith('/community/search/results')) return '검색 결과';
  if (path.startsWith('/community/search')) return '검색';
  if (path.startsWith('/community/posts/new')) return '글 작성';
  if (path.match(/^\/community\/posts\/\d+\/edit/)) return '글 수정';
  if (path.match(/^\/community\/posts\/\d+/)) return '게시글';

  // 기본값
  if (path.startsWith('/community')) return '커뮤니티';

  // 시뮬레이션 결과
  if (path === '/simulation') return '시뮬레이션 내역';
  if (path.match(/^\/simulation\/\d+/)) return '시뮬레이션 내역';

  return '';
};

const Header = () => {
  const location = useLocation();
  const nav = useNavigate();
  const path = location.pathname;
  const title = routeTitle(path);
  const isCommunity = path.startsWith('/community');

  return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="h-14 max-w-[375px] mx-auto px-4 flex items-center relative">
          <Link to="/" className="absolute left-4">
            <FaRegBuilding size={28} />
          </Link>

          <span className="text-lg font-bold mx-auto">{title}</span>

          {/* 커뮤니티 영역에서는 검색 아이콘 노출 */}
          <div className="absolute right-4">
            {isCommunity && (
                <button
                    aria-label="search"
                    onClick={()=>nav('/community/search')}
                    className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Search className="w-5 h-5" />
                </button>
            )}
          </div>
        </div>
      </header>
  );
};

export default Header;
