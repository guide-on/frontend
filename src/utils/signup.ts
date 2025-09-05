import type { MemberCreatePayload } from '@/api/memberApi';

export type Agreements = {
  terms: boolean;
  privacy: boolean;
};

export type MemberType = 'GENERAL' | 'SOLE_PROPRIETOR';

export type BusinessInfoUI = {
  bno1: string;
  bno2: string;
  bno3: string;
  bizName: string;
  ksicCode: string; // 표준산업분류 코드 (백엔드 전송용)
  ksicName?: string; // 사용자 표시용 업종명
  openDate: string;
  businessSggCode: string;
  addrRoad: string;
  addrDetail: string;
};

export type PreferenceInfo = {
  regionCodes?: string[];
  industryTags?: string[];
};

export type Gender = 'MALE' | 'FEMALE';

export type MemberBase = {
  memberType: MemberType;
  email: string;
  password: string;
  name: string;
  phone: string;
  gender: Gender;
  birth: string;
  residenceSggCode?: string;
};

export const normalizePreference = (pref?: PreferenceInfo) => {
  if (!pref) return undefined;
  const regionOk = Array.isArray(pref.regionCodes) && pref.regionCodes.length > 0;
  const industryOk = Array.isArray(pref.industryTags) && pref.industryTags.length > 0;
  if (!regionOk && !industryOk) return undefined;
  return {
    ...(regionOk ? { regionCodes: pref.regionCodes } : {}),
    ...(industryOk ? { industryTags: pref.industryTags } : {}),
  };
};

export const buildBusinessNo = (b1: string, b2: string, b3: string, withHyphen = false) => {
  const n1 = (b1 || '').replace(/\D/g, '').slice(0, 3);
  const n2 = (b2 || '').replace(/\D/g, '').slice(0, 2);
  const n3 = (b3 || '').replace(/\D/g, '').slice(0, 5);
  return withHyphen ? `${n1}-${n2}-${n3}` : `${n1}${n2}${n3}`;
};

export const buildSignupPayload = (args: {
  memberType: MemberType;
  base: Omit<MemberBase, 'memberType'>;
  preference?: PreferenceInfo;
  business?: BusinessInfoUI;
}): MemberCreatePayload => {
  const { memberType, base, preference, business } = args;

  if (memberType === 'SOLE_PROPRIETOR') {
    if (!business) throw new Error('사업자 회원은 사업 정보가 필수입니다.');
    const bizRegNo = buildBusinessNo(business.bno1, business.bno2, business.bno3, false);
    return {
      memberType,
      ...base,
      business: {
        bizRegNo,
        bizName: business.bizName,
        ksicCode: business.ksicCode,
        openDate: business.openDate,
        businessSggCode: business.businessSggCode,
        addrRoad: business.addrRoad,
        addrDetail: business.addrDetail || null,
      },
    };
  }

  const pref = normalizePreference(preference);
  return {
    memberType,
    ...base,
    ...(pref ? { preference: pref } : {}),
  };
};
