import { colors } from '../../styles/colors';
import { Link, useLocation } from 'react-router-dom';
import {
  FaPen,
  FaFolderOpen,
  FaHome,
  FaComments,
  FaUser,
} from 'react-icons/fa';

const navItems = [
  { to: '/guide', label: '대출가이드', icon: <FaPen size={24} /> },
  { to: '/support', label: '공공지원금', icon: <FaFolderOpen size={24} /> },
  { to: '/', label: '홈', icon: <FaHome size={24} /> },
  { to: '/community', label: '커뮤니티', icon: <FaComments size={24} /> },
  { to: '/mypage', label: '마이페이지', icon: <FaUser size={24} /> },
];

const Navbar = () => {
  const location = useLocation();
  return (
    <nav
      className="absolute bottom-0 w-full flex z-50"
      style={{
        borderTop: `1px solid ${colors.gray}`,
        backgroundColor: colors.gray,
      }}
    >
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex-1 py-3 flex flex-col items-center font-bold`}
          style={{
            color: location.pathname === item.to ? colors.navy : '#222',
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Navbar;
