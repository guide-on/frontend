import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import regionApi, { type SidoResponse } from '@/api/regionApi';
import industryApi, { type IndustryTag } from '@/api/industryApi';
import memberApi from '@/api/memberApi';
import { buildSignupPayload } from '@/utils/signup';
import { useSignupStore } from '@/stores/useSignupStore';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { memberType, base, clear } = useSignupStore();

  // 서버에서 가져올 데이터
  const [regions, setRegions] = useState<SidoResponse[]>([]);
  const [industries, setIndustries] = useState<IndustryTag[]>([]);

  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [signupCompleted, setSignupCompleted] = useState(false);

  useEffect(() => {
    // 가입 완료되지 않았고, 가입 진행 중이 아닐 때만 리다렉트 체크
    if (!signupCompleted && !isSubmitting && (!base || memberType !== 'GENERAL')) {
      navigate('/auth/signup');
    }
  }, [base, memberType, navigate, isSubmitting, signupCompleted]);

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

  const submitSignup = useCallback(async () => {
    if (!base) {
      alert('회원가입 정보가 없습니다. 다시 시도해주세요.');
      navigate('/auth/signup');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = buildSignupPayload({
        memberType: 'GENERAL',
        base,
        preference: {
          regionCodes: selectedRegions,
          industryTags: selectedIndustries,
        },
      });
      
      await memberApi.create(payload);
      
      setSignupCompleted(true);
      clear();
      window.location.href = '/auth/login';
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || '가입 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [base, selectedRegions, selectedIndustries, clear, navigate]);

  return (
    <div className="min-h-screen bg-white py-4 px-4">
      <div className="max-w-sm mx-auto w-full" style={{ maxWidth: 400 }}>
        <div className="flex justify-end">
          <button
            onClick={() => setShowSkipConfirm(true)}
            className="text-slate-500 text-sm"
          >
            건너뛰기
          </button>
        </div>

        <div className="my-7 text-center text-sm font-semibold text-slate-800">
          내 유형에 맞는 정보를 추천해드려요
        </div>

        <div className="mt-6 space-y-6">
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
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${active ? 'bg-black text-white border-black' : 'bg-white text-slate-700 border-slate-300'}`}
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
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${active ? 'bg-black text-white border-black' : 'bg-white text-slate-700 border-slate-300'}`}
                  >
                    {i.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-12 mb-6">
          <button
            type="button"
            onClick={submitSignup}
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold text-base disabled:opacity-60 transition-all duration-200 hover:-translate-y-0.5"
          >
            {isSubmitting ? '가입 중...' : '회원가입 완료'}
          </button>
        </div>
      </div>

      {showSkipConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-5 border-b">
              <strong className="text-slate-800">확인</strong>
            </div>
            <div className="p-5 text-sm text-slate-700">
              선택하지 않고 가입하시겠습니까?
            </div>
            <div className="p-4 flex gap-2 justify-end border-t">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="px-4 py-2 rounded-md border text-slate-700"
              >
                취소
              </button>
              <button
                onClick={submitSignup}
                className="px-4 py-2 rounded-md bg-black text-white"
              >
                가입하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
