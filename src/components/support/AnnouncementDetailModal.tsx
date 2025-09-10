import React from 'react';
import { createPortal } from 'react-dom';
import { colors } from '../../styles/colors';
import type { Announcement } from '../../api/announcementApi';

interface AnnouncementDetailModalProps {
  open: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({
  open,
  onClose,
  announcement,
}) => {
  if (!open || !announcement) return null;
  
  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="w-full max-w-sm rounded-3xl p-6 relative shadow-xl flex flex-col overflow-hidden" style={{ backgroundColor: colors.bgSoft, maxHeight: '80vh' }}>
        
        <h2 className="font-bold text-xl mb-4 text-gray-800 leading-snug" style={{ color: colors.navy }}>{announcement.title}</h2>

        <div className="flex-grow overflow-y-auto no-scrollbar pr-2">
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.gray }}>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">상태: </span>
              <span className={`font-bold ${announcement.applyStatus === '마감' ? 'text-red-500' : 'text-green-600'}`}>
                {announcement.applyStatus}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">분류: </span>
              <span className="text-gray-800">{announcement.category}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">담당기관</p>
              <p className="font-semibold text-sm text-gray-800">{announcement.agency}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">신청기간</p>
              <p className="font-semibold text-sm text-gray-800">{announcement.applyPeriod}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">사업기간</p>
              <p className="font-semibold text-sm text-gray-800">{announcement.projectPeriod}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">대상</p>
              <p className="font-semibold text-sm text-gray-800">{announcement.target}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">지역</p>
              <p className="font-semibold text-sm text-gray-800">{announcement.region}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">업종</p>
              <p className="font-semibold text-sm text-gray-800">{announcement.industry}</p>
            </div>
            {announcement.description && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">사업내용</p>
                <p className="font-semibold text-sm text-gray-800">{announcement.description}</p>
              </div>
            )}
            {announcement.attachments && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">첨부파일</p>
                <p className="font-semibold text-sm text-gray-800">{announcement.attachments}</p>
              </div>
            )}
          </div>
        </div>

        <button
          className="mt-4 py-3 rounded-lg text-white text-lg font-semibold w-full"
          style={{ backgroundColor: colors.navy }}
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>,
    document.body
  );
};

export default AnnouncementDetailModal;