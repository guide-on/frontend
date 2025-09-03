import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import memberApi from '@/api/memberApi';
import PhoneVerification from '@/components/verification/PhoneVerification';

type FindUserPayload = {
  name: string;
  birth: string; // yyyy-MM-dd
  phone: string;
};

const FindId: React.FC = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState<FindUserPayload>({
    name: '',
    birth: '',
    phone: '',
  });

  const [userId, setUserId] = useState<string>('');
  const [joinDate, setJoinDate] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);

  const findId = useCallback(async () => {
    setSearching(true);
    setMessage('');
    try {
      const result = await memberApi.findUserId(userInfo);
      // 서버 스키마에 맞게 조정
      setUserId(result.email);
      setJoinDate(result.regDate);
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ?? '조회 중 오류가 발생했습니다.',
      );
    } finally {
      setSearching(false);
    }
  }, [userInfo]);

  const goToLogin = useCallback(() => {
    navigate('/auth/login');
  }, [navigate]);

  const disabled =
    !userInfo.name || !userInfo.birth || !phoneVerified || searching;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">아이디 찾기</h2>
        <p className="text-slate-600 text-sm">
          회원가입 시 등록한 정보를 기반으로 아이디를 <br />
          찾을 수 있습니다
        </p>
      </div>

      {!userId && (
        <div className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="flex text-sm font-semibold text-slate-700 mb-1.5 ps-1">
              이름
            </label>
            <input
              value={userInfo.name}
              onChange={(e) =>
                setUserInfo((s) => ({ ...s, name: e.target.value }))
              }
              type="text"
              placeholder="이름을 입력하세요"
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="flex text-sm font-semibold text-slate-700 mb-1.5 ps-1">
              생년월일
            </label>
            <input
              value={userInfo.birth}
              onChange={(e) =>
                setUserInfo((s) => ({ ...s, birth: e.target.value }))
              }
              type="date"
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* 전화번호 인증 */}
          <PhoneVerification
            value={userInfo.phone}
            onChange={(phone) => setUserInfo((s) => ({ ...s, phone }))}
            onVerified={(ok) => setPhoneVerified(ok)}
          />

          {message && <p className="text-red-600">{message}</p>}

          {/* 아이디 찾기 버튼 */}
          <button
            onClick={findId}
            disabled={disabled}
            className="login-button w-full text-white text-md h-11 rounded-md font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {searching ? '조회 중...' : '아이디 찾기'}
          </button>
        </div>
      )}

      {userId && (
        <div className="text-center space-y-6">
          <div className="bg-slate-50 rounded-lg p-5 mb-6">
            <p
              className="whitespace-pre-line text-slate-700 font-medium mb-4"
              style={{ fontSize: '0.88rem' }}
            >
              입력하신 개인 정보와 일치하는 아이디입니다
            </p>

            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-slate-800">
                  {userId}
                </span>
              </div>
              <p className="text-sm text-slate-500">가입일 : {joinDate}</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={goToLogin}
              className="login-button block w-full text-white h-12 rounded-md font-bold text-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              로그인
            </button>
          </div>
        </div>
      )}

      {/* 보조 스타일: Vue scoped 대체 */}
      <style>{`
        .login-button { background: var(--point-color); border: none; touch-action: manipulation; }
        .login-button:hover { background: var(--point-color-2); }
        .login-button:disabled { background: var(--logo-color); }
      `}</style>
    </div>
  );
};

export default FindId;
