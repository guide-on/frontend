import React, { useState } from 'react';
import { FaCog } from 'react-icons/fa';
import { Bookmark, Lightbulb, Gauge } from 'lucide-react';
import { MdEdit, MdCheckCircle } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

const MyPage: React.FC = () => {
  const [tab, setTab] = useState<'scrap' | 'comment'>('scrap');
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-white-50 flex flex-col pb-8">
      {/* 상단 헤더 */}
      <header className="relative bg-white pt-4 pb-6 px-0 border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-center relative">
          <button className="absolute right-4 top-1 text-gray-400 hover:text-gray-600">
            <FaCog size={22} />
          </button>
        </div>
        <div className="flex flex-row items-center gap-4 mt-6 px-8">
          <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center text-3xl">
            <span className="text-2xl">😊</span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-lg font-bold text-gray-900">홍길동님</span>
            <span className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              123-45-67890
              <MdCheckCircle className="text-green-500 ml-1" size={18} />
            </span>
          </div>
        </div>
        {/* 탭*/}
        <div className="flex mt-6 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 mx-4">
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <Gauge className="text-blue-500 mb-1" size={26} />
            <div className="text-lg font-bold text-gray-900">4</div>
            <div className="text-xs text-gray-500 mt-1">시뮬레이션</div>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <Bookmark
              className="mb-1"
              size={26}
              fill="#ec4899"
              color="#ec4899"
            />
            <div className="text-lg font-bold text-gray-900">1</div>
            <div className="text-xs text-gray-500 mt-1">지원금</div>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <Lightbulb
              className="mb-1"
              size={26}
              fill="#facc15"
              color="#facc15"
            />
            <div className="text-lg font-bold text-gray-900">3</div>
            <div className="text-xs text-gray-500 mt-1">마케팅 팁</div>
          </div>
        </div>
      </header>
      {/* 이용 안내/기타 섹션 */}
      <div className="flex-1 px-0 py-0 mt-2">
        <div className="px-4">
          <div className="py-2">
            <div className="text-lg font-bold text-gray-900 mb-4">내 활동</div>
            <ul className="bg-white">
              <li className="py-4 px-2 text-gray-800 font-medium text-base cursor-pointer hover:bg-gray-50 transition">
                내가 쓴 글
              </li>
              <li className="py-4 px-2 text-gray-800 font-medium text-base cursor-pointer hover:bg-gray-50 transition">
                내가 쓴 댓글
              </li>
              <li className="py-4 px-2 text-gray-800 font-medium text-base cursor-pointer hover:bg-gray-50 transition">
                내가 한 좋아요
              </li>
            </ul>
          </div>

          <div className="py-2">
            <div className="text-lg font-bold text-gray-900 mb-4">계정</div>
            <ul className="bg-white">
              <li
                className="py-4 px-2 text-red-600 font-medium text-base cursor-pointer hover:bg-gray-50 transition"
                onClick={handleLogout}
              >
                로그아웃
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatBoxProps {
  label: string;
  value: number;
}
const StatBox = ({ label, value }: StatBoxProps) => (
  <div className="flex-1 flex flex-col items-center justify-center py-4">
    <div className="text-lg font-bold text-gray-900">{value}</div>
    <div className="text-xs text-gray-400 mt-1">{label}</div>
  </div>
);

export default MyPage;
