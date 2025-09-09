import React from 'react';
import EmailVerification from '@/components/verification/EmailVerificaition';
import PasswordField from '@/components/auth/PasswordField';

type Props = {
  totalSteps: number;
  email: string;
  password: string;
  password2: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setPassword2: (v: string) => void;
  emailVerified: boolean;
  setEmailVerified: (v: boolean) => void;
  passwordValidated: boolean;
  setPasswordValidated: (v: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
};

const StepAccount: React.FC<Props> = ({
  totalSteps,
  email,
  password,
  password2,
  setEmail,
  setPassword,
  setPassword2,
  emailVerified,
  setEmailVerified,
  passwordValidated,
  setPasswordValidated,
  onPrev,
  onNext,
}) => {
  const isAccountValid = emailVerified && passwordValidated;
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative">
      <div className="absolute top-6 right-6">
        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">{`3/${totalSteps}`}</span>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800 mb-2">로그인 정보</h2>
        <p className="text-slate-600 text-sm">
          입력하신 정보로 회원님의 계정이 생성됩니다.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <EmailVerification
          value={email}
          onChange={setEmail}
          onVerified={setEmailVerified}
          verified={emailVerified}
        />
        <PasswordField
          value={password}
          onChange={setPassword}
          onValidated={setPasswordValidated}
          confirmValue={password2}
          onConfirmChange={setPassword2}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onPrev}
          className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-md font-bold text-sm transition-all duration-200 hover:bg-slate-300"
        >
          이전
        </button>
        <button
          onClick={onNext}
          disabled={!isAccountValid}
          className="flex-1 next-button text-white py-3 rounded-md font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default StepAccount;
