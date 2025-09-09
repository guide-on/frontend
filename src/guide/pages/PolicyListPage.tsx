import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/styles/colors';
import { getPolicies, type PolicyItem, createApplicationSession, createRequiredDocuments } from '@/api/documentApi';

export function PolicyListPage() {
  const { businessId = '' } = useParams();
  const nav = useNavigate();
  const [items, setItems] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let hasLoaded = false;
    
    const loadPolicies = async () => {
      if (!mounted || hasLoaded) return;
      hasLoaded = true;
      
      try {
        setLoading(true);
        if (!businessId) {
          if (mounted) {
            setError('사업체 ID가 없습니다. 이전 단계에서 설문을 완료해 주세요.');
          }
          return;
        }
        console.log(`🔄 API 요청: GET /api/policy/${businessId}`);
        const data = await getPolicies(businessId);
        console.log(`✅ API 응답: GET /api/policy/${businessId}`, Array.isArray(data) || (data && typeof data === 'object') ? 'SUCCESS' : 'FAILED');
        
        if (mounted) {
          // 백엔드 응답 구조에 맞게 처리
          if (data && typeof data === 'object' && 'eligiblePolicies' in data) {
            setItems((data as any).eligiblePolicies || []);
          } else {
            setItems(Array.isArray(data) ? data : []);
          }
        }
      } catch (e: any) {
        console.error(`❌ API 실패: GET /api/policy/${businessId}`, e.message);
        if (mounted) {
          setError(e?.message || '정책자금 목록을 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadPolicies();
    
    return () => {
      mounted = false;
    };
  }, [businessId]);

  const getName = (p: PolicyItem) => p.policyName || p.name || p.title || `정책자금 ${p.policyId || p.id}`;
  const getRate = (p: PolicyItem) => {
    if (p.baseRate) return `${p.baseRate}%`;
    return (p.rate ?? p.interestRate ?? '').toString();
  };
  const getLimit = (p: PolicyItem) => {
    if (p.loanLimit) return `${(p.loanLimit / 10000).toLocaleString()}만원`;
    return (p.limit ?? p.limitAmount ?? '').toString();
  };
  const getTerm = (p: PolicyItem) => {
    if (p.termYears) return `${p.termYears}년`;
    return (p.term ?? '').toString();
  };

  const [applying, setApplying] = useState<string | number | null>(null);

  const onApply = async (policyId: string | number) => {
    // Prevent duplicate session creation
    if (applying === policyId) return;

    setApplying(policyId);
    try {
      console.log(`🔄 API 요청: POST /api/document/sessions`, { businessId: businessId!, policyId });
      const data = await createApplicationSession({ businessId: businessId!, policyId });
      console.log(`✅ API 응답: POST /api/document/sessions`, data.success !== false ? 'SUCCESS' : 'FAILED');

      if (data.sessionId) {
        console.log(`[1] 세션 생성 직후 ID: ${data.sessionId}`);
        
        // 세션 생성 직후 바로 서류 생성 API 호출
        try {
          console.log(`🔄 API 요청: GET /api/document/required/${data.sessionId} (서류 생성)`);
          await createRequiredDocuments(data.sessionId);
          console.log(`✅ API 응답: GET /api/document/required/${data.sessionId} SUCCESS (서류 생성)`);
        } catch (createError: any) {
          console.error(`❌ 서류 생성 실패:`, createError.message);
          // 서류 생성에 실패해도 진행 (상태 조회로 복구 가능)
        }
        
        // 서류 목록 페이지로 이동 (마이데이터는 서류 페이지에서 자동 모달로)
        nav(`/guide/documents/${data.sessionId}`);
      } else {
        alert('세션 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (e: any) {
      console.error(`❌ API 실패: POST /api/document/sessions`, e.message);
      alert(`신청 중 오류가 발생했습니다: ${e?.message || '알 수 없는 오류'}`);
    } finally {
      setApplying(null);
    }
  };


  return (
    <div className="max-w-[375px] mx-auto px-4 py-5 flex flex-col gap-4">
      <section className="rounded-xl p-4" style={{ backgroundColor: colors.gray }}>
        <p className="font-bold text-lg mb-1">대출 가이드</p>
        <p className="text-sm leading-5">가이드온이 서류 준비를 도와드려요! 정보를 입력하시면 필요한 서류를 안내해드립니다.</p>
      </section>

      <section className="rounded-xl p-4 flex flex-col gap-3" style={{ backgroundColor: colors.gray }}>
        <p className="font-bold text-lg">맞춤 자금 목록</p>
        {loading && <p className="text-sm">불러오는 중…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-gray-600">조건에 맞는 자금이 없습니다.</p>
        )}
        <div className="flex flex-col gap-3">
          {items.map((p) => (
            <div key={p.policyId || p.id} className="bg-white rounded-xl p-4 border" style={{ borderColor: '#e5e7eb' }}>
              {p.policyType && (
                <div className="mb-2">
                  <span 
                    className="inline-block px-2 py-1 text-xs font-medium text-white rounded-full"
                    style={{ backgroundColor: colors.navy }}
                  >
                    {p.policyType}
                  </span>
                </div>
              )}
              <div className="font-bold text-base mb-2">{getName(p)}</div>
              <div className="text-sm text-gray-700 flex flex-col gap-1">
                {getRate(p) && <div>금리: {getRate(p)}</div>}
                {getLimit(p) && <div>한도: {getLimit(p)}</div>}
                {getTerm(p) && <div>기간: {getTerm(p)}</div>}
                {p.conditions && <div>지원 조건: {p.conditions}</div>}
              </div>
              <button
                type="button"
                onClick={() => onApply(p.policyId || p.id || '')}
                disabled={applying === (p.policyId || p.id)}
                className="mt-3 w-full py-2.5 rounded-lg font-semibold text-white"
                style={{ backgroundColor: applying === (p.policyId || p.id) ? '#9ca3af' : colors.navy }}
              >
                {applying === (p.policyId || p.id) ? '신청 중...' : '이 자금으로 신청하기'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PolicyListPage;
