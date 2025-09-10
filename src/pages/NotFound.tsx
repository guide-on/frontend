import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../styles/colors';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: colors.bgSoft }}
    >
      <div className="text-center max-w-sm mx-auto">
        {/* 404 큰 숫자 */}
        <div
          className="text-8xl font-black mb-4"
          style={{ color: colors.navy }}
        >
          404
        </div>

        {/* 메인 메시지 */}
        <h1 className="text-2xl font-bold mb-3 text-gray-800">
          페이지를 찾을 수 없어요
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          요청하신 페이지가 존재하지 않거나
          <br />
          이동되었을 수 있어요
        </p>

        {/* 자동 리다이렉트 안내 */}
        <div className="mb-8">
          <div
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: colors.paleBlue, color: colors.navy }}
          >
            <svg
              className="w-4 h-4 mr-2 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {countdown}초 후 홈으로 자동 이동
          </div>
        </div>

        {/* 홈으로 이동 버튼 */}
        <button
          onClick={handleGoHome}
          className="w-full py-3 px-6 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
          style={{ backgroundColor: colors.navy }}
        >
          홈으로 이동하기
        </button>

        {/* 장식 요소 */}
        <div className="mt-12 opacity-30">
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: colors.lightBlue,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
