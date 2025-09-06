import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

type KakaoMapProps = {
  businessLocation?: { lat: number; lng: number };
  centerLocation?: { lat: number; lng: number };
  center?: any; // 센터 정보
  onCenterMarkerClick?: (center: any) => void; // 센터 마커 클릭 콜백
  className?: string;
};

const KakaoMap: React.FC<KakaoMapProps> = ({
  businessLocation,
  centerLocation,
  center,
  onCenterMarkerClick,
  className = 'w-full h-48',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const businessMarker = useRef<any>(null);
  const centerMarker = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      const { kakao } = window;
      if (!kakao || !kakao.maps) {
        console.error('카카오맵 API가 로드되지 않음');
        return;
      }

      // 기본 좌표 (센터가 있으면 센터, 없으면 기본값)
      const defaultLat = centerLocation?.lat || 37.5665;
      const defaultLng = centerLocation?.lng || 126.978;

      const options = {
        center: new kakao.maps.LatLng(defaultLat, defaultLng),
        level: 8,
      };

      const map = new kakao.maps.Map(mapRef.current, options);
      mapInstance.current = map;

      // 사업장 마커 추가
      if (businessLocation) {
        const businessPosition = new kakao.maps.LatLng(
          businessLocation.lat,
          businessLocation.lng,
        );

        const businessMarkerImage = new kakao.maps.MarkerImage(
          'data:image/svg+xml;charset=utf-8,' +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#ff6b6b" stroke="white" stroke-width="3"/>
              <rect x="10" y="8" width="12" height="16" rx="1" fill="white"/>
              <rect x="12" y="10" width="2" height="2" fill="#ff6b6b"/>
              <rect x="15" y="10" width="2" height="2" fill="#ff6b6b"/>
              <rect x="18" y="10" width="2" height="2" fill="#ff6b6b"/>
              <rect x="12" y="13" width="2" height="2" fill="#ff6b6b"/>
              <rect x="15" y="13" width="2" height="2" fill="#ff6b6b"/>
              <rect x="18" y="13" width="2" height="2" fill="#ff6b6b"/>
              <rect x="13" y="19" width="6" height="3" fill="#ff6b6b"/>
            </svg>
          `),
          new kakao.maps.Size(32, 32),
          { offset: new kakao.maps.Point(16, 16) },
        );

        businessMarker.current = new kakao.maps.Marker({
          position: businessPosition,
          image: businessMarkerImage,
        });
        businessMarker.current.setMap(map);
      }

      // 센터 마커 추가
      if (centerLocation) {
        const centerPosition = new kakao.maps.LatLng(
          centerLocation.lat,
          centerLocation.lng,
        );

        const centerMarkerImage = new kakao.maps.MarkerImage(
          'data:image/svg+xml;charset=utf-8,' +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C11.6 4 8 7.6 8 12c0 6 8 16 8 16s8-10 8-16c0-4.4-3.6-8-8-8z" fill="#4CAF50" stroke="white" stroke-width="2"/>
              <circle cx="16" cy="12" r="4" fill="white"/>
              <circle cx="16" cy="12" r="2" fill="#4CAF50"/>
            </svg>
          `),
          new kakao.maps.Size(32, 32),
          { offset: new kakao.maps.Point(16, 28) },
        );

        centerMarker.current = new kakao.maps.Marker({
          position: centerPosition,
          image: centerMarkerImage,
        });
        centerMarker.current.setMap(map);

        // 센터 마커 클릭 이벤트 추가
        if (onCenterMarkerClick && center) {
          kakao.maps.event.addListener(centerMarker.current, 'click', () => {
            onCenterMarkerClick(center);
          });
        }

        // 지도 중심을 센터로 이동
        map.setCenter(centerPosition);
      }

      // 두 마커가 모두 있을 때 적절한 줌 레벨로 조정
      if (businessLocation && centerLocation) {
        const bounds = new kakao.maps.LatLngBounds();
        bounds.extend(
          new kakao.maps.LatLng(businessLocation.lat, businessLocation.lng),
        );
        bounds.extend(
          new kakao.maps.LatLng(centerLocation.lat, centerLocation.lng),
        );
        map.setBounds(bounds, 50);
      }
    };

    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      // 이미 동일한 스크립트가 로딩중인지 확인
      const existingScript = document.querySelector(
        `script[src*="dapi.kakao.com"]`,
      );
      if (existingScript) {
        return;
      }

      // 스크립트가 아직 로드되지 않았다면 이벤트 리스너로 대기
      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
      script.onload = () => {
        window.kakao.maps.load(initMap);
      };
      script.onerror = (error) => {
        console.error('카카오맵 스크립트 로드 실패:', error);
        // 로드 실패 시 fallback 화면 표시
        const fallback = document.getElementById('map-fallback');
        if (fallback) {
          fallback.style.display = 'flex';
          fallback.innerHTML =
            '지도를 불러올 수 없습니다. API 키를 확인해주세요.';
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      // 컴포넌트 언마운트 시 마커 정리
      if (businessMarker.current) {
        businessMarker.current.setMap(null);
      }
      if (centerMarker.current) {
        centerMarker.current.setMap(null);
      }
    };
  }, [businessLocation, centerLocation]);

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full" />
      {/* 카카오맵 로딩 실패 시 fallback */}
      <div
        className="flex items-center justify-center text-gray-500 text-sm absolute inset-0 bg-gray-100 rounded-xl"
        style={{ display: 'none' }}
        id="map-fallback"
      >
        지도를 불러오는 중입니다...
      </div>
    </div>
  );
};

export default KakaoMap;
