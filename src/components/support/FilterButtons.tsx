import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { colors } from '../../styles/colors';

type MainFilter = 'none' | 'filter' | 'map' | 'receiving' | 'bookmark' | 'announcements';

type FilterButtonsProps = {
  activeMainFilter: MainFilter;
  onFilterClick: () => void;
  onMapClick: () => void;
  onReceivingClick: () => void;
  onBookmarkClick: () => void;
  onAnnouncementsClick: () => void;
};

const FilterButtons: React.FC<FilterButtonsProps> = ({
  activeMainFilter,
  onFilterClick,
  onMapClick,
  onReceivingClick,
  onBookmarkClick,
  onAnnouncementsClick,
}) => {
  return (
    <div className="flex gap-1.5 mb-4 w-full max-w-md px-2">
      <button
        className="px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 flex items-center gap-1 transform"
        style={{
          backgroundColor: activeMainFilter === 'filter' ? colors.navy : 'white',
          color: activeMainFilter === 'filter' ? 'white' : colors.navy,
        }}
        onClick={onFilterClick}
      >
        <SlidersHorizontal size={14} className="transition-transform duration-200" />
        <span>필터</span>
      </button>
      <button
        className="px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 transform"
        style={{
          backgroundColor: activeMainFilter === 'map' ? colors.navy : 'white',
          color: activeMainFilter === 'map' ? 'white' : colors.navy,
        }}
        onClick={onMapClick}
      >
        내센터
      </button>
      <button
        className="px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 transform"
        style={{
          backgroundColor: activeMainFilter === 'receiving' ? colors.navy : 'white',
          color: activeMainFilter === 'receiving' ? 'white' : colors.navy,
        }}
        onClick={onReceivingClick}
      >
        접수중
      </button>
      <button
        className="px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 transform"
        style={{
          backgroundColor: activeMainFilter === 'announcements' ? colors.navy : 'white',
          color: activeMainFilter === 'announcements' ? 'white' : colors.navy,
        }}
        onClick={onAnnouncementsClick}
      >
        맞춤공고
      </button>
      <button
        className="w-8 h-8 rounded-lg font-medium flex items-center justify-center shadow-sm transition-all duration-200 hover:shadow-md hover:scale-110 active:scale-95 transform"
        style={{
          backgroundColor: activeMainFilter === 'bookmark' ? colors.navy : 'white',
        }}
        aria-label="북마크"
        onClick={onBookmarkClick}
      >
        <span 
          className="text-sm transition-all duration-200 hover:animate-pulse"
          style={{ 
            color: activeMainFilter === 'bookmark' ? '#FFD700' : '#FFC107'
          }}
        >
          ★
        </span>
      </button>
    </div>
  );
};

export default FilterButtons;