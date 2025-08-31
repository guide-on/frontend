// src/pages/auth/Signup.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import memberApi from '@/api/memberApi';
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

type MemberType = 'GENERAL' | 'BUSINESS';

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // 검증 상태
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [passwordValidated, setPasswordValidated] = useState(false);

  // 1단계: 회원 유형
  const [memberType, setMemberType] = useState<MemberType | null>(null);

  // 약관 동의 (2단계)
  const [agreements, setAgreements] = useState<Agreements>({
    terms: false,
    privacy: false,
  });

  // 회원 정보 (3-4단계)
  const [member, setMember] = useState<Member>({
    email: '',
    password: '',
    name: '',
    phone: '',
    gender: undefined,
    birth: '',
  });

  // 유효성들
  const isMemberTypeSelected = useMemo(() => !!memberType, [memberType]);
  const allAgreed = useMemo(
    () => agreements.terms && agreements.privacy,
    [agreements.terms, agreements.privacy],
  );
  const isAccountValid = useMemo(
    () => emailVerified && passwordValidated,
    [emailVerified, passwordValidated],
  );
  const isProfileValid = useMemo(
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
    setCurrentStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s));
  }, []);

  const goToNextStep = useCallback(() => {
    if (currentStep === 1) {
      if (!isMemberTypeSelected) {
        window.alert('회원 유형을 선택해주세요.');
        return;
      }
      setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      if (!allAgreed) {
        window.alert('필수 약관에 모두 동의해주세요.');
        return;
      }
      setCurrentStep(3);
      return;
    }
    if (currentStep === 3) {
      if (!isAccountValid) {
        if (!emailVerified) {
          window.alert('이메일 인증을 완료해주세요.');
          return;
        }
        if (!passwordValidated) {
          window.alert('비밀번호를 확인해주세요.');
          return;
        }
      }
      setCurrentStep(4);
    }
  }, [
    currentStep,
    isMemberTypeSelected,
    allAgreed,
    isAccountValid,
    emailVerified,
    passwordValidated,
  ]);

  // 회원가입 완료
  const completeSignup = useCallback(async () => {
    if (!isProfileValid) {
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
  }, [isProfileValid, member, phoneVerified]);

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

        {/* Step 1: 회원가입 유형 선택 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative">
            <div className="absolute top-6 right-6">
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                1/4
              </span>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                회원가입 유형
              </h2>
              <p className="text-slate-600 text-sm">
                가입할 서비스 유형을 선택해주세요
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setMemberType('GENERAL')}
                className={`border-2 rounded-xl py-7 flex flex-col items-center gap-4 transition-all ${memberType === 'GENERAL' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <i className="fa-solid fa-user fa-4x text-slate-700"></i>
                <span className="font-semibold">일반 회원</span>
              </button>
              <button
                type="button"
                onClick={() => setMemberType('BUSINESS')}
                className={`border-2 rounded-xl py-7 flex flex-col items-center gap-4 transition-all ${memberType === 'BUSINESS' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <i className="fa-solid fa-store fa-4x text-slate-700"></i>
                <span className="font-semibold">사업자 회원</span>
              </button>
            </div>
            <button
              onClick={goToNextStep}
              disabled={!isMemberTypeSelected}
              className="next-button w-full text-white py-3 rounded-md font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}

        {/* Step 2: 약관 동의 */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative">
            <div className="absolute top-6 right-6">
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                2/4
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                약관 동의
              </h2>
              <p className="text-slate-600 text-sm">
                서비스 이용을 위해 약관에 동의해주세요
              </p>
            </div>

            <TermsAgreement value={agreements} onChange={setAgreements} />

            <div className="flex gap-3">
              <button
                onClick={goToPreviousStep}
                className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-md font-bold text-sm transition-all duration-200 hover:bg-slate-300"
              >
                이전
              </button>
              <button
                onClick={goToNextStep}
                disabled={!allAgreed}
                className="flex-1 next-button text-white py-3 rounded-md font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 계정 정보 */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative">
            <div className="absolute top-6 right-6">
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                3/4
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
              <EmailVerification
                value={member.email}
                onChange={(email: string) =>
                  setMember((s) => ({ ...s, email }))
                }
                onVerified={(ok: boolean) => setEmailVerified(ok)}
              />

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
                disabled={!isAccountValid}
                className="flex-1 next-button text-white py-3 rounded-md font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 개인 정보 */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative">
            <div className="absolute top-6 right-6">
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                4/4
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
                disabled={!isProfileValid || isSubmitting}
                className="flex-1 next-button text-white py-3 rounded-md font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
