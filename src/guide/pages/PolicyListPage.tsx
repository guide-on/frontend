import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/styles/colors';
import {
  getPolicies,
  type PolicyItem,
  createApplicationSession,
  createRequiredDocuments,
} from '@/api/documentApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ApplicationConfirmModal from '@/components/guide/ApplicationConfirmModal';

export function PolicyListPage() {
  const { businessId = '' } = useParams();
  const nav = useNavigate();
  const [items, setItems] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPolicies = async () => {
      if (!mounted) return;

      try {
        setLoading(true);
        if (!businessId) {
          if (mounted) {
            setError(
              '사업체 ID가 없습니다. 이전 단계에서 설문을 완료해 주세요.',
            );
          }
          return;
        }
        console.log(`🔄 API 요청: GET /api/policy/${businessId}`);
        const data = await getPolicies(businessId);
        console.log(
          `✅ API 응답: GET /api/policy/${businessId}`,
          Array.isArray(data) || (data && typeof data === 'object')
            ? 'SUCCESS'
            : 'FAILED',
        );

        if (mounted) {
          // 백엔드 응답 구조에 맞게 처리
          if (data && typeof data === 'object' && 'eligiblePolicies' in data) {
            setItems(
              (data as { eligiblePolicies?: PolicyItem[] }).eligiblePolicies ||
                [],
            );
          } else {
            setItems(Array.isArray(data) ? data : []);
          }
        }
      } catch (e) {
        const errorMessage =
          e instanceof Error
            ? e.message
            : '정책자금 목록을 불러오는 중 오류가 발생했습니다.';
        console.error(
          `❌ API 실패: GET /api/policy/${businessId}`,
          errorMessage,
        );
        if (mounted) {
          setError(errorMessage);
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

  const getName = (p: PolicyItem) =>
    p.policyName || p.name || p.title || `정책자금 ${p.policyId || p.id}`;
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyItem | null>(null);

  const onShowModal = (policy: PolicyItem) => {
    setSelectedPolicy(policy);
    setModalOpen(true);
  };

  const onCloseModal = () => {
    setModalOpen(false);
    setSelectedPolicy(null);
  };

  const onConfirmApplication = async () => {
    if (!selectedPolicy) return;
    
    const policyId = selectedPolicy.policyId || selectedPolicy.id;
    if (!policyId) return;

    // Prevent duplicate session creation
    if (applying === policyId) return;

    setApplying(policyId);
    try {
      console.log(`🔄 API 요청: POST /api/document/sessions`, {
        businessId: businessId!,
        policyId,
      });
      const data = await createApplicationSession({
        businessId: businessId!,
        policyId,
      });
      console.log(
        `✅ API 응답: POST /api/document/sessions`,
        data.success !== false ? 'SUCCESS' : 'FAILED',
      );

      if (data.sessionId) {
        console.log(`[1] 세션 생성 직후 ID: ${data.sessionId}`);

        // 세션 생성 직후 바로 서류 생성 API 호출
        try {
          console.log(
            `🔄 API 요청: GET /api/document/required/${data.sessionId} (서류 생성)`,
          );
          await createRequiredDocuments(data.sessionId);
          console.log(
            `✅ API 응답: GET /api/document/required/${data.sessionId} SUCCESS (서류 생성)`,
          );
        } catch (createError) {
          console.error(
            `❌ 서류 생성 실패:`,
            createError instanceof Error ? createError.message : createError,
          );
          // 서류 생성에 실패해도 진행 (상태 조회로 복구 가능)
        }

        // 모달 닫기
        onCloseModal();
        
        // 서류 목록 페이지로 이동 (마이데이터는 서류 페이지에서 자동 모달로)
        nav(`/guide/documents/${data.sessionId}`);
      } else {
        alert('세션 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류';
      console.error(`❌ API 실패: POST /api/document/sessions`, errorMessage);
      alert(`신청 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setApplying(null);
    }
  };

  const onCheckSimulations = () => {
    nav('/simulation');
  };

  return (
    <div
      className="w-full min-h-screen py-5 flex flex-col gap-4"
      style={{ backgroundColor: colors.bgSoft }}
    >
      <section className="rounded-xl p-4 bg-white mx-4">
        <div className="flex justify-between items-start mb-3">
          <p className="font-bold text-lg">대출 가이드</p>
          <button
            onClick={onCheckSimulations}
            className="px-3 py-1.5 text-xs font-medium rounded-full border transition-colors"
            style={{
              borderColor: colors.navy,
              color: colors.navy,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.navy;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.navy;
            }}
          >
            내 시뮬레이션 확인하기
          </button>
        </div>
        <p className="text-sm leading-5">
          가이드온이 서류 준비를 도와드려요!
          <br />
          정보를 입력하시면 필요한 서류를 안내해드립니다.
        </p>
      </section>

      <section className="rounded-xl p-4 flex flex-col gap-3 bg-white mx-4">
        <p className="font-bold text-lg">신청가능 자금 목록</p>
        {loading && (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner type="dots" size="md" color={colors.navy} />
            <span className="ml-3 text-sm text-gray-600">불러오는 중</span>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-gray-600">조건에 맞는 자금이 없습니다.</p>
        )}
        <div className="flex flex-col gap-3">
          {items.map((p) => (
            <div
              key={p.policyId || p.id}
              className="bg-white rounded-xl shadow-md p-4 border border-gray-100 cursor-pointer hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 transform animate-fade-in"
              style={{ borderColor: '#f0f2f5' }}
            >
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
                onClick={() => onShowModal(p)}
                disabled={applying === (p.policyId || p.id)}
                className="mt-3 w-full py-2.5 rounded-lg font-semibold text-white"
                style={{
                  backgroundColor:
                    applying === (p.policyId || p.id) ? '#9ca3af' : colors.navy,
                }}
              >
                {applying === (p.policyId || p.id) ? '신청 중...' : '신청하기'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 신청 확인 모달 */}
      <ApplicationConfirmModal
        isOpen={modalOpen}
        onClose={onCloseModal}
        onConfirm={onConfirmApplication}
        policyName={selectedPolicy ? getName(selectedPolicy) : ''}
        isApplying={applying === (selectedPolicy?.policyId || selectedPolicy?.id)}
      />
    </div>
  );
}

export default PolicyListPage;
