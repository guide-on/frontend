import React from 'react';

type MainFilter = 'none' | 'filter' | 'map' | 'receiving' | 'bookmark';

type FilterButtonsProps = {
  activeMainFilter: MainFilter;
  onFilterClick: () => void;
  onMapClick: () => void;
  onReceivingClick: () => void;
  onBookmarkClick: () => void;
};

const FilterButtons: React.FC<FilterButtonsProps> = ({
  activeMainFilter,
  onFilterClick,
  onMapClick,
  onReceivingClick,
  onBookmarkClick,
}) => {
  return (
    <div className="flex gap-2 mb-4 w-full max-w-md px-2">
      <button
        className={`px-3 py-2 rounded text-xs font-semibold ${
          activeMainFilter === 'filter' ? 'bg-navy text-white' : 'bg-gray-200'
        }`}
        onClick={onFilterClick}
      >
        :: 필터
      </button>
      <button
        className={`px-3 py-2 rounded text-xs font-semibold ${
          activeMainFilter === 'map' ? 'bg-navy text-white' : 'bg-gray-200'
        }`}
        onClick={onMapClick}
      >
        내센터
      </button>
      <button
        className={`px-3 py-2 rounded text-xs font-semibold ${
          activeMainFilter === 'receiving' ? 'bg-navy text-white' : 'bg-gray-200'
        }`}
        onClick={onReceivingClick}
      >
        접수중
      </button>
      <button
        className={`px-3 py-2 rounded text-xl font-semibold flex items-center justify-center ${
          activeMainFilter === 'bookmark' ? 'bg-navy text-white' : 'bg-gray-200'
        }`}
        aria-label="북마크"
        onClick={onBookmarkClick}
      >
        <span className="text-yellow-400">★</span>
      </button>
    </div>
  );
};

export default FilterButtons;