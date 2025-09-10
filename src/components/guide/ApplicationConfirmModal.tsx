import React from 'react';
import { colors } from '@/styles/colors';

interface ApplicationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  policyName: string;
  isApplying: boolean;
}

const ApplicationConfirmModal: React.FC<ApplicationConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  policyName,
  isApplying,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl">
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold mb-2">대출 신청 확인</h3>
          
          <div className="text-sm text-gray-600 mb-4">
            대출가이드는 다음과 같이 이뤄집니다
          </div>
          
          {/* 단계 표시 */}
          <div className="flex justify-center items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: colors.navy }}
                >
                  1
                </div>
                <span className="text-[10px] mt-1 text-gray-600">서류 검증</span>
              </div>
              
              <div className="w-6 h-0.5 bg-gray-300" />
              
              <div className="flex flex-col items-center">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: colors.navy }}
                >
                  2
                </div>
                <span className="text-[10px] mt-1 text-gray-600">신용도 확인</span>
              </div>
              
              <div className="w-6 h-0.5 bg-gray-300" />
              
              <div className="flex flex-col items-center">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: colors.navy }}
                >
                  3
                </div>
                <span className="text-[10px] mt-1 text-gray-600">사업계획서 평가</span>
              </div>
              
              <div className="w-6 h-0.5 bg-gray-300" />
              
              <div className="flex flex-col items-center">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: colors.navy }}
                >
                  4
                </div>
                <span className="text-[10px] mt-1 text-gray-600">결과 확인</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            해당 자금을 신청할 경우,<br />
            다른 지원자금은 중복 신청할 수 없습니다.
          </div>
          
          <div className="text-sm text-gray-800 font-medium">
            <span className="font-bold">{policyName}</span>을 신청하시겠습니까?
          </div>
        </div>
        
        {/* 버튼들 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isApplying}
            className="flex-1 py-3 rounded-lg font-semibold border"
            style={{ 
              borderColor: colors.navy, 
              color: colors.navy,
              opacity: isApplying ? 0.5 : 1
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isApplying}
            className="flex-1 py-3 rounded-lg font-semibold text-white"
            style={{ 
              backgroundColor: isApplying ? '#9ca3af' : colors.navy 
            }}
          >
            {isApplying ? '신청 중...' : '신청하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationConfirmModal;