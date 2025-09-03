import { useLocation } from 'react-router-dom';
import { FaRegBuilding } from 'react-icons/fa';

const pageNames: { [key: string]: string } = {
  '/': '홈',
  '/guide': '대출가이드',
  '/support': '공공지원금',
  '/community': '커뮤니티',
  '/mypage': '마이페이지',
};

const Header = () => {
  const location = useLocation();
  const pageName = pageNames[location.pathname] || '';
  return (
    <header className="w-full py-6 px-4">
      <div className="flex items-center w-full relative">
        <FaRegBuilding size={32} className="absolute left-0" />
        <span className="text-xl font-bold mx-auto">{pageName}</span>
      </div>
    </header>
  );
};

export default Header;
