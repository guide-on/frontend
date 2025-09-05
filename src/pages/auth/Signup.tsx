// src/pages/auth/Signup.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import memberApi from '@/api/memberApi';
import EmailVerification from '@/components/verification/EmailVerificaition';
import PhoneVerification from '@/components/verification/PhoneVerification';
import PasswordField from '@/components/auth/PasswordField';
import TermsAgreement from '@/components/auth/TermsAgreement';
// import SuccessModal from '@/components/common/SuccessModal';
import BusinessCertUploadSheet from '@/components/auth/BusinessCertUploadSheet';

/* =========================
 * Types
 * ========================= */
type Agreements = {
  terms: boolean;
  privacy: boolean;
};

type MemberType = 'GENERAL' | 'SOLE_PROPRIETOR';

type BusinessInfo = {
  bno1: string; // 앞 3
  bno2: string; // 중간 2
  bno3: string; // 뒤 5
  bizName: string;
  ksicCode: string;
  openDate: string; // yyyy-mm-dd
  // 주소 관련(요구사항 반영)
  businessSggCode: string; // 5자리 (sigunguCode)
  addrRoad: string; // 도로명 주소
  addrDetail: string; // 상세주소 (nullable)
};

type PreferenceInfo = {
  regionCodes?: string[]; // nullable/empty 허용
  industryTags?: string[]; // 라벨 ID들
};

type Member = {
  memberType: MemberType;
  email: string;
  password: string;
  name: string;
  phone: string;
  gender?: 'MALE' | 'FEMALE';
  birth: string; // yyyy-mm-dd
  residenceSggCode?: string;
  business?: BusinessInfo; // SOLE_PROPRIETOR 전용 (UI 상태)
  preference?: PreferenceInfo; // GENERAL 전용 (UI 상태)
};

/** preference가 비어있으면 payload에서 제거하기 위한 정규화 */
const normalizePreference = (pref?: PreferenceInfo) => {
  if (!pref) return undefined;
  const regionOk =
    Array.isArray(pref.regionCodes) && pref.regionCodes.length > 0;
  const industryOk =
    Array.isArray(pref.industryTags) && pref.industryTags.length > 0;
  if (!regionOk && !industryOk) return undefined;
  return {
    ...(regionOk ? { regionCodes: pref.regionCodes } : {}),
    ...(industryOk ? { industryTags: pref.industryTags } : {}),
  };
};

/** 사업자번호 3-2-5를 합쳐 단일 문자열로 반환 (기본: 하이픈 제거) */
const buildBusinessNo = (
  b1: string,
  b2: string,
  b3: string,
  withHyphen = false,
) => {
  const n1 = (b1 || '').replace(/\D/g, '').slice(0, 3);
  const n2 = (b2 || '').replace(/\D/g, '').slice(0, 2);
  const n3 = (b3 || '').replace(/\D/g, '').slice(0, 5);
  return withHyphen ? `${n1}-${n2}-${n3}` : `${n1}${n2}${n3}`;
};

/**
 * API로 보낼 가입 Payload 생성기
 * - GENERAL: preference가 비어있으면 제외
 * - SOLE_PROPRIETOR: business 필수 + businessNo(합쳐진 값)로 전송
 *   (서버 스펙에 맞춰 key 이름이 다르면 아래를 수정하세요)
 */
const buildSignupPayload = (args: {
  memberType: MemberType;
  base: {
    email: string;
    password: string;
    name: string;
    phone: string;
    gender: 'MALE' | 'FEMALE';
    birth: string;
    residenceSggCode?: string;
  };
  preference?: PreferenceInfo;
  business?: BusinessInfo;
}) => {
  const { memberType, base, preference, business } = args;

  if (memberType === 'SOLE_PROPRIETOR') {
    if (!business) throw new Error('사업자 회원은 사업 정보가 필수입니다.');
    const bizRegNo = buildBusinessNo(
      business.bno1,
      business.bno2,
      business.bno3,
      false,
    );
    return {
      memberType,
      ...base,
      business: {
        bizRegNo, // 하이픈 없는 10자리 문자열
        bizName: business.bizName,
        ksicCode: business.ksicCode,
        openDate: business.openDate,
        businessSggCode: business.businessSggCode, // 5자리
        addrRoad: business.addrRoad,
        addrDetail: business.addrDetail || null, // nullable
      },
    };
  }

  // GENERAL
  const pref = normalizePreference(preference);
  return {
    memberType,
    ...base,
    ...(pref ? { preference: pref } : {}),
  };
};

/* =========================
 * Component
 * ========================= */
const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [showBizUpload, setShowBizUpload] = useState(false);

  // 다음(카카오) 주소 검색 모달
  const [openPostcode, setOpenPostcode] = useState(false);

  // 1단계: 회원 유형
  const [memberType, setMemberType] = useState<MemberType | null>(null);

  // 검증 상태
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [passwordValidated, setPasswordValidated] = useState(false);

  // 2단계: 약관 동의
  const [agreements, setAgreements] = useState<Agreements>({
    terms: false,
    privacy: false,
  });

  // 3-4단계: 회원 정보
  const [member, setMember] = useState<Member>({
    memberType: 'GENERAL',
    email: '',
    password: '',
    name: '',
    phone: '',
    gender: undefined,
    birth: '',
  });

  // 일반 유형 선호도(건너뛰기 가능)
  const [preference, setPreference] = useState<PreferenceInfo>({
    regionCodes: [],
    industryTags: [],
  });

  // 5단계: 사업자 정보 (UI 전용)
  const [biz, setBiz] = useState<BusinessInfo>({
    bno1: '',
    bno2: '',
    bno3: '',
    bizName: '',
    ksicCode: '',
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

  // 사업자 입력 자릿수 검증 강화(3-2-5)
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
      biz.addrRoad.trim() !== ''
    );
  }, [biz]);

  // 뒤로가기
  const goBack = useCallback(() => {
    navigate('/auth/login');
  }, [navigate]);

  // 이전/다음
  const goToPreviousStep = useCallback(() => {
    setCurrentStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4 | 5) : s));
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
      return;
    }
    if (currentStep === 4 && memberType === 'SOLE_PROPRIETOR') {
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

  const handleCompletePostcode = useCallback((data: any) => {
    // 도로명 주소 우선, 없으면 기본 address 사용
    const road = data.roadAddress || data.address || '';
    // 시군구코드(5자리). 제공 안 되면 법정동코드(bcode 10자리)의 앞 5자리로 대체
    const sggCode: string =
      (data.sigunguCode as string) ||
      (data.bcode ? String(data.bcode).slice(0, 5) : '');

    setBiz((prev) => ({
      ...prev,
      businessSggCode: (sggCode || '').slice(0, 5),
      addrRoad: road,
      // addrDetail은 사용자가 따로 입력
    }));
    setOpenPostcode(false);
  }, []);

  // 회원가입 완료
  const completeSignup = useCallback(async () => {
    // 프로필 공통 검증
    if (!isProfileValid) {
      if (!member.name.trim()) return alert('이름을 입력해주세요');
      if (!member.gender) return alert('성별을 선택해주세요');
      if (!member.birth) return alert('생년월일을 입력해주세요');
      if (!phoneVerified) return alert('전화번호 인증을 완료해주세요');
    }

    // 사업자 유형은 사업자 정보 필수
    if (memberType === 'SOLE_PROPRIETOR' && !isBusinessInfoValid) {
      return alert('사업자 정보를 정확히 입력해주세요');
    }

    setIsSubmitting(true);
    try {
      // 공통 필드
      const baseCommon = {
        email: member.email,
        password: member.password,
        name: member.name,
        phone: member.phone,
        gender: member.gender!, // 위에서 검증됨
        birth: member.birth,
        residenceSggCode: member.residenceSggCode,
      };

      // payload 생성
      const payload = buildSignupPayload({
        memberType: (memberType ?? 'GENERAL') as MemberType,
        base: baseCommon,
        preference: memberType === 'GENERAL' ? preference : undefined,
        business:
          memberType === 'SOLE_PROPRIETOR'
            ? {
                bno1: biz.bno1,
                bno2: biz.bno2,
                bno3: biz.bno3,
                bizName: biz.bizName,
                ksicCode: biz.ksicCode,
                openDate: biz.openDate,
                businessSggCode: biz.businessSggCode,
                addrRoad: biz.addrRoad,
                addrDetail: biz.addrDetail,
              }
            : undefined,
      });

      await memberApi.create(payload);
      navigate('/auth/login');
    } catch (e) {
      console.error(e);
      window.alert('가입 중 오류가 발생했습니다.');
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
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">{`1/${totalSteps}`}</span>
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
                <span className="font-semibold text-md">일반 회원</span>
              </button>
              <button
                type="button"
                onClick={() => setMemberType('SOLE_PROPRIETOR')}
                className={`border-2 rounded-xl py-7 flex flex-col items-center gap-4 transition-all ${memberType === 'SOLE_PROPRIETOR' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
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
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">{`2/${totalSteps}`}</span>
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
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">{`3/${totalSteps}`}</span>
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
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">{`4/${totalSteps}`}</span>
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
              {memberType === 'SOLE_PROPRIETOR' ? (
                <button
                  onClick={goToNextStep}
                  disabled={!isProfileValid}
                  className="flex-1 next-button text-white py-3 rounded-md font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              ) : (
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
              )}
            </div>
          </div>
        )}

        {/* Step 5: 사업자 정보 (사업자 회원 전용) */}
        {currentStep === 5 && memberType === 'SOLE_PROPRIETOR' && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative">
            <div className="absolute top-6 right-6">
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">{`5/${totalSteps}`}</span>
            </div>

            <div className="mb-2">
              <h2 className="text-xl font-bold text-slate-800">사업자 정보</h2>
              <p className="text-slate-600 text-sm">
                유효한 사업자 정보를 입력해주세요.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowBizUpload(true)}
              className="w-full border rounded-md py-3 my-5 text-gray-500 cursor-pointer hover:bg-slate-100"
            >
              <div className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-file-arrow-up fa-lg leading-none"></i>
                <span className="font-extrabold text-sm">
                  사업자등록증으로 자동입력
                </span>
              </div>
            </button>

            {/* 사업자 등록 번호 */}
            <div className="mb-4">
              <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
                <span className="ps-1">사업자 등록 번호</span>
                <button
                  type="button"
                  className="ml-auto px-2.5 py-1 rounded-md text-xs font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  사업자번호 인증
                </button>
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={biz.bno1}
                  onChange={(e) =>
                    setBiz((s) => ({
                      ...s,
                      bno1: e.target.value.replace(/[^0-9]/g, '').slice(0, 3),
                    }))
                  }
                  className="w-1/3 px-3 py-2 border-2 border-slate-200 rounded-lg text-center"
                />
                <span className="text-slate-500">-</span>
                <input
                  value={biz.bno2}
                  onChange={(e) =>
                    setBiz((s) => ({
                      ...s,
                      bno2: e.target.value.replace(/[^0-9]/g, '').slice(0, 2),
                    }))
                  }
                  className="w-1/3 px-3 py-2 border-2 border-slate-200 rounded-lg text-center"
                />
                <span className="text-slate-500">-</span>
                <input
                  value={biz.bno3}
                  onChange={(e) =>
                    setBiz((s) => ({
                      ...s,
                      bno3: e.target.value.replace(/[^0-9]/g, '').slice(0, 5),
                    }))
                  }
                  className="w-1/3 px-3 py-2 border-2 border-slate-200 rounded-lg text-center"
                />
              </div>
            </div>

            {/* 업체명 */}
            <div className="mb-4">
              <label className="flex text-sm font-semibold text-slate-700 mb-1.5 ps-1">
                업체명
              </label>
              <input
                value={biz.bizName}
                onChange={(e) =>
                  setBiz((s) => ({ ...s, bizName: e.target.value }))
                }
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg"
              />
            </div>

            {/* 업종 */}
            <div className="mb-4">
              <label className="flex text-sm font-semibold text-slate-700 mb-1.5 ps-1">
                업종
              </label>
              <div className="flex gap-2">
                <input
                  value={biz.ksicCode}
                  onChange={(e) =>
                    setBiz((s) => ({ ...s, ksicCode: e.target.value }))
                  }
                  className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg"
                />
                <button
                  type="button"
                  className="px-2 border-2 border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50"
                >
                  업종선택
                </button>
              </div>
            </div>

            {/* 개업일자 */}
            <div className="mb-4">
              <label className="flex text-sm font-semibold text-slate-700 mb-1.5 ps-1">
                개업일자
              </label>
              <input
                type="date"
                value={biz.openDate}
                onChange={(e) =>
                  setBiz((s) => ({ ...s, openDate: e.target.value }))
                }
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg"
              />
            </div>

            {/* 사업장 주소 */}
            <div className="mb-6">
              <label className="flex text-sm font-semibold text-slate-700 mb-1.5 ps-1">
                사업장 주소
              </label>

              {/* 도로명 주소 + 검색 버튼 (표시 전용, 읽기전용) */}
              <div className="flex gap-2 mb-2">
                <input
                  value={biz.addrRoad}
                  readOnly
                  placeholder="도로명 주소(주소 검색으로 입력)"
                  className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg bg-slate-50 text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => setOpenPostcode(true)}
                  className="px-4 border-2 border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50"
                >
                  검색
                </button>
              </div>

              {/* 상세주소(직접 입력, nullable) */}
              <input
                value={biz.addrDetail}
                onChange={(e) =>
                  setBiz((s) => ({ ...s, addrDetail: e.target.value }))
                }
                placeholder="상세주소 (선택)"
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg"
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
                disabled={!isBusinessInfoValid || isSubmitting}
                className="flex-1 next-button text-white py-3 rounded-md font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent inline-block mr-2" />
                    가입 중...
                  </>
                ) : (
                  '가입하기'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 다음 주소검색 모달 */}
      {openPostcode && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <strong className="text-slate-800">주소 검색</strong>
              <button
                onClick={() => setOpenPostcode(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                닫기
              </button>
            </div>
            <div className="p-2">
              <DaumPostcode
                onComplete={handleCompletePostcode}
                style={{ width: '100%', height: 470 }}
              />
            </div>
          </div>
        </div>
      )}

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

      <BusinessCertUploadSheet
        open={showBizUpload}
        onClose={() => setShowBizUpload(false)}
        onSelectFile={() => setShowBizUpload(false)}
      />

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
