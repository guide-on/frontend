// src/pages/auth/Signup.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import memberApi from '@/api/memberApi';
import StepType from '@/components/auth/signup/StepType';
import StepTerms from '@/components/auth/signup/StepTerms';
import StepAccount from '@/components/auth/signup/StepAccount';
import StepProfile from '@/components/auth/signup/StepProfile';
import StepBusiness from '@/components/auth/signup/StepBusiness';
import {
  buildSignupPayload,
  type Agreements,
  type BusinessInfoUI,
  type MemberType,
  type PreferenceInfo,
} from '@/utils/signup';
import { useSignupStore } from '@/stores/useSignupStore';
import { colors } from '@/styles/colors';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { setBase } = useSignupStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // 1단계: 회원 유형
  const [memberType, setMemberType] = useState<MemberType | null>(null);

  // 검증 상태
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [passwordValidated, setPasswordValidated] = useState(false);
  const [bizVerified, setBizVerified] = useState(false);

  // 2단계: 약관 동의
  const [agreements, setAgreements] = useState<Agreements>({
    terms: false,
    privacy: false,
  });

  // 3-4단계: 회원 정보
  const [member, setMember] = useState({
    memberType: 'GENERAL' as MemberType,
    email: '',
    password: '',
    name: '',
    phone: '',
    gender: undefined as undefined | 'MALE' | 'FEMALE',
    birth: '',
    residenceSggCode: undefined as string | undefined,
  });
  const [password2, setPassword2] = useState('');

  // 일반 유형 선호도(건너뛰기 가능) – 본 화면에서는 보관만, 실제 전송은 온보딩에서 처리
  const [preference] = useState<PreferenceInfo>({
    regionCodes: [],
    industryTags: [],
  });

  // 5단계: 사업자 정보 (UI 전용)
  const [biz, setBiz] = useState<BusinessInfoUI>({
    bno1: '',
    bno2: '',
    bno3: '',
    bizName: '',
    ksicCode: '',
    ksicName: '',
    openDate: '',
    businessSggCode: '',
    addrRoad: '',
    addrDetail: '',
  });

  const totalSteps = useMemo(
    () => (memberType === 'SOLE_PROPRIETOR' ? 5 : 4),
    [memberType],
  );

  // 유효성
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
  const isBusinessInfoValid = useMemo(() => {
    const b1 = biz.bno1.replace(/\D/g, '');
    const b2 = biz.bno2.replace(/\D/g, '');
    const b3 = biz.bno3.replace(/\D/g, '');
    return (
      b1.length === 3 &&
      b2.length === 2 &&
      b3.length === 5 &&
      biz.bizName.trim() !== '' &&
      biz.ksicCode.trim() !== '' &&
      biz.openDate.trim() !== '' &&
      biz.businessSggCode.trim().length === 5 &&
      biz.addrRoad.trim() !== '' &&
      bizVerified
    );
  }, [biz, bizVerified]);

  const goBack = useCallback(() => navigate('/auth/login'), [navigate]);
  const goToPreviousStep = useCallback(
    () => setCurrentStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4 | 5) : s)),
    [],
  );

  const goToNextStep = useCallback(() => {
    if (currentStep === 1) {
      if (!isMemberTypeSelected) return alert('회원 유형을 선택해주세요.');
      setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      if (!allAgreed) return alert('필수 약관에 모두 동의해주세요.');
      setCurrentStep(3);
      return;
    }
    if (currentStep === 3) {
      if (!isAccountValid) {
        if (!emailVerified) return alert('이메일 인증을 완료해주세요.');
        if (!passwordValidated) return alert('비밀번호를 확인해주세요.');
      }
      setCurrentStep(4);
      return;
    }
    if (currentStep === 4 && memberType === 'SOLE_PROPRIETOR') {
      if (!isProfileValid) {
        if (member.name.trim() === '') return alert('이름을 입력해주세요');
        if (!member.gender) return alert('성별을 선택해주세요');
        if (member.birth === '') return alert('생년월일을 입력해주세요');
        if (!phoneVerified) return alert('전화번호 인증을 완료해주세요');
      }
      setCurrentStep(5);
      return;
    }
  }, [
    currentStep,
    isMemberTypeSelected,
    allAgreed,
    isAccountValid,
    emailVerified,
    passwordValidated,
    memberType,
    isProfileValid,
    member,
    phoneVerified,
  ]);

  const completeSignup = useCallback(async () => {
    if (!isProfileValid) {
      if (!member.name.trim()) return alert('이름을 입력해주세요');
      if (!member.gender) return alert('성별을 선택해주세요');
      if (!member.birth) return alert('생년월일을 입력해주세요');
      if (!phoneVerified) return alert('전화번호 인증을 완료해주세요');
    }
    if (memberType === 'SOLE_PROPRIETOR' && !isBusinessInfoValid)
      return alert('사업자 정보를 정확히 ��력해주세요');

    setIsSubmitting(true);
    try {
      const baseCommon = {
        email: member.email,
        password: member.password,
        name: member.name,
        phone: member.phone,
        gender: member.gender!,
        birth: member.birth,
        residenceSggCode: member.residenceSggCode,
      };

      const payload = buildSignupPayload({
        memberType: (memberType ?? 'GENERAL') as MemberType,
        base: baseCommon,
        preference: memberType === 'GENERAL' ? preference : undefined,
        business: memberType === 'SOLE_PROPRIETOR' ? biz : undefined,
      });

      await memberApi.create(payload);
      navigate('/auth/login');
    } catch (e) {
      console.error(e);
      alert('가입 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isProfileValid,
    isBusinessInfoValid,
    member,
    memberType,
    preference,
    biz,
    phoneVerified,
    navigate,
  ]);

  const proceedToOnboarding = useCallback(() => {
    if (!isProfileValid) return;
    
    const baseCommon = {
      email: member.email,
      password: member.password,
      name: member.name,
      phone: member.phone,
      gender: member.gender as 'MALE' | 'FEMALE',
      birth: member.birth,
      residenceSggCode: member.residenceSggCode,
    };
    
    setBase((memberType ?? 'GENERAL') as MemberType, baseCommon);
    navigate('/auth/onboarding');
  }, [
    isProfileValid,
    member.email,
    member.password,
    member.name,
    member.phone,
    member.gender,
    member.birth,
    member.residenceSggCode,
    memberType,
    navigate,
    setBase,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 px-4">
      {/* Background decoration */}
      <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 -left-5 w-16 h-16 bg-indigo-200/20 rounded-full blur-lg"></div>
      
      <div className="max-w-sm mx-auto w-full relative" style={{ maxWidth: 400 }}>
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 p-6 shadow-lg shadow-blue-500/10 mb-4 transition-all duration-300">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="p-2 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <svg
                className="w-6 h-6"
                style={{ color: colors.navy }}
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
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">회원가입</h1>
              <p className="text-sm text-gray-600 mt-1">
                {currentStep}/{totalSteps}단계
              </p>
            </div>
            
            <div className="w-10" />
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 p-6 shadow-lg shadow-blue-500/10 transition-all duration-300">
          {currentStep === 1 && (
            <StepType
              totalSteps={totalSteps}
              memberType={memberType}
              onSelect={setMemberType}
              onNext={goToNextStep}
            />
          )}

          {currentStep === 2 && (
            <StepTerms
              totalSteps={totalSteps}
              value={agreements}
              onChange={setAgreements}
              onPrev={goToPreviousStep}
              onNext={goToNextStep}
            />
          )}

          {currentStep === 3 && (
            <StepAccount
              totalSteps={totalSteps}
              email={member.email}
              password={member.password}
              password2={password2}
              setEmail={(email) => setMember((s) => ({ ...s, email }))}
              setPassword={(password) => setMember((s) => ({ ...s, password }))}
              setPassword2={setPassword2}
              emailVerified={emailVerified}
              setEmailVerified={setEmailVerified}
              passwordValidated={passwordValidated}
              setPasswordValidated={setPasswordValidated}
              onPrev={goToPreviousStep}
              onNext={goToNextStep}
            />
          )}

          {currentStep === 4 && (
            <StepProfile
              totalSteps={totalSteps}
              memberType={memberType}
              name={member.name}
              gender={member.gender}
              birth={member.birth}
              phone={member.phone}
              setName={(v) => setMember((s) => ({ ...s, name: v }))}
              setGender={(v) => setMember((s) => ({ ...s, gender: v }))}
              setBirth={(v) => setMember((s) => ({ ...s, birth: v }))}
              setPhone={(v) => setMember((s) => ({ ...s, phone: v }))}
              phoneVerified={phoneVerified}
              setPhoneVerified={setPhoneVerified}
              isValid={isProfileValid}
              onPrev={goToPreviousStep}
              onNextGeneral={proceedToOnboarding}
              onNextSole={goToNextStep}
            />
          )}

          {currentStep === 5 && memberType === 'SOLE_PROPRIETOR' && (
            <StepBusiness
              totalSteps={totalSteps}
              value={biz}
              onChange={setBiz}
              isValid={isBusinessInfoValid}
              bizVerified={bizVerified}
              setBizVerified={setBizVerified}
              onPrev={goToPreviousStep}
              onSubmit={completeSignup}
              submitting={isSubmitting}
            />
          )}
        </div>
      </div>

      <style>{`
        .text-color,
        .text-btn { color: ${colors.navy}; }
        .text-btn:hover { opacity: 0.9; }
        .next-button { 
          background: ${colors.navy}; 
          border: none; 
          touch-action: manipulation;
          border-radius: 0.75rem;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 10px 25px ${colors.navy}25;
        }
        .next-button:hover { 
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 15px 35px ${colors.navy}30;
        }
        .next-button:disabled {
          opacity: 0.5;
          transform: none;
          box-shadow: none;
          background-color: #9ca3af !important;
        }
        .logo-img { object-fit: contain; }
        input[type='checkbox']:checked { background-color: ${colors.paleBlue}; border-color: #2563eb; }
        .overflow-y-auto::-webkit-scrollbar { width: 6px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        /* Input 필드 스타일 개선 */
        .form-input {
          background: rgba(243, 244, 246, 0.5);
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          transition: all 0.2s ease;
          color: #374151;
        }
        .form-input::placeholder {
          color: #9ca3af;
        }
        .form-input:focus {
          background: white;
          border-color: ${colors.navy};
          box-shadow: 0 0 0 4px ${colors.navy}26;
          outline: none;
        }
        
        /* 선택 버튼 스타일 */
        .selection-button {
          border: 2px solid #e5e7eb;
          border-radius: 1rem;
          padding: 1rem;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.8);
        }
        .selection-button:hover {
          border-color: ${colors.lightBlue};
          background: rgba(169, 199, 255, 0.1);
          transform: translateY(-1px);
        }
        .selection-button.selected {
          border-color: ${colors.navy};
          background: rgba(37, 67, 123, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Signup;
