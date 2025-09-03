import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    if (confirm('정말 로그아웃하시겠습니까?')) {
      try {
        await logout();
        navigate('/auth/login');
      } catch (error) {
        console.error('로그아웃 실패:', error);
        alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-96 text-2xl font-bold">
      마이페이지 더미 페이지
      <button
        className="flex p-2 bg-red-600 rounded-md items-center justify-center gap-2 text-sm text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
        onClick={handleLogout}
      >
        <i className="fas fa-sign-out-alt"></i>
        로그아웃
      </button>
    </div>
  );
};

export default MyPage;
