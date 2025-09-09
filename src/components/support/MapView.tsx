import React from 'react';
import KakaoMap from './KakaoMap';
import SupportCenterCard from './SupportCenterCard';
import type { SupportCenter, NearestCentersData } from '../../types/support';

type MapViewProps = {
  mapLoading: boolean;
  allCenters: SupportCenter[];
  selectedCenter: SupportCenter | null;
  nearestData: NearestCentersData | null;
  businessAddress: string | null;
  onCenterSelect: (center: SupportCenter) => void;
  onCenterMarkerClick: (center: SupportCenter) => Promise<void>;
};

const MapView: React.FC<MapViewProps> = ({
  mapLoading,
  allCenters,
  selectedCenter,
  nearestData,
  businessAddress,
  onCenterSelect,
  onCenterMarkerClick,
}) => {
  if (mapLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center text-gray-400 py-8">. . .</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 다른 센터 보기 드롭다운 */}
      {allCenters.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            다른 센터 보기
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            value={selectedCenter?.id || ''}
            onChange={(e) => {
              const centerId = parseInt(e.target.value);
              const center = allCenters.find(c => c.id === centerId);
              if (center) onCenterSelect(center);
            }}
          >
            {nearestData && nearestData.nearestCenters.length > 0 && (
              <option value={nearestData.nearestCenters[0].center.id}>
                🎯 {nearestData.nearestCenters[0].center.name} (가장 가까운 센터)
              </option>
            )}
            {allCenters
              .filter(center => 
                !nearestData || 
                !nearestData.nearestCenters.find(nc => nc.center.id === center.id)
              )
              .map(center => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))
            }
          </select>
        </div>
      )}

      {/* 카카오맵 */}
      <KakaoMap
        businessLocation={nearestData ? {
          lat: nearestData.businessLat,
          lng: nearestData.businessLng
        } : undefined}
        centerLocation={selectedCenter ? {
          lat: selectedCenter.lat,
          lng: selectedCenter.lng
        } : undefined}
        center={selectedCenter}
        onCenterMarkerClick={onCenterMarkerClick}
        className="w-full h-48 rounded-xl"
      />

      {/* 주소 미등록 안내 */}
      {!businessAddress && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
          <div className="font-medium text-yellow-800 mb-1">
            ⚠️ 사업장 주소 미등록
          </div>
          <div className="text-yellow-700">
            정확한 가까운 센터 조회를 위해 사업장 주소를 등록해주세요.
          </div>
        </div>
      )}

      {/* 센터 상세 정보 카드 */}
      {selectedCenter && (
        <SupportCenterCard
          center={selectedCenter}
          distance={
            nearestData 
              ? nearestData.nearestCenters.find(nc => nc.center.id === selectedCenter.id)?.distanceKm
              : undefined
          }
          businessAddress={businessAddress || undefined}
        />
      )}
    </div>
  );
};

export default MapView;