import React from 'react';
import { colors } from '../../styles/colors';

type FundListItem = {
  id: number;
  name: string;
  status: string;
  target: string;
  rate: string;
  term: string;
  limitAmount: string;
  saved: boolean;
  loanType: '대리대출' | '직접대출';
};

const FundCard: React.FC<{
  item: FundListItem;
  onDetailClick: (id: number) => void;
  onBookmarkClick: (id: number, saved: boolean) => void;
}> = ({ item, onDetailClick, onBookmarkClick }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-3 border border-gray-100 cursor-pointer hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 relative transform animate-fade-in"
      onClick={() => onDetailClick(item.id)}
      style={{ borderColor: '#f0f2f5' }}
    >
      {/* 북마크 버튼 */}
      <button
        className="absolute top-4 right-4 text-2xl focus:outline-none z-10 transition-all duration-200 hover:scale-125 active:scale-95"
        onClick={(e) => {
          e.stopPropagation();
          onBookmarkClick(item.id, item.saved);
        }}
        aria-label="북마크"
      >
        {item.saved ? (
          <span className="text-yellow-400 animate-pulse">★</span>
        ) : (
          <span className="text-gray-300 hover:text-yellow-400 transition-colors duration-200">☆</span>
        )}
      </button>

      <div className="flex items-center gap-2 animate-slide-down">
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
            item.status === '마감'
              ? 'bg-gray-200 text-gray-500'
              : 'bg-navy text-white hover:shadow-md'
          }`}
          style={{
            backgroundColor:
              item.status === '마감' ? colors.gray : colors.navy,
          }}
        >
          {item.status}
        </span>
        <span 
          className="text-xs font-semibold animate-fade-in px-2 py-1 rounded-full"
          style={{
            backgroundColor: item.loanType === '대리대출' 
              ? 'rgba(239, 68, 68, 0.1)' 
              : 'rgba(59, 130, 246, 0.1)',
            color: item.loanType === '대리대출' 
              ? '#dc2626' 
              : colors.blue
          }}
        >
          {item.loanType}
        </span>
      </div>

      <div className="font-bold text-lg text-gray-800 pr-8 animate-slide-up">{item.name}</div>
    </div>
  );
};

export default FundCard;
