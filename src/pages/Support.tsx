import React, { useState, useEffect } from 'react';
import { colors } from '../styles/colors';

import FilterSheet from '../components/support/FilterSheet';
import FundDetailModal from '../components/support/FundDetailModal';
import FundCard from '../components/support/FundCard';
import {
  getFundsList,
  getFundDetail,
  toggleBookmark,
  getBookmarkedFunds,
  searchFunds,
} from '../api/fundApi';

// Types
type Filters = {
  keywords: string[];
  types: string[];
  purposes: string[];
  rates: string[];
  limit: [number, number];
};

type FundListItem = {
  id: number;
  name: string;
  status: string;
  target: string;
  rate: string;
  term: string;
  limitAmount: string;
  saved: boolean;
};

type FundDetail = FundListItem & {
  purpose: string;
  createdAt: string;
  updatedAt?: string;
  categoryCode: string;
  year: number;
};

const Support: React.FC = () => {
  // State
  const [funds, setFunds] = useState<FundListItem[]>([]);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedFund, setSelectedFund] = useState<FundDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeMainFilter, setActiveMainFilter] = useState<'none' | 'filter' | 'map' | 'receiving' | 'bookmark'>('none');
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-4">
      {/* 검색 폼 */}
      <form
        className="flex items-center gap-2 mb-4 w-full max-w-md px-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!search.trim()) return;
          setSearching(true);
          try {
            const data = await searchFunds(search);
            setFunds(Array.isArray(data.data) ? data.data : []);
          } finally {
            setSearching(false);
          }
        }}
      >
        <i className="fas fa-search text-gray-400"></i>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="지원금정보를 검색해보세요"
          className="flex-1 px-3 py-2 rounded bg-gray-100 text-sm outline-none"
        />
        <button
          type="submit"
          className="px-2 py-2 rounded bg-navy text-white text-xs font-semibold"
          disabled={searching}
        >
          검색
        </button>
      </form>

      {/* 필터 버튼들 */}
      <div className="flex gap-2 mb-4 w-full max-w-md px-2">
        <button
          className={`px-3 py-2 rounded text-xs font-semibold ${activeMainFilter === 'filter' ? 'bg-navy text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveMainFilter(activeMainFilter === 'filter' ? 'none' : 'filter')}
        >
          :: 필터
        </button>
        <button
          className={`px-3 py-2 rounded text-xs font-semibold ${activeMainFilter === 'map' ? 'bg-navy text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveMainFilter(activeMainFilter === 'map' ? 'none' : 'map')}
        >
          내센터
        </button>
        <button
          className={`px-3 py-2 rounded text-xs font-semibold ${activeMainFilter === 'receiving' ? 'bg-navy text-white' : 'bg-gray-200'}`}
          onClick={async () => {
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
          }}
        >
          접수중
        </button>
        <button
          className={`px-3 py-2 rounded text-xl font-semibold flex items-center justify-center ${activeMainFilter === 'bookmark' ? 'bg-navy text-white' : 'bg-gray-200'}`}
          aria-label="북마크"
          onClick={async () => {
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
          }}
        >
          <span className="text-yellow-400">★</span>
        </button>
      </div>

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
        {activeMainFilter === 'bookmark' ? (
          // 북마크 리스트
          <div className="flex flex-col gap-3">
            {bookmarkLoading && (
              <div className="text-center text-gray-400 py-8">. . .</div>
            )}
            {!bookmarkLoading && bookmarkFunds.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                북마크한 지원금이 없습니다.
              </div>
            )}
            {bookmarkFunds.map((item) => (
              <FundCard
                key={item.id}
                item={item}
                onDetailClick={openDetail}
                onBookmarkClick={handleBookmark}
              />
            ))}
          </div>
        ) : activeMainFilter === 'map' ? (
          // 지도 뷰
          <div className="flex flex-col gap-4">
            <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-sm mb-2">
              <span>센터 위치 지도 (구현 예정)</span>
            </div>
            <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
              <div className="font-bold mb-1">
                인천 미추홀구 소상공인지원센터
              </div>
              <div className="text-xs text-gray-600 mb-1">
                인천 미추홀구 석정로 229 IT타워 6층
              </div>
              <div className="text-xs text-gray-600 mb-1">
                운영시간: 평일 10:00~오후 6:00
              </div>
              <div className="text-xs text-gray-600">전화: 032-715-4047</div>
              <a
                href="https://inisupport.or.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 underline mt-1 inline-block"
              >
                홈페이지 바로가기
              </a>
            </div>
          </div>
        ) : (
          // 일반 펀드 리스트 (or when activeMainFilter is 'receiving' or 'none')
          <div className="flex flex-col gap-3">
            {loading && (
              <div className="text-center text-gray-400 py-8">. . .</div>
            )}
            {!loading && funds.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                지원금 정보가 없습니다.
              </div>
            )}
            {funds.map((item) => (
              <FundCard
                key={item.id}
                item={item}
                onDetailClick={openDetail}
                onBookmarkClick={handleBookmark}
              />
            ))}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      <FundDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        fund={selectedFund}
      />
    </div>
  );
};

export default Support;