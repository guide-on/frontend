import { colors } from '../../styles/colors';
import { Link, useLocation } from 'react-router-dom';
import { PenTool, FolderOpen, Home, MessageCircle, User } from 'lucide-react';

const navItems = [
  { to: '/guide/survey', label: '대출가이드', icon: PenTool },
  { to: '/support', label: '공공지원금', icon: FolderOpen },
  { to: '/', label: '홈', icon: Home },
  { to: '/community', label: '커뮤니티', icon: MessageCircle },
  { to: '/mypage', label: '마이페이지', icon: User },
];

const Navbar = () => {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (to: string) => {
    if (to === '/') return path === '/';
    return path.startsWith(to); // 하위 경로 포함
  };

  return (
    <nav
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-[480px] flex bg-white/80 backdrop-blur-md shadow-lg rounded-t-3xl"
      style={{
        borderTop: `1px solid ${colors.gray}`,
        height: 70,
      }}
    >
      {navItems.map((item) => {
        const active = isActive(item.to);
        const IconComponent = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex-1 flex flex-col items-center justify-center font-medium relative transition-all duration-300 ease-in-out transform ${
              active ? 'scale-110' : 'scale-100 hover:scale-105'
            }`}
            style={{
              color: active ? colors.navy : '#666',
              paddingTop: active ? '8px' : '12px',
            }}
            aria-current={active ? 'page' : undefined}
          >
            <div
              className={`relative transition-all duration-300 ${active ? 'mb-1' : 'mb-2'}`}
            >
              <IconComponent
                size={active ? 24 : 20}
                className={`transition-all duration-300 ${active ? 'drop-shadow-sm' : ''}`}
                strokeWidth={active ? 2.5 : 2}
                fill={active ? colors.navy : 'none'}
              />
            </div>
            <span
              className={`text-[10px] leading-3 transition-all duration-300 ${
                active ? 'font-semibold opacity-100' : 'font-normal opacity-70'
              }`}
            >
              {item.label}
            </span>
            {active && (
              <div
                className="absolute -bottom-1 w-12 h-1 rounded-full transition-all duration-300"
                style={{ backgroundColor: colors.navy }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;
