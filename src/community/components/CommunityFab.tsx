import { useLocation, useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';

export default function CommunityFab() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === '/community' || pathname === '/community/';

  if (!isHome) return null;

  return (
    <button
      aria-label="글 작성"
      onClick={() => nav('/community/posts/new')}
      style={{
        position: 'absolute',
        right: '28px', // 마이페이지 아이콘 중앙 위
        bottom: '82px',
        zIndex: 9999,
        width: '56px',
        height: '56px',
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        background: '#25437B',
        boxShadow: '0 10px 22px rgba(0,0,0,0.18)',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <Pencil size={20} />
    </button>
  );
}
