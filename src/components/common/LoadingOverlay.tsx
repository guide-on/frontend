import React from 'react';

type Props = { message?: string };

const LoadingOverlay: React.FC<Props> = ({ message = '처리 중...' }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-5 shadow-2xl">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-700">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
