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
};

const FundCard: React.FC<{
  item: FundListItem;
  onDetailClick: (id: number) => void;
  onBookmarkClick: (id: number, saved: boolean) => void;
}> = ({ item, onDetailClick, onBookmarkClick }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-3 border border-gray-100 cursor-pointer hover:shadow-lg transition relative"
      onClick={() => onDetailClick(item.id)}
      style={{ borderColor: '#f0f2f5' }}
    >
      {/* 북마크 버튼 */}
      <button
        className="absolute top-4 right-4 text-2xl focus:outline-none z-10"
        onClick={(e) => {
          e.stopPropagation();
          onBookmarkClick(item.id, item.saved);
        }}
        aria-label="북마크"
      >
        {item.saved ? (
          <span className="text-yellow-400">★</span>
        ) : (
          <span className="text-gray-300 hover:text-yellow-400">☆</span>
        )}
      </button>

      <div className="flex items-center gap-2">
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${
            item.status === '마감'
              ? 'bg-gray-200 text-gray-500'
              : 'bg-navy text-white'
          }`}
          style={{
            backgroundColor:
              item.status === '마감' ? colors.gray : colors.navy,
          }}
        >
          {item.status}
        </span>
        <span className="text-xs font-semibold text-gray-500">대리대출</span>
      </div>

      <div className="font-bold text-lg text-gray-800 pr-8">{item.name}</div>
    </div>
  );
};

export default FundCard;
