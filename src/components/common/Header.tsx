import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft } from 'lucide-react';

// 경로 → 헤더 타이틀 매핑(정확/프리픽스/정규식 혼합)
const routeTitle = (path: string): string => {
  // 1) 정확 매칭
  if (path === '/') return '홈';
  if (path === '/guide') return '대출가이드';
  if (path === '/support') return '공공지원금';
  if (path === '/mypage') return '마이페이지';
  if (path === '/community') return '커뮤니티';
  if (path === '/simulation') return '시뮬레이션 내역';
  if (path === '/hybrid-evaluation' || path === '/hybrid-evaluation/start')
    return '하이브리드 신용평가';

  // 2) 가이드 하위
  if (path.startsWith('/guide')) return '대출가이드';

  // 3) 커뮤니티 하위
  if (path.startsWith('/community/cases')) return '동일업종 승인 사례';
  if (path.startsWith('/community/freeboard')) return '자유게시판';
  if (path.startsWith('/community/search/results')) return '검색 결과';
  if (path.startsWith('/community/search')) return '검색';
  if (path.startsWith('/community/posts/new')) return '글 작성';
  if (/^\/community\/posts\/\d+\/edit/.test(path)) return '글 수정';
  if (/^\/community\/posts\/\d+/.test(path)) return '게시글';
  if (path.startsWith('/community')) return '커뮤니티';

  // 4) 시뮬레이션 상세
  if (/^\/simulation\/\d+/.test(path)) return '시뮬레이션 내역';

  return '';
};

const Header = () => {
  const location = useLocation();
  const nav = useNavigate();
  const path = location.pathname;
  const title = routeTitle(path);
  const isCommunity = path.startsWith('/community');
  
  // 메인 네비게이션 페이지들 (뒤로가기 버튼을 숨길 페이지들)
  const mainNavPages = ['/', '/guide', '/support', '/community', '/mypage'];
  const isMainNavPage = mainNavPages.includes(path);

  return (
    <header className="fixed top-0 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md shadow-sm w-full max-w-[480px]">
      <div className="h-14 px-6 flex items-center relative border-b border-gray-100/50">
        {!isMainNavPage && (
          <button
            className="absolute left-6 text-gray-500 hover:text-blue-600 p-2 transition-all duration-300 hover:scale-110 hover:bg-blue-50 rounded-full"
            aria-label="뒤로가기"
            onClick={() => nav(-1)}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <div className={`flex-1 ${!isMainNavPage ? 'ml-12' : ''}`}>
          <h1 className="text-lg font-bold text-gray-700">{title}</h1>
        </div>

        {/* 커뮤니티 영역에서는 검색 아이콘 노출 */}
        <div className="absolute right-6">
          {isCommunity && (
            <button
              aria-label="search"
              onClick={() => nav('/community/search')}
              className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-110"
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
