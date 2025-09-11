import React, { useState, useEffect } from 'react';
import { colors } from '../styles/colors';
import '../styles/support.css';

import FilterSheet from '../components/support/FilterSheet';
import FundDetailModal from '../components/support/FundDetailModal';
import PlaceDetailModal from '../components/support/PlaceDetailModal';
import SearchForm from '../components/support/SearchForm';
import FilterButtons from '../components/support/FilterButtons';
import MapView from '../components/support/MapView';
import FundsList from '../components/support/FundsList';
import AnnouncementsList from '../components/support/AnnouncementsList';
import AnnouncementDetailModal from '../components/support/AnnouncementDetailModal';
import {
  getFundsList,
  getFundDetail,
  toggleBookmark,
  getBookmarkedFunds,
  searchFunds,
} from '../api/fundApi';
import {
  getAnnouncementsList,
  getAnnouncementDetail,
} from '../api/announcementApi';
import type { Announcement } from '../api/announcementApi';
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
import { getLoanType } from '../utils/loanTypeMapping';


const Support: React.FC = () => {
  // loanType을 설정하는 헬퍼 함수
  const addLoanTypeToFunds = (funds: any[]): FundListItem[] => {
    return funds.map(fund => ({
      ...fund,
      loanType: getLoanType(fund.name)
    }));
  };

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

  // 공고 관련 상태
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showAnnouncementDetail, setShowAnnouncementDetail] = useState(false);

  // Refs for filter sheet
  const keywordRef = React.useRef<HTMLDivElement>(null);
  const typeRef = React.useRef<HTMLDivElement>(null);
  const purposeRef = React.useRef<HTMLDivElement>(null);
  const rateRef = React.useRef<HTMLDivElement>(null);
  const limitRef = React.useRef<HTMLDivElement>(null);

  // 필터링 함수
  const filterFunds = (fundsList: FundListItem[], filters: Filters): FundListItem[] => {
    return fundsList.filter((fund) => {
      // 키워드 필터링
      if (filters.keywords.length > 0) {
        const hasKeyword = filters.keywords.some(keyword => {
          const cleanKeyword = keyword.replace('#', '');
          return fund.name.includes(cleanKeyword) || 
                 fund.target.includes(cleanKeyword) ||
                 fund.limitAmount.includes(cleanKeyword);
        });
        if (!hasKeyword) return false;
      }

      // 사업자구분 필터링
      if (filters.types.length > 0) {
        const hasType = filters.types.some(type => 
          fund.target.includes(type) || fund.name.includes(type)
        );
        if (!hasType) return false;
      }

      // 대출용도 필터링
      if (filters.purposes.length > 0) {
        const hasPurpose = filters.purposes.some(purpose => 
          fund.name.includes(purpose)
        );
        if (!hasPurpose) return false;
      }

      // 금리구분 필터링
      if (filters.rates.length > 0) {
        const hasRate = filters.rates.some(rate => 
          fund.rate.includes(rate)
        );
        if (!hasRate) return false;
      }

      // 대출한도 필터링
      if (filters.limit[0] > 0 || filters.limit[1] < 100000000) {
        // 한도 문자열에서 숫자 추출 (예: "5천만원 이하" -> 50000000)
        const limitStr = fund.limitAmount;
        let fundLimit = 0;
        
        if (limitStr.includes('억')) {
          const match = limitStr.match(/(\d+(?:\.\d+)?)\s*억/);
          if (match) {
            fundLimit = parseFloat(match[1]) * 100000000;
          }
        } else if (limitStr.includes('만')) {
          const match = limitStr.match(/(\d+(?:,\d+)*)\s*만/);
          if (match) {
            fundLimit = parseInt(match[1].replace(/,/g, '')) * 10000;
          }
        }
        
        // 범위 체크
        if (fundLimit < filters.limit[0] || fundLimit > filters.limit[1]) {
          return false;
        }
      }

      return true;
    });
  };

  // Event Handlers
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === '') {
      setSearching(true);
      try {
        const res = await getFundsList();
        if (res.status === 200 && Array.isArray(res.data)) {
          setFunds(addLoanTypeToFunds(res.data));
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
          setFunds(addLoanTypeToFunds(res.data));
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
          const fundsWithLoanType = addLoanTypeToFunds(res.data);
          const filteredFunds = fundsWithLoanType.filter((fund: FundListItem) => fund.status === '접수중');
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
          setFunds(addLoanTypeToFunds(res.data));
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
            addLoanTypeToFunds(res.data).map((fund: any) => ({ ...fund, saved: true })),
          );
        } else {
          setBookmarkFunds([]);
        }
      } finally {
        setBookmarkLoading(false);
      }
    }
  };

  const handleAnnouncementsClick = async () => {
    if (activeMainFilter === 'announcements') {
      setActiveMainFilter('none');
    } else {
      setActiveMainFilter('announcements');
      await loadAnnouncements();
    }
  };

  const loadAnnouncements = async () => {
    setAnnouncementLoading(true);
    try {
      const response = await getAnnouncementsList();
      if (response.status === 200) {
        setAnnouncements(response.data.announcements);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      setAnnouncements([]);
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const handleAnnouncementDetailClick = async (id: number) => {
    try {
      const response = await getAnnouncementDetail(id);
      if (response.status === 200) {
        setSelectedAnnouncement(response.data);
        setShowAnnouncementDetail(true);
      }
    } catch (error) {
      console.error('공고 상세 조회 실패:', error);
    }
  };

  // 검색 폼 핸들러
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    try {
      const data = await searchFunds(search);
      setFunds(Array.isArray(data.data) ? addLoanTypeToFunds(data.data) : []);
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

  // 필터를 적용하는 함수
  const applyFilters = async () => {
    setLoading(true);
    try {
      const res = await getFundsList();
      if (res.status === 200 && Array.isArray(res.data)) {
        let fundsToSet = addLoanTypeToFunds(res.data);
        
        // 접수중 필터 적용
        if (activeMainFilter === 'receiving') {
          fundsToSet = fundsToSet.filter((fund: FundListItem) => fund.status === '접수중');
        }
        
        // 필터가 설정되어 있으면 필터링 적용
        const hasActiveFilters = 
          activeFilters.keywords.length > 0 ||
          activeFilters.types.length > 0 ||
          activeFilters.purposes.length > 0 ||
          activeFilters.rates.length > 0 ||
          activeFilters.limit[0] > 0 ||
          activeFilters.limit[1] < 100000000;
        
        if (hasActiveFilters) {
          fundsToSet = filterFunds(fundsToSet, activeFilters);
        }
        
        setFunds(fundsToSet);
      } else {
        setFunds([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (activeMainFilter === 'none' || activeMainFilter === 'receiving' || activeMainFilter === 'filter') {
      applyFilters();
    }
  }, [activeMainFilter]);

  // 필터가 변경될 때마다 결과를 업데이트
  useEffect(() => {
    if (activeMainFilter === 'filter' || activeMainFilter === 'none') {
      applyFilters();
    }
  }, [activeFilters]);

  return (
    <div className="min-h-screen flex flex-col items-center py-4 no-scrollbar overflow-y-auto" style={{ backgroundColor: colors.bgSoft }}>
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
        onAnnouncementsClick={handleAnnouncementsClick}
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
          onApplyFilter={() => {
            setActiveMainFilter('none');
            applyFilters();
          }}
        />
      )}

      {/* 메인 컨텐츠 */}
      <div
        key={activeMainFilter}
        className="w-full max-w-md px-2 transition-all duration-500 ease-in-out transform"
      >
        <div className="animate-fade-in">
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
          ) : activeMainFilter === 'announcements' ? (
            <AnnouncementsList
              announcements={announcements}
              loading={announcementLoading}
              onDetailClick={handleAnnouncementDetailClick}
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

      {/* 공고 상세 모달 */}
      <AnnouncementDetailModal
        open={showAnnouncementDetail}
        onClose={() => setShowAnnouncementDetail(false)}
        announcement={selectedAnnouncement}
      />
    </div>
  );
};

export default Support;