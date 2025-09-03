import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import memberApi from '@/api/memberApi';
import verificationApi from '@/api/verificationApi';
import PasswordField from '@/components/auth/PasswordField';
// import SuccessModal from '@/components/common/SuccessModal';
import { useNavigate } from 'react-router-dom';

type Step = 'email' | 'method' | 'verification' | 'reset';
type Method = 'email' | 'phone';

type ResetForm = {
  email: string;
  newPassword: string;
  emailVerified: boolean; // 백엔드 스펙 유지
};

const displayTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const FindPassword: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [method, setMethod] = useState<Method>('email');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<ResetForm>({
    email: '',
    newPassword: '',
    emailVerified: false,
  });
  const [passwordValidated, setPasswordValidated] = useState(false);

  const [loading, setLoading] = useState({
    emailCheck: false,
    send: false,
    verify: false,
    reset: false,
  });

  const messageClass = useMemo(
    () =>
      message.includes('성공') || message.includes('완료')
        ? 'text-green-600'
        : 'text-red-600',
    [message],
  );

  // 이메일 확인
  const checkEmail = useCallback(async () => {
    if (!formData.email) return;
    setLoading((s) => ({ ...s, emailCheck: true }));
    setMessage('');
    try {
      const exists = await memberApi.checkUsername(formData.email);
      // 서버 반환이 boolean 또는 { exists: boolean }일 수 있음
      const ok =
        typeof exists === 'boolean'
          ? exists
          : !!(exists as any).exists || !!exists;
      if (ok) {
        setStep('method');
      } else {
        setMessage('사용자를 찾을 수 없습니다.');
      }
    } catch {
      setMessage('오류 발생');
    } finally {
      setLoading((s) => ({ ...s, emailCheck: false }));
    }
  }, [formData.email]);

  // 인증 코드 전송
  const sendCode = useCallback(async () => {
    setLoading((s) => ({ ...s, send: true }));
    try {
      const isEmail = method === 'email';
      const result = await verificationApi.send(formData.email, isEmail);
      if (result.success) {
        setStep('verification');
        setCode('');
        setTimer(isEmail ? 300 : 180);
        setResendTimer(60);
        setMessage(result.message);
      } else {
        setMessage(result.message);
      }
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ?? '전송 중 오류가 발생했습니다',
      );
    } finally {
      setLoading((s) => ({ ...s, send: false }));
    }
  }, [formData.email, method]);

  // 인증 코드 검증
  const verifyCode = useCallback(async () => {
    if (code.length !== 6) return;
    setLoading((s) => ({ ...s, verify: true }));
    try {
      const result = await verificationApi.verifyByEmail(
        formData.email,
        code,
        method === 'email',
      );
      if (result.success) {
        setStep('reset');
        setMessage(result.message);
      } else {
        setMessage('인증번호가 일치하지 않습니다');
      }
    } catch {
      setMessage('오류 발생');
    } finally {
      setLoading((s) => ({ ...s, verify: false }));
    }
  }, [code, formData.email, method]);

  // 비밀번호 변경
  const resetPassword = useCallback(async () => {
    if (!formData.newPassword || !passwordValidated) {
      setMessage('비밀번호 확인 필요');
      return;
    }
    const payload: ResetForm = {
      ...formData,
      emailVerified: method === 'email', // 이메일 인증시 true, SMS면 false
    };

    setLoading((s) => ({ ...s, reset: true }));
    try {
      const result = await memberApi.resetPassword(payload as any);
      setMessage(
        typeof result === 'string' ? result : '비밀번호가 변경되었습니다.',
      );
      setShowSuccessModal(true);
    } catch {
      setMessage('비밀번호 변경 중 오류');
    } finally {
      setLoading((s) => ({ ...s, reset: false }));
    }
  }, [formData, method, passwordValidated]);

  // 타이머 인터벌
  const intervalRef = useRef<number | null>(null);
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (timer === 0 && step === 'verification') {
      setMessage('인증번호가 만료되었습니다');
    }
  }, [timer, step]);

  const handleSuccessConfirm = useCallback(() => {
    setShowSuccessModal(false);
    navigate('/auth/login');
  }, [navigate]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          비밀번호 재설정
        </h2>
        <p className="text-slate-600 text-sm">
          이메일 확인 후 인증을 통해 비밀번호를 <br />
          재설정할 수 있습니다.
        </p>
      </div>

      {/* 이메일 입력 단계 */}
      {step === 'email' && (
        <div className="space-y-4">
          <div>
            <label className="flex text-sm font-semibold text-slate-700 mb-1.5 ps-1">
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((s) => ({ ...s, email: e.target.value }))
              }
              placeholder="이메일 입력"
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            {message && (
              <p className={`text-sm mt-1 ms-1 ${messageClass}`}>{message}</p>
            )}
          </div>
          <button
            onClick={checkEmail}
            disabled={loading.emailCheck || !formData.email}
            className="login-button w-full text-white text-md h-11 rounded-md font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading.emailCheck ? '확인 중...' : '이메일 확인'}
          </button>
        </div>
      )}

      {/* 인증 방법 선택 단계 */}
      {step === 'method' && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">
              ✅ 등록된 이메일입니다
            </p>
            <p className="text-sm text-green-600 mt-1">
              인증 방법을 선택해주세요
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-slate-700">인증 방법 선택</p>
            <div className="space-y-2">
              <label className="method-box">
                <input
                  type="radio"
                  value="email"
                  checked={method === 'email'}
                  onChange={() => setMethod('email')}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium">이메일 인증</div>
                </div>
              </label>
              <label className="method-box">
                <input
                  type="radio"
                  value="phone"
                  checked={method === 'phone'}
                  onChange={() => setMethod('phone')}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium">전화번호 인증</div>
                </div>
              </label>
            </div>
          </div>

          {message && <p className="ms-1 text-sm text-red-600">{message}</p>}

          <button
            onClick={sendCode}
            disabled={loading.send}
            className="login-button w-full text-white text-md py-2.5 rounded-md font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading.send
              ? '전송 중...'
              : `${method === 'email' ? '이메일' : '전화번호'}로 인증번호 받기`}
          </button>
        </div>
      )}

      {/* 인증번호 입력 단계 */}
      {step === 'verification' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            {message && (
              <span className={`ps-1 ${messageClass}`}>
                {message} ({displayTime(timer)})
              </span>
            )}
            <button
              type="button"
              onClick={sendCode}
              disabled={loading.send || resendTimer > 0}
              className="login-button text-white ml-auto px-2 py-1 rounded-md text-xs font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading.send
                ? '전송 중...'
                : resendTimer <= 0
                  ? '재전송'
                  : `재전송 ${displayTime(resendTimer)}`}
            </button>
          </div>

          <input
            type="text"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="인증번호 (6자리)"
            maxLength={6}
            className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />

          <button
            onClick={verifyCode}
            disabled={loading.verify || code.length !== 6}
            className="login-button w-full text-white text-md py-2.5 rounded-md font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading.verify ? '확인 중...' : '확인'}
          </button>
        </div>
      )}

      {/* 비밀번호 재설정 단계 */}
      {step === 'reset' && (
        <div className="space-y-6">
          <PasswordField
            value={formData.newPassword}
            onChange={(newPassword) =>
              setFormData((s) => ({ ...s, newPassword }))
            }
            onValidated={(ok) => setPasswordValidated(ok)}
          />
          <button
            onClick={resetPassword}
            disabled={
              loading.reset || !formData.newPassword || !passwordValidated
            }
            className="login-button block w-full text-white h-11 rounded-md font-bold text-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading.reset ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      )}

      {/* 보조 스타일: Vue scoped 대체 */}
      <style>{`
        .method-box { display:flex; align-items:center; gap:0.75rem; padding:0.75rem; border:2px solid #e2e8f0; border-radius:0.5rem; cursor:pointer; transition: all .2s; }
        .method-box:hover { border:2px solid #b3ebe4; }
        .login-button { background: var(--point-color); border:none; touch-action: manipulation; }
        .login-button:hover { background: var(--point-color-2); }
        .login-button:disabled { background: var(--logo-color); }
      `}</style>

      {/* 성공 모달 */}
      {/* {showSuccessModal && (
        <SuccessModal
          title="비밀번호 변경 완료"
          message="비밀번호가 성공적으로 변경되었습니다!"
          confirmText="로그인하기"
          onConfirm={handleSuccessConfirm}
          onClose={handleSuccessConfirm}
        />
      )} */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              비밀번호 변경 완료
            </h3>
            <p className="text-slate-600 mb-6">
              비밀번호가 성공적으로 변경되었습니다!
            </p>
            <button
              onClick={handleSuccessConfirm}
              className="login-button w-full h-11 rounded-md font-bold text-white"
            >
              로그인하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindPassword;
