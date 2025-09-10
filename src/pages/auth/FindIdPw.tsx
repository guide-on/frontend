import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FindId from '@/components/auth/FindId';
import FindPassword from '@/components/auth/FindPw';
import { colors } from '@/styles/colors';

type TabKey = 'findId' | 'findPassword';

const FindAccount: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('findId');

  const goBack = () => navigate('/auth/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 px-4">
      {/* Background decoration */}
      <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 -left-5 w-16 h-16 bg-indigo-200/20 rounded-full blur-lg"></div>
      
      <div className="max-w-sm mx-auto w-full relative" style={{ maxWidth: 400 }}>
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 p-6 shadow-lg shadow-blue-500/10 mb-4 transition-all duration-300">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="p-2 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <svg
                className="w-6 h-6"
                style={{ color: colors.navy }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">계정 찾기</h1>
            </div>
            
            <div className="w-10" />
          </div>
        </div>

        {/* Tab Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 px-6 pb-6 pt-2 shadow-lg shadow-blue-500/10 transition-all duration-300">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 mb-5">
            <button
              onClick={() => setActiveTab('findId')}
              className={`flex-1 py-3 px-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'findId'
                  ? 'tab-active'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              아이디 찾기
            </button>
            <button
              onClick={() => setActiveTab('findPassword')}
              className={`flex-1 py-3 px-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'findPassword'
                  ? 'tab-active'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              비밀번호 찾기
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'findId' && <FindId />}
          {activeTab === 'findPassword' && <FindPassword />}

          {/* Back to Login Link */}
          <div className="mt-5 text-center border-t border-slate-200 pt-5">
            <p className="text-slate-600 text-sm">
              계정을 기억하셨나요?
              <Link
                to="/auth/login"
                className="text-btn font-semibold transition-colors hover:opacity-90"
              >
                {' '}
                로그인
              </Link>
              으로 돌아가기
            </p>
          </div>
        </div>
      </div>

      {/* SFC <style scoped> 대체용 보조 스타일 */}
      <style>{`
        .text-btn { color: ${colors.navy}; }
        .tab-active { color: ${colors.navy}; border-bottom: 2px solid ${colors.navy}; }
      `}</style>
    </div>
  );
};

export default FindAccount;
