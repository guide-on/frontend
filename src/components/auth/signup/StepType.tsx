import React from 'react';
import type { MemberType } from '@/utils/signup';
import { colors } from '@/styles/colors';

type Props = {
  totalSteps: number;
  memberType: MemberType | null;
  onSelect: (t: MemberType) => void;
  onNext: () => void;
};

const StepType: React.FC<Props> = ({
  memberType,
  onSelect,
  onNext,
}) => {
  const isSelected = !!memberType;
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">회원가입 유형</h2>
        <p className="text-gray-600 text-sm">
          가입할 서비스 유형을 선택해주세요
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 mb-8">
        <button
          type="button"
          onClick={() => onSelect('GENERAL')}
          className={`selection-button p-6 flex items-center gap-4 text-left transition-all duration-200 ${
            memberType === 'GENERAL' ? 'selected' : ''
          }`}
        >
          <div className="flex-shrink-0">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                backgroundColor: memberType === 'GENERAL' ? colors.paleBlue : '#f3f4f6',
                color: memberType === 'GENERAL' ? colors.navy : '#6b7280'
              }}
            >
              <i className="fa-solid fa-user fa-xl"></i>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">일반 회원</h3>
            <p className="text-sm text-gray-600 mt-1">개인 사용자로 서비스를 이용합니다</p>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => onSelect('SOLE_PROPRIETOR')}
          className={`selection-button p-6 flex items-center gap-4 text-left transition-all duration-200 ${
            memberType === 'SOLE_PROPRIETOR' ? 'selected' : ''
          }`}
        >
          <div className="flex-shrink-0">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                backgroundColor: memberType === 'SOLE_PROPRIETOR' ? colors.paleBlue : '#f3f4f6',
                color: memberType === 'SOLE_PROPRIETOR' ? colors.navy : '#6b7280'
              }}
            >
              <i className="fa-solid fa-store fa-xl"></i>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">사업자 회원</h3>
            <p className="text-sm text-gray-600 mt-1">사업자로서 서비스를 이용합니다</p>
          </div>
        </button>
      </div>
      
      <button
        onClick={onNext}
        disabled={!isSelected}
        className="next-button w-full text-white py-4 rounded-xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음 단계로
      </button>
    </div>
  );
};

export default StepType;
