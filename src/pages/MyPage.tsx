import React, { useState } from 'react';
import { FaCog } from 'react-icons/fa';
import { Bookmark, Lightbulb, Search, Sprout } from 'lucide-react';
import { MdEdit, MdCheckCircle } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors } from '@/styles/colors';

const MyPage: React.FC = () => {
  const [tab, setTab] = useState<'scrap' | 'comment'>('scrap');
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div
      className="min-h-screen flex flex-col pb-8"
      style={{ background: colors.bgSoft }}
    >
      {/* 상단 헤더 */}
      <header className="relative bg-white/80 backdrop-blur-sm pt-6 pb-8 px-0 border-b border-white/50 shadow-sm">
        <div className="flex items-center justify-center relative">
          <button className="absolute right-4 top-1 text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50">
            <FaCog size={18} />
          </button>
        </div>
        <div className="flex flex-row items-center gap-4 mt-6 px-8">
          <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden border-4 border-blue-100">
            <img
              src="/images/logo.png"
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xl font-bold text-gray-900 mb-1">
              {user.name || '사용자'}님
            </span>
            <span className="text-sm text-gray-600 flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
              <span>123-45-67890</span>
              <MdCheckCircle className="text-green-500" size={16} />
              <span className="text-xs font-medium text-green-600">
                인증완료
              </span>
            </span>
          </div>
        </div>
        {/* 통계 카드 */}
        <div className="flex mt-6 mx-4 gap-2">
          <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/50 hover:shadow-md transition-all">
            <div className="flex flex-col items-center">
              <Search className="text-gray-700 mb-1" size={18} strokeWidth={2.5} />
              <div className="text-lg font-bold text-gray-900">4</div>
              <div className="text-xs text-gray-600 font-medium">
                시뮬레이션
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/50 hover:shadow-md transition-all">
            <div className="flex flex-col items-center">
              <Bookmark
                className="text-pink-600 mb-1"
                size={18}
                fill="currentColor"
              />
              <div className="text-lg font-bold text-gray-900">1</div>
              <div className="text-xs text-gray-600 font-medium">지원금</div>
            </div>
          </div>
          <div
            className="flex-1 bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/50 hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate('/hybrid-evaluation')}
          >
            <div className="flex flex-col items-center">
              <Sprout
                className="text-green-600 mb-1"
                size={18}
                fill="currentColor"
              />
              <div className="text-lg font-bold text-gray-900">1</div>
              <div className="text-xs text-gray-600 font-medium">신용평가</div>
            </div>
          </div>
        </div>
      </header>
      {/* 이용 안내/기타 섹션 */}
      <div className="flex-1 px-0 py-0 mt-4">
        <div className="px-4">
          <div className="py-2">
            <div className="text-base font-bold text-gray-900 mb-3">내 활동</div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 overflow-hidden">
              <div className="py-3 px-4 text-gray-800 font-medium text-sm cursor-pointer hover:bg-blue-50 transition-all duration-200 flex items-center gap-3">
                <span>내가 쓴 글</span>
              </div>
              <div className="py-3 px-4 text-gray-800 font-medium text-sm cursor-pointer hover:bg-blue-50 transition-all duration-200 flex items-center gap-3">
                <span>내가 쓴 댓글</span>
              </div>
              <div className="py-3 px-4 text-gray-800 font-medium text-sm cursor-pointer hover:bg-blue-50 transition-all duration-200 flex items-center gap-3">
                <span>내가 한 좋아요</span>
              </div>
              <div className="py-3 px-4 text-gray-800 font-medium text-sm cursor-pointer hover:bg-blue-50 transition-all duration-200 flex items-center gap-3">
                <span>내 마케팅 팁</span>
              </div>
            </div>
          </div>

          <div className="py-2 mt-4">
            <div className="text-base font-bold text-gray-900 mb-3">계정</div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 overflow-hidden">
              <div
                className="py-3 px-4 text-red-600 font-medium text-sm cursor-pointer hover:bg-red-50 transition-all duration-200 flex items-center gap-3"
                onClick={handleLogout}
              >
                <span>로그아웃</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
