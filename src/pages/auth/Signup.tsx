// src/pages/auth/Signup.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import memberApi from '@/api/memberApi';
// 아래 컴포넌트들은 React 버전이 존재한다고 가정합니다.
import EmailVerification from '@/components/verification/EmailVerificaition';
import PhoneVerification from '@/components/verification/PhoneVerification';
import PasswordField from '@/components/auth/PasswordField';
import TermsAgreement from '@/components/auth/TermsAgreement';
// import SuccessModal from '@/components/common/SuccessModal';

type Agreements = {
  terms: boolean;
  privacy: boolean;
};

type Member = {
  email: string;
  password: string;
  name: string;
  phone: string;
  gender?: 'MALE' | 'FEMALE';
  birth: string; // yyyy-mm-dd
};

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  // const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 검증 상태
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [passwordValidated, setPasswordValidated] = useState(false);

  // 약관 동의
  const [agreements, setAgreements] = useState<Agreements>({
    terms: false,
    privacy: false,
  });

  // 회원 정보
  const [member, setMember] = useState<Member>({
    email: '',
    password: '',
    name: '',
    phone: '',
    gender: undefined,
    birth: '',
  });

  // 모든 필수 약관 동의
  const allAgreed = useMemo(
    () => agreements.terms && agreements.privacy,
    [agreements.terms, agreements.privacy],
  );

  // 단계별 유효성
  const isStep2Valid = useMemo(
    () => emailVerified && passwordValidated,
    [emailVerified, passwordValidated],
  );

  const isStep3Valid = useMemo(
    () =>
      member.name.trim() !== '' &&
      !!member.gender &&
      member.birth !== '' &&
      phoneVerified,
    [member.name, member.gender, member.birth, phoneVerified],
  );

  // 뒤로가기
  const goBack = useCallback(() => {
    navigate('/auth/login');
  }, [navigate]);

  // 이전/다음
  const goToPreviousStep = useCallback(() => {
    setCurrentStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
  }, []);

  const goToNextStep = useCallback(() => {
    if (currentStep === 1) {
      if (!allAgreed) {
        window.alert('필수 약관에 모두 동의해주세요.');
        return;
      }
      setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      if (!isStep2Valid) {
        if (!emailVerified) {
          window.alert('이메일 인증을 완료해주세요.');
          return;
        }
        if (!passwordValidated) {
          window.alert('비밀번호를 확인해주세요.');
          return;
        }
      }
      setCurrentStep(3);
    }
  }, [currentStep, allAgreed, isStep2Valid, emailVerified, passwordValidated]);

  // 회원가입 완료
  const completeSignup = useCallback(async () => {
    if (!isStep3Valid) {
      if (member.name.trim() === '') {
        window.alert('이름을 입력해주세요');
        return;
      }
      if (!member.gender) {
        window.alert('성별을 선택해주세요');
        return;
      }
      if (member.birth === '') {
        window.alert('생년월일을 입력해주세요');
        return;
      }
      if (!phoneVerified) {
        window.alert('전화번호 인증을 완료해주세요');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await memberApi.create(member);
      // setShowSuccessModal(true);
    } catch (e) {
      console.error(e);
      window.alert('가입 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isStep3Valid, member, phoneVerified]);

  // 성공 모달 확인
  const handleSuccessConfirm = useCallback(() => {
    // setShowSuccessModal(false);
    navigate('/auth/login');
  }, [navigate]);

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
          <h1 className="text-2xl font-bold text-slate-800">회원가입</h1>
          <div className="w-10" />
        </div>

        {/* Step 1: 약관 동의 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative">
            <div className="absolute top-6 right-6">
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                1/3
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                가입을
                <br />
                환영합니다!
              </h2>
              <p className="text-slate-600 text-sm">
                서비스 이용을 위해 약관에 동의해주세요
              </p>
            </div>

            {/* 약관 동의: v-model → value/onChange로 변환 */}
            <TermsAgreement value={agreements} onChange={setAgreements} />

            <button
              onClick={goToNextStep}
              disabled={!allAgreed}
              className="next-button w-full bg-gradient-to-r text-white py-3 rounded-md font-bold text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              동의하고 계속하기
            </button>
          </div>
        )}

        {/* Step 2: 계정 정보 */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative">
            <div className="absolute top-6 right-6">
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                2/3
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                로그인 정보
              </h2>
              <p className="text-slate-600 text-sm">
                입력하신 정보로 회원님의 계정이 생성됩니다.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* EmailVerification: v-model:email & @verified → value/onChange/onVerified */}
              <EmailVerification
                value={member.email}
                onChange={(email: string) =>
                  setMember((s) => ({ ...s, email }))
                }
                onVerified={(ok: boolean) => setEmailVerified(ok)}
              />

              {/* PasswordField: v-model:password & @validated → value/onChange/onValidated */}
              <PasswordField
                value={member.password}
                onChange={(password: string) =>
                  setMember((s) => ({ ...s, password }))
                }
                onValidated={(ok: boolean) => setPasswordValidated(ok)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={goToPreviousStep}
                className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-md font-bold text-sm transition-all duration-200 hover:bg-slate-300"
              >
                이전
              </button>
              <button
                onClick={goToNextStep}
                disabled={!isStep2Valid}
                className="flex-1 next-button bg-gradient-to-r text-white py-3 rounded-md font-bold text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 개인 정보 */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative">
            <div className="absolute top-6 right-6">
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                3/3
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                개인 정보
              </h2>
              <p className="text-slate-600 text-sm">
                서비스 이용을 위한 기본 정보를 입력해주세요.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* 이름 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ps-1">
                  이름
                </label>
                <input
                  value={member.name}
                  onChange={(e) =>
                    setMember((s) => ({ ...s, name: e.target.value }))
                  }
                  type="text"
                  placeholder="이름 입력"
                  required
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-slate-700 text-md"
                />
              </div>

              {/* 성별 */}
              <div>
                <label className="flex text-sm font-semibold text-slate-700 mb-1.5 ps-1">
                  성별
                </label>
                <div className="flex gap-6 ps-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      value="MALE"
                      checked={member.gender === 'MALE'}
                      onChange={() =>
                        setMember((s) => ({ ...s, gender: 'MALE' }))
                      }
                      className="w-3.5 h-3.5 text-blue-600 border-2 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 font-medium">남자</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      value="FEMALE"
                      checked={member.gender === 'FEMALE'}
                      onChange={() =>
                        setMember((s) => ({ ...s, gender: 'FEMALE' }))
                      }
                      className="w-3.5 h-3.5 text-blue-600 border-2 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 font-medium">여자</span>
                  </label>
                </div>
              </div>

              {/* 생년월일 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ps-1">
                  생년월일
                </label>
                <input
                  value={member.birth}
                  onChange={(e) =>
                    setMember((s) => ({ ...s, birth: e.target.value }))
                  }
                  type="date"
                  required
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-slate-700 text-sm"
                  style={{ fontSize: 16, minHeight: 48 }}
                />
              </div>

              {/* 전화번호 인증 */}
              <PhoneVerification
                value={member.phone}
                onChange={(phone: string) =>
                  setMember((s) => ({ ...s, phone }))
                }
                onVerified={(ok: boolean) => setPhoneVerified(ok)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={goToPreviousStep}
                className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-md font-bold text-sm transition-all duration-200 hover:bg-slate-300"
              >
                이전
              </button>
              <button
                onClick={completeSignup}
                disabled={!isStep3Valid || isSubmitting}
                className="flex-1 next-button bg-gradient-to-r text-white py-3 rounded-md font-bold text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent inline-block mr-2" />
                    가입 중...
                  </>
                ) : (
                  '가입 완료'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 성공 모달 */}
      {/* {showSuccessModal && (
        <SuccessModal
          title="회원가입 완료"
          message="회원가입이 성공적으로 완료되었습니다!"
          confirmText="로그인하기"
          onConfirm={handleSuccessConfirm}
          onClose={handleSuccessConfirm}
        />
      )} */}

      {/* SFC <style scoped> 대체용 보조 스타일 */}
      <style>{`
        .text-color,
        .text-btn { color: #63b6ae; }
        .text-btn:hover { color: #4da99b; }

        .next-button { background: var(--point-color); border: none; touch-action: manipulation; }
        .next-button:hover { background: var(--point-color-2); }
        .next-button:disabled { background: var(--logo-color); }

        .logo-img { object-fit: contain; }

        input[type='checkbox']:checked { background-color: #2563eb; border-color: #2563eb; }

        .overflow-y-auto::-webkit-scrollbar { width: 6px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default Signup;
