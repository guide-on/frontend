import React, { useCallback, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors } from '@/styles/colors';

type Member = { username: string; password: string };

const Login: React.FC = () => {
  const navigate = useNavigate();
  const loc = useLocation();
  const loginAction = useAuthStore((s) => s.login);

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
          // redirectTo 존재 시 복귀, 없으면 홈
          const to = (loc.state as any)?.redirectTo ?? '/';
          navigate(to);
        } catch (e: any) {
          const msg = e?.response?.data ?? e?.message ?? '로그인 중 오류가 발생했습니다';
          setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
          console.error(e);
        } finally {
          setIsLoggingIn(false);
        }
      },
      [disableSubmit, isLoggingIn, loginAction, member, navigate, loc.state],
  );

  return (
      <div className="min-h-screen flex items-center justify-center py-10 px-5 bg-gradient-to-b from-[#F6F8FC] to-[#F3F6FF]">
        <div className="relative w-full max-w-[420px]">
          {/* ← 아주 작고 연한 회색 뒤로가기 : 무조건 홈으로 이동 */}
          <button
              type="button"
              aria-label="뒤로가기"
              onClick={() => navigate('/')}
              className="absolute -top-2 left-1 text-[12px] text-gray-400 hover:text-gray-500"
          >
            ← 뒤로
          </button>

          {/* 상단 인사/로고 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-sm mb-4 border border-[rgba(37,67,123,0.08)] overflow-hidden">
              <img src="/images/logo.png" alt="logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-[26px] font-extrabold text-[#1F2937] tracking-tight">환영합니다 👋</h1>
            <p className="mt-1 text-[14px] text-[#4B5563]">계정에 로그인하여 서비스를 이용하세요</p>
          </div>

          {/* 카드 */}
          <div className="bg-white/90 backdrop-blur-[2px] rounded-3xl border border-white shadow-[0_10px_24px_rgba(37,67,123,0.06)] px-6 py-7">
            <form onSubmit={onSubmit}>
              <div className="space-y-5">
                {/* 이메일 */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-1.5">이메일</label>
                  <input
                      value={member.username}
                      onChange={onChange('username')}
                      type="email"
                      placeholder="이메일을 입력하세요"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[color:var(--brand-primary)] focus:ring-4 focus:ring-[rgba(37,67,123,0.15)] transition"
                  />
                </div>

                {/* 비밀번호 */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-1.5">비밀번호</label>
                  <input
                      value={member.password}
                      onChange={onChange('password')}
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[color:var(--brand-primary)] focus:ring-4 focus:ring-[rgba(37,67,123,0.15)] transition"
                  />
                </div>
              </div>

              {!!error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
              )}

              {/* 로그인 버튼 */}
              <button
                  type="submit"
                  disabled={disableSubmit}
                  className="w-full mt-5 py-3 rounded-xl font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: disableSubmit ? '#9CA3AF' : colors.navy,
                    boxShadow: disableSubmit ? 'none' : `0 12px 28px ${colors.navy}22`,
                  }}
              >
                {isLoggingIn ? '로그인 중…' : '로그인'}
              </button>
            </form>

            {/* 하단 구분선 + 찾기/가입 섹션 */}
            <div className="mt-8">
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-[12px] text-gray-400">또는</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[13px] text-gray-500">혹시 계정을 잊어버리셨나요?</span>
                <Link to="/auth/find" className="text-[13px] text-gray-500">
                  아이디/비밀번호 찾기 <span className="text-blue-600">›</span>
                </Link>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[13px] text-gray-500">처음 오셨나요?</span>
                <Link to="/auth/signup" className="text-[13px] text-gray-500">
                  회원가입 하러가기 <span className="text-blue-600">›</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Login;
