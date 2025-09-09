import React from 'react';
import FundCard from './FundCard';
import type { FundListItem } from '../../types/support';

type FundsListProps = {
  funds: FundListItem[];
  bookmarkFunds: FundListItem[];
  loading: boolean;
  bookmarkLoading: boolean;
  isBookmarkMode: boolean;
  onDetailClick: (id: number) => void;
  onBookmarkClick: (id: number, saved: boolean) => void;
};

const FundsList: React.FC<FundsListProps> = ({
  funds,
  bookmarkFunds,
  loading,
  bookmarkLoading,
  isBookmarkMode,
  onDetailClick,
  onBookmarkClick,
}) => {
  if (isBookmarkMode) {
    return (
      <div className="flex flex-col gap-3">
        {bookmarkLoading && (
          <div className="text-center text-gray-400 py-8">. . .</div>
        )}
        {!bookmarkLoading && bookmarkFunds.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            북마크한 지원금이 없습니다.
          </div>
        )}
        {bookmarkFunds.map((item) => (
          <FundCard
            key={item.id}
            item={item}
            onDetailClick={onDetailClick}
            onBookmarkClick={onBookmarkClick}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {loading && (
        <div className="text-center text-gray-400 py-8">. . .</div>
      )}
      {!loading && funds.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          지원금 정보가 없습니다.
        </div>
      )}
      {funds.map((item) => (
        <FundCard
          key={item.id}
          item={item}
          onDetailClick={onDetailClick}
          onBookmarkClick={onBookmarkClick}
        />
      ))}
    </div>
  );
};

export default FundsList;