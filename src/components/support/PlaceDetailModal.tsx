import React, { useState } from 'react';

type PlaceDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  place: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  } | null;
};

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  isOpen,
  onClose,
  place,
}) => {
  const [iframeError, setIframeError] = useState(false);

  if (!isOpen || !place) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-2xl w-full max-w-sm h-[70vh] flex flex-col">
        {/* 헤더 - 축소 */}
        <div className="flex justify-between items-center p-3 border-b flex-shrink-0">
          <h3 className="text-base font-bold text-gray-800 truncate">
            {place.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg ml-2"
          >
            ✕
          </button>
        </div>

        {/* 카카오맵 상세보기 iframe */}
        <div className="flex-1 overflow-hidden">
          {!iframeError ? (
            <iframe
              src={`https://place.map.kakao.com/${place.id}`}
              className="w-full h-full border-0"
              title="카카오맵 상세보기"
              onError={() => setIframeError(true)}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500">
              <div className="text-xl mb-4">🗺️</div>
              <div className="text-sm mb-4">상세보기를 불러올 수 없습니다</div>
              <div className="flex gap-2">
                <a
                  href={`https://place.map.kakao.com/${place.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                >
                  🗺️ 카카오맵에서 보기
                </a>
                <a
                  href={`https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  🚗 길찾기
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailModal;
