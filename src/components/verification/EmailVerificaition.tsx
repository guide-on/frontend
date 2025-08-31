// src/components/verification/EmailVerification.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import verificationApi from '@/api/verificationApi';

type Props = {
  value: string; // 부모의 email
  onChange: (next: string) => void; // 이메일 입력 변경
  onVerified?: (ok: boolean) => void; // 최종 인증 완료 알림
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const EmailVerification: React.FC<Props> = ({
  value,
  onChange,
  onVerified,
}) => {
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // 이메일 입력 시 상태 초기화 로직 (원본의 changeEmail)
  const handleEmailInput = (next: string) => {
    // 부모 state 변경 먼저
    onChange(next);

    if (verificationSent && !verified) {
      setVerificationSent(false);
      setCode('');
      setTimer(0);
      setResendTimer(0);
      setMessage('이메일 인증을 다시 진행해주세요.');
      onVerified?.(false);
    } else {
      setMessage(next ? '이메일 인증을 진행해주세요' : '');
    }
    setVerified(false); // 인증 완료 상태 초기화
  };

  const canSend = useMemo(
    () => !(resendTimer > 0 || isSending || verified),
    [resendTimer, isSending, verified],
  );

  const handleSendCode = () => {
    if (!canSend) return;
    void sendCode();
  };

  const sendCode = async () => {
    if (!value) {
      window.alert('이메일을 입력하세요.');
      return;
    }
    setIsSending(true);
    try {
      const result = await verificationApi.sendEmail(value, true);
      if (result.success) {
        setVerificationSent(true);
        setVerified(false);
        setTimer(300); // 5분
        setResendTimer(60); // 1분
        setMessage(result.message);
        setCode('');
      } else {
        setMessage(result.message);
      }
    } catch (error: any) {
      let msg =
        error?.response?.data?.message ??
        '이메일 인증번호 전송 중 오류가 발생했습니다.';
      if (error?.response?.status === 409) {
        msg = error.response.data.message;
      }
      setMessage(msg);
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    if (!code) {
      window.alert('인증번호를 입력하세요.');
      return;
    }
    setIsVerifying(true);
    try {
      const result = await verificationApi.verify(value, code, true);
      setMessage(result.message);
      if (result.success) {
        setVerified(true);
        setVerificationSent(false);
        setTimer(0);
        onVerified?.(true);
      }
    } catch {
      setMessage('이메일 인증 중 오류가 발생했습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  // 타이머
  useEffect(() => {
    // 1초 간격 인터벌
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

  // 만료 처리
  useEffect(() => {
    if (timer === 0 && verificationSent) {
      setVerificationSent(false);
      setMessage('인증번호가 만료되었습니다.');
    }
  }, [timer, verificationSent]);

  // 메시지 색상
  const messageClass = useMemo(() => {
    if (!message) return '';
    if (verified) return 'text-green-600';
    const isBad =
      message.includes('오류') ||
      message.includes('만료') ||
      message.includes('이미') ||
      message.includes('진행') ||
      message.includes('재전송');
    return isBad ? 'text-red-600' : 'text-blue-600';
  }, [message, verified]);

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
        <span className="ps-1">이메일</span>
        {!verified && (
          <button
            type="button"
            onClick={handleSendCode}
            disabled={!canSend}
            className="send-btn text-white ml-auto px-2.5 py-1 rounded-md text-xs font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSending
              ? '전송 중...'
              : verified
                ? '인증완료'
                : resendTimer > 0
                  ? `재전송 ${formatTime(resendTimer)}`
                  : verificationSent
                    ? '재전송'
                    : '이메일 인증'}
          </button>
        )}
      </label>

      <input
        type="email"
        value={value}
        readOnly={verified}
        onChange={(e) => handleEmailInput(e.target.value)}
        placeholder="이메일 입력"
        required
        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-slate-700 text-md"
      />

      {message && (
        <p className={`flex text-sm mb-1 mt-1 ms-1 ${messageClass}`}>
          {message}
          {timer > 0 && <span>&nbsp;({formatTime(timer)})</span>}
        </p>
      )}

      {verificationSent && !verified && (
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="인증번호 (6자리)"
            maxLength={6}
            className="flex-1 px-3 py-2 border-2 text-md border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-slate-700"
          />
          <button
            type="button"
            onClick={verifyCode}
            disabled={isVerifying || code.length !== 6}
            className="send-btn text-white px-4 my-0.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            확인
          </button>
        </div>
      )}

      {/* SFC <style scoped> 대체용 보조 스타일 */}
      <style>{`
        .send-btn { background: var(--point-color); }
      `}</style>
    </div>
  );
};

export default EmailVerification;
