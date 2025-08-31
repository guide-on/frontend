import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FindId from '@/components/auth/FindId';
import FindPassword from '@/components/auth/FindPw';

type TabKey = 'findId' | 'findPassword';

const FindAccount: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('findId');

  const goBack = () => navigate('/auth/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 px-4">
      <div className="max-w-sm mx-auto w-full" style={{ maxWidth: 400 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={goBack}
            className="p-2 hover:bg-white/60 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-slate-600"
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
          <h1 className="text-slate-800 text-2xl font-bold">계정 찾기</h1>
          <div className="w-10" />
        </div>

        {/* Tab Container */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 px-6 pb-6 pt-2 shadow-xl hover:shadow-2xl transition-all duration-300">
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
                className="text-btn font-semibold transition-colors"
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
        .text-color, .text-btn { color: #63b6ae; }
        .text-btn:hover { color: #4da99b; }
        .tab-active { color: #63b6ae; border-bottom: 2px solid #63b6ae; }
      `}</style>
    </div>
  );
};

export default FindAccount;
