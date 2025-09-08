import { colors } from '../../styles/colors';
import { Link, useLocation } from 'react-router-dom';
import { FaPen, FaFolderOpen, FaHome, FaComments, FaUser } from 'react-icons/fa';

const navItems = [
    { to: '/guide',     label: '대출가이드', icon: <FaPen size={22} /> },
    { to: '/support',   label: '공공지원금', icon: <FaFolderOpen size={22} /> },
    { to: '/',          label: '홈',         icon: <FaHome size={22} /> },
    { to: '/community', label: '커뮤니티',   icon: <FaComments size={22} /> },
    { to: '/mypage',    label: '마이페이지', icon: <FaUser size={22} /> },
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
            className="fixed bottom-0 left-0 right-0 z-50 flex"
            style={{ borderTop: `1px solid ${colors.gray}`, backgroundColor: colors.gray, height: 60 }}
        >
            {navItems.map((item) => {
                const active = isActive(item.to);
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className="flex-1 flex flex-col items-center justify-center font-bold"
                        style={{ color: active ? colors.navy : '#222' }}
                        aria-current={active ? 'page' : undefined}
                    >
                        {item.icon}
                        <span className="text-[11px] leading-4">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default Navbar;
