import React, { useState, useEffect } from 'react';
import { colors } from '../styles/colors';

import FilterSheet from '../components/support/FilterSheet';
import FundDetailModal from '../components/support/FundDetailModal';
import PlaceDetailModal from '../components/support/PlaceDetailModal';
import SearchForm from '../components/support/SearchForm';
import FilterButtons from '../components/support/FilterButtons';
import MapView from '../components/support/MapView';
import FundsList from '../components/support/FundsList';
import {
  getFundsList,
  getFundDetail,
  toggleBookmark,
  getBookmarkedFunds,
  searchFunds,
} from '../api/fundApi';
import {
  getAllSupportCenters,
  getNearestSupportCenters,
  getBusinessAddress,
} from '../api/supportCenterApi';
import type {
  SupportCenter,
  NearestCenterResponse,
  NearestCentersData,
  Filters,
  FundListItem,
  FundDetail,
  MainFilter,
  PlaceDetail,
} from '../types/support';


const Support: React.FC = () => {
  // State
  const [funds, setFunds] = useState<FundListItem[]>([]);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedFund, setSelectedFund] = useState<FundDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeMainFilter, setActiveMainFilter] = useState<MainFilter>('none');
  const [activeTab, setActiveTab] = useState('keyword');
  const [activeFilters, setActiveFilters] = useState<Filters>({
    keywords: [],
    types: [],
    purposes: [],
    rates: [],
    limit: [0, 100000000],
  });
  const [bookmarkFunds, setBookmarkFunds] = useState<FundListItem[]>([]);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // 지원센터 관련 상태
  const [businessAddress, setBusinessAddress] = useState<string | null>(null);
  const [allCenters, setAllCenters] = useState<SupportCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<SupportCenter | null>(null);
  const [nearestData, setNearestData] = useState<NearestCentersData | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  
  // 장소 상세 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [modalPlace, setModalPlace] = useState<PlaceDetail | null>(null);

  // Refs for filter sheet
  const keywordRef = React.useRef<HTMLDivElement>(null);
  const typeRef = React.useRef<HTMLDivElement>(null);
  const purposeRef = React.useRef<HTMLDivElement>(null);
  const rateRef = React.useRef<HTMLDivElement>(null);
  const limitRef = React.useRef<HTMLDivElement>(null);

  // Event Handlers
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === '') {
      setSearching(true);
      try {
        const res = await getFundsList();
        if (res.status === 200 && Array.isArray(res.data)) {
          setFunds(res.data);
        } else {
          setFunds([]);
        }
      } finally {
        setSearching(false);
      }
    }
  };

  const handleFilterChange = (category: keyof Filters, value: string) => {
    setActiveFilters((prev) => {
      if (category === 'limit') return prev;
      const arr = prev[category] as string[];
      if (arr.includes(value)) {
        return { ...prev, [category]: arr.filter((v) => v !== value) };
      } else {
        return { ...prev, [category]: [...arr, value] };
      }
    });
  };

  const handleRangeChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setActiveFilters((prev) => ({ ...prev, limit: [value[0], value[1]] }));
    }
  };

  const removeFilter = (category: keyof Filters, value: string) => {
    setActiveFilters((prev) => {
      if (category === 'limit') return prev;
      return {
        ...prev,
        [category]: (prev[category] as string[]).filter((v) => v !== value),
      };
    });
  };

  const openDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await getFundDetail(id);
      if (res.status === 200 && res.data) {
        setSelectedFund(res.data);
        setShowDetail(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (id: number, saved: boolean) => {
    await toggleBookmark(id, saved);

    // 리스트 갱신
    getFundsList().then((res) => {
      if (res.status === 200 && Array.isArray(res.data)) {
        setFunds(res.data);
      }
    });

    // 상세 모달 내 북마크도 갱신
    if (selectedFund && selectedFund.id === id) {
      const detail = await getFundDetail(id);
      if (detail.status === 200 && detail.data) setSelectedFund(detail.data);
    }
  };

  // 지원센터 관련 이벤트 핸들러
  const handleCenterSelect = (center: SupportCenter) => {
    setSelectedCenter(center);
  };

  // 카카오 장소 검색 함수
  const searchKakaoPlace = async (centerName: string): Promise<PlaceDetail | null> => {
    try {
      const apiKey = import.meta.env.VITE_KAKAO_REST_KEY;
      if (!apiKey) {
        console.error('카카오 REST API 키가 없습니다.');
        return null;
      }

      // 조직명을 제거하고 "소상공인 [센터명] 센터" 형식으로 검색
      const centerNameOnly = centerName.replace(/^소상공인시장진흥공단\s*/, '');
      const searchQuery = `소상공인 ${centerNameOnly} 센터`;

      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `KakaoAK ${apiKey}`
          }
        }
      );

      if (!response.ok) {
        console.error('카카오 API 호출 실패:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (data.documents && data.documents.length > 0) {
        const place = data.documents[0];
        return {
          id: place.id,
          name: place.place_name,
          address: place.address_name,
          lat: parseFloat(place.y),
          lng: parseFloat(place.x)
        };
      }
      
      return null;
    } catch (error) {
      console.error('카카오 장소 검색 오류:', error);
      return null;
    }
  };

  // 필터 버튼 핸들러들
  const handleReceivingFilter = async () => {
    if (activeMainFilter === 'receiving') {
      setActiveMainFilter('none');
      setLoading(true);
      try {
        const res = await getFundsList();
        if (res.status === 200 && Array.isArray(res.data)) {
          setFunds(res.data);
        } else {
          setFunds([]);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setActiveMainFilter('receiving');
      setLoading(true);
      try {
        const res = await getFundsList();
        if (res.status === 200 && Array.isArray(res.data)) {
          const filteredFunds = res.data.filter((fund: FundListItem) => fund.status === '접수중');
          setFunds(filteredFunds);
        } else {
          setFunds([]);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBookmarkFilter = async () => {
    if (activeMainFilter === 'bookmark') {
      setActiveMainFilter('none');
      setLoading(true);
      try {
        const res = await getFundsList();
        if (res.status === 200 && Array.isArray(res.data)) {
          setFunds(res.data);
        } else {
          setFunds([]);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setActiveMainFilter('bookmark');
      setBookmarkLoading(true);
      try {
        const res = await getBookmarkedFunds();
        if (res.status === 200 && Array.isArray(res.data)) {
          setBookmarkFunds(
            res.data.map((fund: any) => ({ ...fund, saved: true })),
          );
        } else {
          setBookmarkFunds([]);
        }
      } finally {
        setBookmarkLoading(false);
      }
    }
  };

  // 검색 폼 핸들러
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    try {
      const data = await searchFunds(search);
      setFunds(Array.isArray(data.data) ? data.data : []);
    } finally {
      setSearching(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadCenterData = async () => {
      if (activeMainFilter === 'map') {
        setMapLoading(true);
        try {
          // 1. 전체 센터 목록 로드
          const centersRes = await getAllSupportCenters();
          if (centersRes.status === 200) {
            setAllCenters(centersRes.data);
          }

          // 2. 사업장 주소 조회
          const addressRes = await getBusinessAddress();
          if (addressRes.status === 200 && addressRes.address) {
            setBusinessAddress(addressRes.address);
            
            // 3. 가까운 센터 조회
            const nearestRes = await getNearestSupportCenters(addressRes.address, 1);
            if (nearestRes.status === 200 && nearestRes.data) {
              setNearestData(nearestRes.data);
              setSelectedCenter(nearestRes.data.nearestCenters[0]?.center || null);
            }
          } else {
            setBusinessAddress(null);
            // 사업장 주소가 없으면 첫 번째 센터를 기본으로 선택
            if (centersRes.data.length > 0) {
              setSelectedCenter(centersRes.data[0]);
            }
          }
        } finally {
          setMapLoading(false);
        }
      }
    };

    loadCenterData();
  }, [activeMainFilter]);

  // Effects
  useEffect(() => {
    const fetchFunds = async () => {
      setLoading(true);
      try {
        const res = await getFundsList();
        if (res.status === 200 && Array.isArray(res.data)) {
          let fundsToSet = res.data;
          if (activeMainFilter === 'receiving') {
            fundsToSet = res.data.filter((fund: FundListItem) => fund.status === '접수중');
          }
          setFunds(fundsToSet);
        } else {
          setFunds([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (activeMainFilter === 'none' || activeMainFilter === 'receiving') {
      fetchFunds();
    }
  }, [activeMainFilter]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-4 no-scrollbar overflow-y-auto">
      {/* 검색 폼 */}
      <SearchForm
        search={search}
        searching={searching}
        onSearchChange={handleSearchChange}
        onSubmit={handleSearchSubmit}
      />

      {/* 필터 버튼들 */}
      <FilterButtons
        activeMainFilter={activeMainFilter}
        onFilterClick={() => setActiveMainFilter(activeMainFilter === 'filter' ? 'none' : 'filter')}
        onMapClick={() => setActiveMainFilter(activeMainFilter === 'map' ? 'none' : 'map')}
        onReceivingClick={handleReceivingFilter}
        onBookmarkClick={handleBookmarkFilter}
      />

      {/* 필터 시트 */}
      {activeMainFilter === 'filter' && (
        <FilterSheet
          showFilter={true}
          setShowFilter={() => setActiveMainFilter('none')}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          keywordRef={keywordRef}
          typeRef={typeRef}
          purposeRef={purposeRef}
          rateRef={rateRef}
          limitRef={limitRef}
          handleFilterChange={handleFilterChange}
          handleRangeChange={handleRangeChange}
          removeFilter={removeFilter}
        />
      )}

      {/* 메인 컨텐츠 */}
      <div
        key={activeMainFilter}
        className="w-full max-w-md px-2"
      >
        {activeMainFilter === 'map' ? (
          <MapView
            mapLoading={mapLoading}
            allCenters={allCenters}
            selectedCenter={selectedCenter}
            nearestData={nearestData}
            businessAddress={businessAddress}
            onCenterSelect={handleCenterSelect}
            onCenterMarkerClick={async (center) => {
              const place = await searchKakaoPlace(center.name);
              if (place) {
                setModalPlace(place);
                setShowModal(true);
              }
            }}
          />
        ) : (
          <FundsList
            funds={funds}
            bookmarkFunds={bookmarkFunds}
            loading={loading}
            bookmarkLoading={bookmarkLoading}
            isBookmarkMode={activeMainFilter === 'bookmark'}
            onDetailClick={openDetail}
            onBookmarkClick={handleBookmark}
          />
        )}
      </div>

      {/* 상세 모달 */}
      <FundDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        fund={selectedFund}
      />
      
      {/* 장소 상세 모달 */}
      <PlaceDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        place={modalPlace}
      />
    </div>
  );
};

export default Support;