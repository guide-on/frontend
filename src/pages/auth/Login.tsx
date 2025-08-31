// src/pages/auth/Login.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import kakaoLoginLarge from '@/assets/kakao_login_large_wide.png';

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

  const kakaoLogin = useCallback(() => {
    const base =
      (import.meta as any)?.env?.VITE_API_BASE_URL ||
      process.env.REACT_APP_API_BASE_URL ||
      'http://localhost:8080';
    window.location.href = `${base}/oauth2/authorization/kakao`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4">
      <div className="max-w-sm mx-auto w-full" style={{ maxWidth: 343 }}>
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-slate-800 text-center text-2xl font-bold">
            로그인
          </h1>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ps-1">
                  이메일
                </label>
                <input
                  value={member.username}
                  onChange={onChange('username')}
                  type="email"
                  placeholder="이메일을 입력하세요"
                  required
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-slate-700 text-md"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ps-1">
                  비밀번호
                </label>
                <input
                  value={member.password}
                  onChange={onChange('password')}
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-slate-700 text-md"
                />
              </div>
            </div>

            {!!error && (
              <div className="text-red-600 text-sm mt-1 ms-1">{error}</div>
            )}

            {/* Find ID/PW Link */}
            <div className="text-right my-1.5">
              <Link
                to="/auth/find"
                className="text-btn text-sm font-medium transition-colors"
              >
                아이디/비밀번호 찾기
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={disableSubmit}
              className="login-button w-full h-11 bg-gradient-to-r text-white rounded-md font-bold text-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoggingIn && (
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              )}
              {isLoggingIn ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-xs text-slate-500 bg-white">또는</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <div>
              <img
                src={kakaoLoginLarge}
                alt="카카오 로그인"
                onClick={kakaoLogin}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Signup Link */}
          <div className="mt-5 text-center">
            <p className="text-slate-600 text-sm">
              아직 계정이 없으신가요?
              <Link
                to="/auth/signup"
                className="text-btn font-semibold transition-colors"
              >
                {' '}
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* SFC <style scoped> 대응용 보조 스타일 */}
      <style>{`
        .text-color,
        .text-btn { color: #63b6ae; }
        .text-btn:hover { color: #4da99b; }
        .login-button { background:  var(--point-color); border: none; touch-action: manipulation; }
        .login-button:hover { background:  var(--point-color-2); }
        .login-button:disabled { background:  var(--logo-color); }
      `}</style>
    </div>
  );
};

export default Login;
