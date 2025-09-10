import React from 'react';

type SupportCenter = {
  id: number;
  name: string;
  jurisdiction: string;
  address: string;
  phone: string;
  fax: string;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
};

type SupportCenterCardProps = {
  center: SupportCenter;
  distance?: number;
  businessAddress?: string;
};

const SupportCenterCard: React.FC<SupportCenterCardProps> = ({
  center,
  distance,
  businessAddress,
}) => {

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 animate-slide-up transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1">
      {/* 사업장 주소 태그 */}
      {businessAddress && (
        <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-4 animate-fade-in transition-all duration-200 hover:bg-blue-100">
          <span>🏢</span>
          <span>등록 사업장: {businessAddress}</span>
        </div>
      )}
      
      {/* 센터명과 거리 */}
      <div className="mb-4 flex justify-between items-center animate-fade-in">
        <h3 className="font-bold text-xl text-gray-800 leading-tight flex-1">
          {center.name}
        </h3>
        {distance && (
          <div className="inline-flex bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-semibold ml-2 animate-pulse-soft transition-all duration-200 hover:bg-green-100">
            {distance}km
          </div>
        )}
      </div>
      
      {/* 정보 카드들 */}
      <div className="space-y-3 mb-4">
        {/* 관할 구역 */}
        <div className="bg-gray-50 rounded-lg p-3 transition-all duration-200 hover:bg-gray-100 hover:shadow-md animate-slide-up">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-500 animate-bounce-soft">📍</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">관할구역</span>
          </div>
          <div className="text-sm text-gray-700 font-medium">
            {center.jurisdiction}
          </div>
        </div>
        
        {/* 주소 */}
        <div className="bg-gray-50 rounded-lg p-3 transition-all duration-200 hover:bg-gray-100 hover:shadow-md animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-500 animate-bounce-soft">🏠</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">주소</span>
          </div>
          <div className="text-sm text-gray-700">
            {center.address}
          </div>
        </div>
        
        {/* 연락처 */}
        <div className="bg-gray-50 rounded-lg p-3 transition-all duration-200 hover:bg-gray-100 hover:shadow-md animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-500 animate-bounce-soft">📞</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">연락처</span>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-700 font-medium">
              전화: {center.phone}
            </div>
            {center.fax && (
              <div className="text-sm text-gray-600">
                팩스: {center.fax}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default SupportCenterCard;