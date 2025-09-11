import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

const StoreMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      const { kakao } = window;
      if (!kakao || !kakao.maps) {
        console.error('카카오맵 API가 로드되지 않음');
        return;
      }

      const options = {
        center: new kakao.maps.LatLng(37.5665, 126.978), // 서울시청 좌표
        level: 3,
      };

      const map = new kakao.maps.Map(mapRef.current, options);
      mapInstance.current = map;

      // 기본 마커 추가
      const markerPosition = new kakao.maps.LatLng(37.5665, 126.978);
      const marker = new kakao.maps.Marker({
        position: markerPosition,
      });
      marker.setMap(map);
      markersRef.current.push(marker);
    };

    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      const existingScript = document.querySelector(
        `script[src*="dapi.kakao.com"]`,
      );
      if (existingScript) {
        const checkKakao = () => {
          if (window.kakao && window.kakao.maps) {
            initMap();
          } else {
            setTimeout(checkKakao, 100);
          }
        };
        checkKakao();
        return;
      }

      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
      script.onload = () => {
        window.kakao.maps.load(initMap);
      };
      script.onerror = (error) => {
        console.error('카카오맵 스크립트 로드 실패:', error);
      };
      document.head.appendChild(script);
    }
  }, []);

  // 기존 마커들 제거
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];
  };

  // 장소 검색
  const searchPlace = () => {
    if (!searchTerm.trim() || !mapInstance.current || !window.kakao) return;

    const places = new window.kakao.maps.services.Places();

    places.keywordSearch(searchTerm, (data: any[], status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        // 기존 마커 제거
        clearMarkers();

        const bounds = new window.kakao.maps.LatLngBounds();

        data.forEach((place) => {
          // 마커 생성
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(place.y, place.x),
          });

          marker.setMap(mapInstance.current);
          markersRef.current.push(marker);

          // 마커 클릭 이벤트 - 업체명의 첫 번째 단어로 POST 요청
          window.kakao.maps.event.addListener(marker, 'click', async () => {
            const placeName = place.place_name;
            const firstWord = placeName.split(' ')[0]; // 첫 번째 단어 추출

            try {
              const response = await fetch(
                `/search/${encodeURIComponent(firstWord)}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              );

              if (response.ok) {
                console.log('검색 요청 성공:', firstWord);
              } else {
                console.error('검색 요청 실패:', response.statusText);
              }
            } catch (error) {
              console.error('네트워크 오류:', error);
            }
          });

          bounds.extend(new window.kakao.maps.LatLng(place.y, place.x));
        });

        // 검색된 장소들이 모두 보이도록 지도 범위 조정
        mapInstance.current.setBounds(bounds);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.');
      }
    });
  };

  // 엔터키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPlace();
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* 검색 입력창 */}
      <div
        style={{
          marginBottom: '10px',
          display: 'flex',
          gap: '10px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
        }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="사업체명을 검색하세요"
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
        <button
          onClick={searchPlace}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          검색
        </button>
      </div>

      {/* 지도 */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '300px',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      />
    </div>
  );
};

export default StoreMap;
