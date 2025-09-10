import React from 'react';
import { colors } from '@/styles/colors';

type Props = { message?: string };

const LoadingOverlay: React.FC<Props> = ({ message = '처리 중...' }) => {
  const isOCR = message?.includes('분석') || message?.includes('OCR');
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 rounded-3xl bg-white/95 backdrop-blur-sm border border-white/50 px-8 py-8 shadow-2xl max-w-sm mx-4">
        {/* OCR 전용 애니메이션 */}
        {isOCR ? (
          <div className="relative">
            {/* 문서 아이콘 */}
            <div className="relative w-16 h-20 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 shadow-lg">
              {/* 문서 내용 라인들 */}
              <div className="absolute top-3 left-2 right-2 space-y-1">
                <div className="h-1 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-1 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-1 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <div className="h-1 bg-gray-300 rounded w-3/4 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
              </div>
              
              {/* 스캔 라인 애니메이션 */}
              <div 
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80"
                style={{
                  animation: 'scan 2s linear infinite',
                }}
              ></div>
            </div>
            
            {/* 회전하는 원형 스피너 */}
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            {/* 파티클 효과 */}
            <div className="absolute inset-0">
              <div className="absolute top-2 right-1 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-4 left-1 w-1 h-1 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-3 right-2 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        ) : (
          /* 기본 스피너 */
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-3 border-gray-200"></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-3 border-transparent animate-spin" style={{ borderTopColor: colors.navy }}></div>
          </div>
        )}
        
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-800">{message}</p>
          {isOCR && (
            <p className="text-sm text-gray-500">잠시만 기다려주세요...</p>
          )}
        </div>
        
        {/* 진행 표시 점들 */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 12px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 72px; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
