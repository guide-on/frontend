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
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">로그인 정보</h2>
        <p className="text-gray-600 text-sm">
          입력하신 정보로 회원님의 계정이 생성됩니다.
        </p>
      </div>

      <div className="space-y-5 mb-8">
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
          className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:bg-gray-200 hover:-translate-y-0.5"
        >
          이전
        </button>
        <button
          onClick={onNext}
          disabled={!isAccountValid}
          className="flex-1 next-button text-white py-4 rounded-xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음 단계로
        </button>
      </div>
    </div>
  );
};

export default StepAccount;
