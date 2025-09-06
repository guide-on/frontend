import React, { useState } from 'react';
import { colors } from '../../styles/colors';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

type Filters = {
  keywords: string[];
  types: string[];
  purposes: string[];
  rates: string[];
  limit: [number, number];
};

type FilterSheetProps = {
  showFilter: boolean;
  setShowFilter: (show: boolean) => void;
  activeFilters: Filters;
  setActiveFilters: React.Dispatch<React.SetStateAction<Filters>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  keywordRef: React.RefObject<HTMLDivElement | null>;
  typeRef: React.RefObject<HTMLDivElement | null>;
  purposeRef: React.RefObject<HTMLDivElement | null>;
  rateRef: React.RefObject<HTMLDivElement | null>;
  limitRef: React.RefObject<HTMLDivElement | null>;
  handleFilterChange: (category: keyof Filters, value: string) => void;
  handleRangeChange: (value: number | number[]) => void;
  removeFilter: (category: keyof Filters, value: string) => void;
};

const FilterSheet: React.FC<FilterSheetProps> = ({
  showFilter,
  setShowFilter,
  activeFilters,
  setActiveFilters,
  activeTab,
  setActiveTab,
  keywordRef,
  typeRef,
  purposeRef,
  rateRef,
  limitRef,
  handleFilterChange,
  handleRangeChange,
  removeFilter,
}) => {
  // Updated formatCurrency function
  const formatCurrencyLocal = (value: number) => {
    if (value === 0) {
      return '5천만원 이하'; // Assuming 0 represents "5천만원 이하" as the lower bound
    }
    if (value === 100000000) {
      return '1억원 초과'; // Assuming 100,000,000 represents "1억원 초과" as the upper bound
    }

    const units = ['원', '만원', '억원'];
    const unitValues = [1, 10000, 100000000]; // 1원, 1만원, 1억원

    let result = '';
    let tempValue = value;

    for (let i = units.length - 1; i >= 0; i--) {
      const unitValue = unitValues[i];
      const unit = units[i];

      if (tempValue >= unitValue) {
        const num = Math.floor(tempValue / unitValue);
        result += num.toLocaleString('ko-KR') + unit;
        tempValue %= unitValue;
      }
    }
    return result || '0원'; // Return '0원' if value is 0 or less than 1 unit
  };

  return (
    showFilter && (
      <div className="absolute inset-0 z-[60] flex items-end justify-center bg-black bg-opacity-30">
        <div
          className="w-full bg-white pt-4 rounded-t-3xl shadow-xl flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          <div className="px-4 overflow-y-auto no-scrollbar">
            {/* 탭 영역 */}
            <div className="sticky top-0 bg-white z-10border-gray-200 flex gap-2 px-2">
              {[
                { key: 'keyword', label: '키워드' },
                { key: 'type', label: '사업자구분' },
                { key: 'purpose', label: '대출용도' },
                { key: 'rate', label: '금리구분' },
                { key: 'limit', label: '대출한도' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`flex-1 py-3 text-[11px] font-semibold -mb-px border-b-2 mx-1 justify-center tracking-wide ${activeTab === tab.key ? '' : 'text-gray-700'}`}
                  style={{
                    borderColor:
                      activeTab === tab.key ? colors.navy : 'transparent',
                    color: activeTab === tab.key ? colors.navy : '#222',
                    opacity: activeTab === tab.key ? 1 : 0.7,
                  }}
                  onClick={() => {
                    setActiveTab(tab.key);
                    const ref = {
                      keyword: keywordRef,
                      type: typeRef,
                      purpose: purposeRef,
                      rate: rateRef,
                      limit: limitRef,
                    }[tab.key];
                    if (ref && ref.current) {
                      ref.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                    }
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">필터</span>
              <button
                className="text-sm font-bold text-gray-600"
                onClick={() =>
                  setActiveFilters({
                    keywords: [],
                    types: [],
                    purposes: [],
                    rates: [],
                    limit: [0, 100000000],
                  })
                }
              >
                초기화
              </button>
            </div>
            {/* Active Filters Display */}
            <div className="w-full max-w-md px-2 mb-4 flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(
                ([category, values]) =>
                  category !== 'limit' &&
                  (values as string[]).map((value) => (
                    <div
                      key={`${category}-${value}`}
                      className="flex items-center gap-1 bg-navy text-white text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ backgroundColor: colors.navy }}
                    >
                      <span>{value}</span>
                      <button
                        onClick={() =>
                          removeFilter(category as keyof Filters, value)
                        }
                        className="text-white ml-1"
                      >
                        &times;
                      </button>
                    </div>
                  )),
              )}
            </div>

            <div ref={keywordRef} className="mb-6">
              <div className="font-bold mb-2">키워드</div>
              <div className="flex gap-2 flex-wrap">
                {[
                  '#창업초기',
                  '#제조업',
                  '#업력무관',
                  '#피해업체',
                  '#수출',
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleFilterChange('keywords', item)}
                    className="px-4 py-2 rounded-full text-xs"
                    style={{
                      backgroundColor: activeFilters.keywords.includes(item)
                        ? colors.navy
                        : colors.gray,
                      color: activeFilters.keywords.includes(item)
                        ? 'white'
                        : '#222',
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div ref={typeRef} className="mb-6">
              <div className="font-bold mb-2">사업자구분</div>
              <div className="flex gap-2 flex-wrap">
                {[
                  '예비창업자',
                  '소상공인(개인)',
                  '소상공인(법인)',
                  '소기업',
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleFilterChange('types', item)}
                    className="px-4 py-2 rounded-full text-xs"
                    style={{
                      backgroundColor: activeFilters.types.includes(item)
                        ? colors.navy
                        : colors.gray,
                      color: activeFilters.types.includes(item)
                        ? 'white'
                        : '#222',
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div ref={purposeRef} className="mb-6">
              <div className="font-bold mb-2">대출용도</div>
              <div className="flex gap-2 flex-wrap">
                {['운전자금', '시설자금'].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleFilterChange('purposes', item)}
                    className="px-4 py-2 rounded-full text-xs"
                    style={{
                      backgroundColor: activeFilters.purposes.includes(item)
                        ? colors.navy
                        : colors.gray,
                      color: activeFilters.purposes.includes(item)
                        ? 'white'
                        : '#222',
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div ref={rateRef} className="mb-6">
              <div className="font-bold mb-2">금리구분</div>
              <div className="flex gap-2 flex-wrap">
                {['변동금리', '고정금리'].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleFilterChange('rates', item)}
                    className="px-4 py-2 rounded-full text-xs"
                    style={{
                      backgroundColor: activeFilters.rates.includes(item)
                        ? colors.navy
                        : colors.gray,
                      color: activeFilters.rates.includes(item)
                        ? 'white'
                        : '#222',
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div ref={limitRef} className="mb-6">
              <div className="font-bold mb-2">대출한도</div>
              <div className="w-full flex items-center justify-between text-sm font-semibold mb-2">
                <span>{formatCurrencyLocal(activeFilters.limit[0])}</span>
                <span>{formatCurrencyLocal(activeFilters.limit[1])}</span>
              </div>
              <Slider
                range
                min={0}
                max={100000000}
                step={1000000}
                value={activeFilters.limit}
                onChange={handleRangeChange}
                trackStyle={[{ backgroundColor: colors.navy }]}
                handleStyle={[
                  { backgroundColor: colors.navy, borderColor: colors.navy },
                  { backgroundColor: colors.navy, borderColor: colors.navy },
                ]}
              />
            </div>
          </div>
          <div className="sticky bottom-0 bg-white p-4 flex justify-between gap-2 shadow-[0_-4px_8px_rgba(0,0,0,0.05)]">
            <button
              className="flex-1 py-3 rounded-lg bg-gray-200 text-sm font-semibold"
              onClick={() => setShowFilter(false)}
            >
              닫기
            </button>
            <button
              className="flex-1 py-3 rounded-lg text-white text-sm font-semibold"
              style={{ backgroundColor: colors.navy }}
              onClick={() => setShowFilter(false)}
            >
              결과보기
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default FilterSheet;
