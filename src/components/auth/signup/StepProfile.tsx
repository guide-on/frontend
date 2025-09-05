import React from 'react';
import PhoneVerification from '@/components/verification/PhoneVerification';
import type { MemberType } from '@/utils/signup';

type Props = {
  totalSteps: number;
  memberType: MemberType | null;
  name: string;
  gender?: 'MALE' | 'FEMALE';
  birth: string;
  phone: string;
  setName: (v: string) => void;
  setGender: (v: 'MALE' | 'FEMALE') => void;
  setBirth: (v: string) => void;
  setPhone: (v: string) => void;
  phoneVerified: boolean;
  setPhoneVerified: (v: boolean) => void;
  isValid: boolean;
  onPrev: () => void;
  onNextGeneral: () => void;
  onNextSole: () => void;
};

const StepProfile: React.FC<Props> = ({
  totalSteps,
  memberType,
  name,
  gender,
  birth,
  phone,
  setName,
  setGender,
  setBirth,
  setPhone,
  phoneVerified,
  setPhoneVerified,
  isValid,
  onPrev,
  onNextGeneral,
  onNextSole,
}) => {
  const isSole = memberType === 'SOLE_PROPRIETOR';
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative">
      <div className="absolute top-6 right-6">
        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">{`4/${totalSteps}`}</span>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">개인 정보</h2>
        <p className="text-slate-600 text-sm">서비스 이용을 위한 기본 정보를 입력해주세요.</p>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ps-1">이름</label>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="이름 입력" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-slate-700 text-md" />
        </div>

        <div>
          <label className="flex text-sm font-semibold text-slate-700 mb-1.5 ps-1">성별</label>
          <div className="flex gap-6 ps-1.5">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" value="MALE" checked={gender === 'MALE'} onChange={() => setGender('MALE')} className="w-3.5 h-3.5 text-blue-600 border-2 border-slate-300 focus:ring-blue-500" />
              <span className="text-slate-700 font-medium">남자</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" value="FEMALE" checked={gender === 'FEMALE'} onChange={() => setGender('FEMALE')} className="w-3.5 h-3.5 text-blue-600 border-2 border-slate-300 focus:ring-blue-500" />
              <span className="text-slate-700 font-medium">여자</span>
            </label>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ps-1">생년월일</label>
          <input value={birth} onChange={(e) => setBirth(e.target.value)} type="date" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-slate-700 text-sm" style={{ fontSize: 16, minHeight: 48 }} />
        </div>

        <PhoneVerification value={phone} onChange={setPhone} onVerified={setPhoneVerified} verified={phoneVerified} />
      </div>

      <div className="flex gap-3">
        <button onClick={onPrev} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-md font-bold text-sm transition-all duration-200 hover:bg-slate-300">이전</button>
        {isSole ? (
          <button onClick={onNextSole} disabled={!isValid} className="flex-1 next-button text-white py-3 rounded-md font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">다음</button>
        ) : (
          <button onClick={onNextGeneral} disabled={!isValid} className="flex-1 next-button text-white py-3 rounded-md font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">다음</button>
        )}
      </div>
    </div>
  );
};

export default StepProfile;
