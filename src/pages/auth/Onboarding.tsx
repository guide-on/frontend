import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import regionApi, { type SidoResponse } from '@/api/regionApi';
import industryApi, { type IndustryTag } from '@/api/industryApi';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  // 서버에서 가져올 데이터
  const [regions, setRegions] = useState<SidoResponse[]>([]);
  const [industries, setIndustries] = useState<IndustryTag[]>([]);

  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  // 서버 호출
  useEffect(() => {
    (async () => {
      try {
        const sidoData = await regionApi.fetchSidos();
        setRegions(sidoData);
      } catch (err) {
        console.error('시도 목록 불러오기 실패:', err);
      }

      try {
        const industryData = await industryApi.fetchTags();
        setIndustries(industryData);
      } catch (err) {
        console.error('업종 목록 불러오기 실패:', err);
      }
    })();
  }, []);

  const toggle = useCallback(
    (list: string[], setter: (v: string[]) => void, item: string) => {
      setter(
        list.includes(item) ? list.filter((v) => v !== item) : [...list, item],
      );
    },
    [],
  );

  const goLogin = useCallback(() => navigate('/auth/login'), [navigate]);

  return (
    <div className="min-h-screen bg-white py-4 px-4">
      <div className="max-w-sm mx-auto w-full" style={{ maxWidth: 400 }}>
        <div className="flex justify-end">
          <button onClick={goLogin} className="text-slate-500 text-sm">
            건너뛰기
          </button>
        </div>

        <div className="my-7 text-center text-sm font-semibold text-slate-800">
          내 유형에 맞는 정보를 추천해드려요
        </div>

        <div className="mt-6 space-y-10">
          <section>
            <h3 className="text-md font-extrabold text-slate-900 mb-3 ps-1">
              관심 지역
            </h3>
            <div className="flex flex-wrap gap-2">
              {regions.map((r) => {
                const active = selectedRegions.includes(r.code);
                return (
                  <button
                    key={r.code}
                    type="button"
                    onClick={() =>
                      toggle(selectedRegions, setSelectedRegions, r.code)
                    }
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                      active
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {r.name}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-md font-extrabold text-slate-900 mb-3 ps-1">
              관심 업종
            </h3>
            <div className="flex flex-wrap gap-2">
              {industries.map((i) => {
                const active = selectedIndustries.includes(i.id);
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() =>
                      toggle(selectedIndustries, setSelectedIndustries, i.id)
                    }
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                      active
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {i.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="fixed left-0 right-0 bottom-6 px-5">
          <div className="max-w-sm mx-auto" style={{ maxWidth: 400 }}>
            <button
              type="button"
              onClick={goLogin}
              className="w-full bg-black text-white py-3 rounded-md font-bold text-sm"
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
