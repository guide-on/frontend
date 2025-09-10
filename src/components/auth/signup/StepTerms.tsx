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

const StepTerms: React.FC<Props> = ({
  value,
  onChange,
  onPrev,
  onNext,
}) => {
  const allAgreed = value.terms && value.privacy;
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">약관 동의</h2>
        <p className="text-gray-600 text-sm">
          서비스 이용을 위해 약관에 동의해주세요
        </p>
      </div>

      <div className="mb-8">
        <TermsAgreement value={value} onChange={onChange} />
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
          disabled={!allAgreed}
          className="flex-1 next-button text-white py-4 rounded-xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음 단계로
        </button>
      </div>
    </div>
  );
};

export default StepTerms;
