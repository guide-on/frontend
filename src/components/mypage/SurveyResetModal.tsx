import React from 'react';
import { colors } from '@/styles/colors';

interface SurveyResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const SurveyResetModal: React.FC<SurveyResetModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
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
          <h3 className="text-lg font-bold mb-4">설문 초기화</h3>
          
          <div className="text-sm text-gray-600 mb-4">
            이전에 했던 설문이 초기화됩니다.<br />
            정말 초기화하시겠습니까?
          </div>
        </div>
        
        {/* 버튼들 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 rounded-lg font-semibold border"
            style={{ 
              borderColor: colors.navy, 
              color: colors.navy,
              opacity: isLoading ? 0.5 : 1
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded-lg font-semibold text-white"
            style={{ 
              backgroundColor: isLoading ? '#9ca3af' : '#ef4444' 
            }}
          >
            {isLoading ? '초기화 중...' : '초기화'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyResetModal;