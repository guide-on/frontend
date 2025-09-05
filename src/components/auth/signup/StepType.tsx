import React from 'react';
import type { MemberType } from '@/utils/signup';

type Props = {
  totalSteps: number;
  memberType: MemberType | null;
  onSelect: (t: MemberType) => void;
  onNext: () => void;
};

const StepType: React.FC<Props> = ({ totalSteps, memberType, onSelect, onNext }) => {
  const isSelected = !!memberType;
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative">
      <div className="absolute top-6 right-6">
        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">{`1/${totalSteps}`}</span>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-1">회원가입 유형</h2>
        <p className="text-slate-600 text-sm">가입할 서비스 유형을 선택해주세요</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => onSelect('GENERAL')}
          className={`border-2 rounded-xl py-7 flex flex-col items-center gap-4 transition-all ${memberType === 'GENERAL' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <i className="fa-solid fa-user fa-4x text-slate-700"></i>
          <span className="font-semibold text-md">일반 회원</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect('SOLE_PROPRIETOR')}
          className={`border-2 rounded-xl py-7 flex flex-col items-center gap-4 transition-all ${memberType === 'SOLE_PROPRIETOR' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <i className="fa-solid fa-store fa-4x text-slate-700"></i>
          <span className="font-semibold">사업자 회원</span>
        </button>
      </div>
      <button onClick={onNext} disabled={!isSelected} className="next-button w-full text-white py-3 rounded-md font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">다음</button>
    </div>
  );
};

export default StepType;
