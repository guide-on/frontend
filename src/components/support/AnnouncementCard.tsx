import React from 'react';
import { colors } from '../../styles/colors';
import type { Announcement } from '../../api/announcementApi';

const AnnouncementCard: React.FC<{
  item: Announcement;
  onDetailClick: (id: number) => void;
}> = ({ item, onDetailClick }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-3 border border-gray-100 cursor-pointer hover:shadow-lg transition relative"
      onClick={() => onDetailClick(item.id)}
      style={{ borderColor: '#f0f2f5' }}
    >
      <div className="flex items-center gap-2">
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${
            item.applyStatus === '마감'
              ? 'bg-gray-200 text-gray-500'
              : 'bg-green-500 text-white'
          }`}
          style={{
            backgroundColor:
              item.applyStatus === '마감' ? colors.gray : '#10B981',
          }}
        >
          {item.applyStatus}
        </span>
        <span className="text-xs font-semibold text-gray-500">{item.category}</span>
      </div>

      <div className="font-bold text-lg text-gray-800 pr-4 leading-snug">{item.title}</div>
      
      <div className="flex flex-col gap-1 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <span className="font-medium">신청기간</span>
          <span className="text-xs">{item.applyPeriod}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">담당기관</span>
          <span className="text-xs">{item.agency}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">대상</span>
          <span className="text-xs">{item.target}</span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;