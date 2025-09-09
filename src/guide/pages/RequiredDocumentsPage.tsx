import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/styles/colors';
import { getDocumentStatus, type DocumentGroup } from '@/api/documentApi';

export function RequiredDocumentsPage() {
  const { sessionId = '' } = useParams();
  const location = useLocation();
  const nav = useNavigate();
  const [documentGroups, setDocumentGroups] = useState<DocumentGroup[]>([]);
  const [policyName, setPolicyName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session-level progress
  const [progressPercentage, setProgressPercentage] = useState<number | null>(null);
  const [totalRequirements, setTotalRequirements] = useState<number | null>(null);
  const [completedRequirements, setCompletedRequirements] = useState<number | null>(null);

  // Mydata redirect state
  const [hasMydataChecked, setHasMydataChecked] = useState(false);

  const loadDocuments = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      // 서류 상태 조회 API 호출 (이제 이 API가 서류 목록과 상태를 모두 반환)
      console.log(`🔄 API 요청: GET /api/document/status/${sessionId}`);
      const statusData = await getDocumentStatus(sessionId);
      console.log(`✅ API 응답: GET /api/document/status/${sessionId}`, statusData.success !== false ? 'SUCCESS' : 'FAILED');

      // documentGroups를 DocumentGroup 형태로 변환
      const documentGroups = statusData.documentGroups.map(group => ({
        groupKey: group.groupKey,
        label: group.label,
        minSelect: group.minSelect,
        description: group.description,
        documents: group.documents.map(doc => ({
          documentId: doc.id,
          name: doc.name,
          mydataEligible: doc.mydataEligible,
          status: (doc.uploadStatus === 'COMPLETED' || doc.uploadStatus === 'UPLOADED') ? 'completed' as const : 'pending' as const,
        })),
        isCompleted: group.isCompleted,
        completedCount: group.submitted,
      }));

      setDocumentGroups(documentGroups);
      setPolicyName(statusData.policyName || '');

      // 세션 레벨 진행도 반영
      if (typeof statusData.progressPercentage === 'number') setProgressPercentage(Math.round(statusData.progressPercentage));
      if (typeof statusData.totalRequirements === 'number') setTotalRequirements(statusData.totalRequirements);
      if (typeof statusData.completedRequirements === 'number') setCompletedRequirements(statusData.completedRequirements);

      // 최초 로드 시 마이데이터 연동 체크 및 리다이렉트
      if (!hasMydataChecked && documentGroups.length > 0) {
        setHasMydataChecked(true);
        
        const hasMydataDocuments = documentGroups.some(group => 
          group.documents.some(doc => doc.mydataEligible)
        );
        
        if (hasMydataDocuments) {
          // 마이데이터 대상 서류가 있는지 체크 (1개라도 연동되어 있으면 연동 완료로 간주)
          const hasSyncedDocuments = documentGroups.some(group =>
            group.documents.some(doc => doc.mydataEligible && doc.status === 'completed')
          );
          
          if (!hasSyncedDocuments) {
            // 연동되지 않은 마이데이터 서류가 있으면 마이데이터 연동 페이지로 이동
            console.log('🔀 마이데이터 연동 필요 -> MydataConsentPage로 리다이렉트');
            nav(`/guide/mydata/${sessionId}`);
            return;
          }
        }
      }

    } catch (e: any) {
      console.error(`❌ API 실패:`, e.message);
      setError(e?.message || '필요 서류를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [sessionId, hasMydataChecked, nav]);

  // 최초 진입 및 라우트 키 변경(뒤로가기/앞으로가기 포함) 시 갱신
  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, loadDocuments]);

  // 탭 재활성화(다시 보기) 시 갱신
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadDocuments();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadDocuments]);

  const getGroupStatus = (group: DocumentGroup & { completedCount?: number; isCompleted?: boolean }) => {
    const completedCount = typeof group.completedCount === 'number' ? group.completedCount : group.documents.filter((doc) => doc.status === 'completed').length;
    if (group.isCompleted === true || completedCount >= group.minSelect) {
      return 'completed';
    }
    if (completedCount > 0) {
      return 'partial';
    }
    return 'pending';
  };

  const getStatusIcon = (status: 'completed' | 'partial' | 'pending') => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'partial':
        return '◐';
      case 'pending':
      default:
        return '○';
    }
  };

  const getStatusColor = (status: 'completed' | 'partial' | 'pending') => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'partial':
        return '#f59e0b';
      case 'pending':
      default:
        return '#6b7280';
    }
  };

  const onBack = () => nav(-1);
  const onGroupClick = (group: DocumentGroup) => nav(`/guide/upload/${sessionId}/${group.groupKey}`);


  return (
    <div className="max-w-[375px] mx-auto px-4 py-5 flex flex-col gap-4">
      <section className="rounded-xl p-4" style={{ backgroundColor: colors.gray }}>
        <p className="font-bold text-lg mb-1">필요 서류 안내</p>
        <p className="text-sm leading-5">
          {policyName && <span className="font-semibold">{policyName}</span>}
          {policyName && ' '}신청에 필요한 서류 목록입니다. 각 그룹별로 서류를 준비해주세요!
        </p>
      </section>

      {loading && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-600">서류 목록을 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 rounded-lg font-semibold text-white"
            style={{ backgroundColor: colors.navy }}
          >
            이전으로 돌아가기
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* 세션 진행도 바 (총 서류 수, 제출 수) */}
          {typeof progressPercentage === 'number' && (
            <section className="bg-white rounded-lg p-4 border" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold">서류 제출 진행도</div>
                  <div className="text-xs text-gray-500">{completedRequirements ?? 0}/{totalRequirements ?? 0}개 제출</div>
                </div>
                <div className="text-sm font-bold" style={{ color: colors.navy }}>{progressPercentage}%</div>
              </div>

              <div className="w-full h-3 rounded-full bg-gray-200">
                <div className="h-3 rounded-full" style={{ width: `${progressPercentage}%`, background: progressPercentage === 100 ? '#10B981' : '#F59E0B' }} />
              </div>
            </section>
          )}

          {documentGroups.length > 0 && (
            <section>
              <h2 className="font-bold text-lg mb-3">서류 그룹 ({documentGroups.length}개)</h2>
              <div className="flex flex-col gap-3">
                {documentGroups.map((group) => {
                  const status = getGroupStatus(group);
                  const completedCount = typeof (group as any).completedCount === 'number' ? (group as any).completedCount : group.documents.filter((doc) => doc.status === 'completed').length;

                  return (
                    <div
                      key={group.groupKey}
                      className="bg-white rounded-lg p-4 border cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onGroupClick(group)}
                      style={{ borderColor: '#e5e7eb' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: getStatusColor(status) }}
                          >
                            {getStatusIcon(status)}
                          </div>
                          <div>
                            <div className="font-semibold text-base">{group.label}</div>
                            <div className="text-xs text-gray-500">
                              {completedCount}/{group.minSelect}개 완료 (최소 {group.minSelect}개 필요)
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-400">→</div>
                      </div>

                      {group.description && (
                        <div className="text-sm text-gray-600 mb-3">{group.description}</div>
                      )}

                      <div className="flex flex-col gap-1">
                        {group.documents.slice(0, 2).map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span
                              className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
                              style={{
                                backgroundColor: doc.status === 'completed' ? '#22c55e' : '#e5e7eb',
                                color: doc.status === 'completed' ? 'white' : '#6b7280',
                              }}
                            >
                              {doc.status === 'completed' ? '✓' : '○'}
                            </span>
                            <span className={doc.status === 'completed' ? 'text-green-700' : 'text-gray-600'}>
                              {doc.name}
                            </span>
                            {doc.mydataEligible && (
                              <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">마이데이터</span>
                            )}
                          </div>
                        ))}
                        {group.documents.length > 2 && (
                          <div className="text-xs text-gray-500 mt-1">+{group.documents.length - 2}개 더보기</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {documentGroups.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">필요한 서류 그룹이 없습니다.</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-lg font-semibold border"
              style={{ borderColor: colors.navy, color: colors.navy }}
            >
              이전으로
            </button>
            <button
              className="flex-1 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: colors.navy }}
              onClick={() => {
                const allCompleted = documentGroups.every((group) => getGroupStatus(group) === 'completed');
                if (allCompleted) {
                  alert('모든 서류가 준비되었습니다! 신청을 진행합니다.');
                } else {
                  alert('아직 완료되지 않은 서류 그룹이 있습니다. 각 그룹을 클릭하여 서류를 업로드해주세요.');
                }
              }}
            >
              {documentGroups.every((group) => getGroupStatus(group) === 'completed') ? '신청 완료하기' : '서류 확인 중'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default RequiredDocumentsPage;
