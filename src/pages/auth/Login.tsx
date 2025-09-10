// src/pages/auth/Login.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors } from '@/styles/colors';

type Member = {
  username: string;
  password: string;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const loginAction = useAuthStore((s) => s.login);

  // 폼 데이터
  const [member, setMember] = useState<Member>({ username: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const disableSubmit = useMemo(
    () => !(member.username && member.password),
    [member.username, member.password],
  );

  const onChange =
    (key: keyof Member) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setMember((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (disableSubmit || isLoggingIn) return;

      setIsLoggingIn(true);
      setError('');
      try {
        await loginAction(member);
        navigate('/'); // { name: 'home' } 대응
      } catch (e: any) {
        // 서버가 문자열/JSON/텍스트 등 다양하게 줄 수 있어 방어적으로 처리
        const msg =
          e?.response?.data ?? e?.message ?? '로그인 중 오류가 발생했습니다';
        setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        console.error(e);
      } finally {
        setIsLoggingIn(false);
      }
    },
    [disableSubmit, isLoggingIn, loginAction, member, navigate],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-6 px-4">
      <div className="max-w-sm mx-auto w-full relative">
        {/* Background decoration */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"></div>

        {/* Logo section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4 border border-blue-100 overflow-hidden">
            <img
              src="/images/logo.png"
              alt="logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">환영합니다!</h1>
          <p className="text-gray-600 text-sm">
            계정에 로그인하여 서비스를 이용하세요
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 p-8 shadow-lg shadow-blue-500/10 transition-all duration-300">
          <form onSubmit={onSubmit}>
            <div className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  이메일
                </label>
                <div className="relative">
                  <input
                    value={member.username}
                    onChange={onChange('username')}
                    type="email"
                    placeholder="이메일을 입력하세요"
                    required
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400"
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.navy;
                      e.target.style.boxShadow = `0 0 0 4px ${colors.navy}26`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    value={member.password}
                    onChange={onChange('password')}
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    required
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400"
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.navy;
                      e.target.style.boxShadow = `0 0 0 4px ${colors.navy}26`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            </div>

            {!!error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="text-red-600 text-sm font-medium">{error}</div>
              </div>
            )}

            {/* Find ID/PW Link */}
            <div className="text-right mt-4">
              <Link
                to="/auth/find"
                className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
              >
                아이디/비밀번호 찾기
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={disableSubmit}
              className="w-full mt-6 py-3 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 group"
              style={{
                backgroundColor: disableSubmit ? '#9ca3af' : colors.navy,
                boxShadow: !disableSubmit
                  ? `0 10px 25px ${colors.navy}25`
                  : 'none',
              }}
            >
              {isLoggingIn && (
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              )}
              <span className="group-hover:scale-105 transition-transform">
                {isLoggingIn ? '로그인 중...' : '로그인'}
              </span>
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-8 text-center">
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-4 text-xs text-gray-500 bg-white">또는</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span>아직 계정이 없으신가요?</span>
              <span className="text-blue-600 font-bold text-lg">회원가입</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
