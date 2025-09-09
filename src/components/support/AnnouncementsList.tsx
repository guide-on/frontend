import React from 'react';
import AnnouncementCard from './AnnouncementCard';
import type { Announcement } from '../../api/announcementApi';

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
      <div className="flex flex-col gap-3">
        <div className="text-center text-gray-400 py-8">. . .</div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-center text-gray-400 py-8">
          맞춤 공고가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          item={announcement}
          onDetailClick={onDetailClick}
        />
      ))}
    </div>
  );
};

export default AnnouncementsList;