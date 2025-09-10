import React from 'react';
import AnnouncementCard from './AnnouncementCard';
import type { Announcement } from '../../api/announcementApi';
import LoadingSpinner from '../common/LoadingSpinner';

type AnnouncementsListProps = {
  announcements: Announcement[];
  loading: boolean;
  onDetailClick: (id: number) => void;
};

const AnnouncementsList: React.FC<AnnouncementsListProps> = ({
  announcements,
  loading,
  onDetailClick,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 animate-fade-in">
        <div className="text-center py-8">
          <LoadingSpinner type="dots" color="#25437B" />
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="flex flex-col gap-3 animate-fade-in">
        <div className="text-center text-gray-400 py-8 animate-bounce-in">
          맞춤 공고가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      {announcements.map((announcement, index) => (
        <div 
          key={announcement.id} 
          className="animate-slide-up"
          style={{animationDelay: `${index * 0.1}s`}}
        >
          <AnnouncementCard
            item={announcement}
            onDetailClick={onDetailClick}
          />
        </div>
      ))}
    </div>
  );
};

export default AnnouncementsList;