import React from 'react';
import TermsAgreement from '@/components/auth/TermsAgreement';

export type Agreements = { terms: boolean; privacy: boolean };

type Props = {
  totalSteps: number;
  value: Agreements;
  onChange: (v: Agreements) => void;
  onPrev: () => void;
  onNext: () => void;
};

const StepTerms: React.FC<Props> = ({ totalSteps, value, onChange, onPrev, onNext }) => {
  const allAgreed = value.terms && value.privacy;
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative">
      <div className="absolute top-6 right-6">
        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">{`2/${totalSteps}`}</span>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">약관 동의</h2>
        <p className="text-slate-600 text-sm">서비스 이용을 위해 약관에 동의해주세요</p>
      </div>

      <TermsAgreement value={value} onChange={onChange} />

      <div className="flex gap-3">
        <button onClick={onPrev} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-md font-bold text-sm transition-all duration-200 hover:bg-slate-300">이전</button>
        <button onClick={onNext} disabled={!allAgreed} className="flex-1 next-button text-white py-3 rounded-md font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">다음</button>
      </div>
    </div>
  );
};

export default StepTerms;
