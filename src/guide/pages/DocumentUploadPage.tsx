import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/styles/colors';
import {
  getDocumentStatus,
  uploadDocument,
  type DocumentGroup,
  type DocumentItem,
} from '@/api/documentApi';
import ProcessStepHeader from '@/components/guide/ProcessStepHeader';

export function DocumentUploadPage() {
  const { sessionId = '', groupKey = '' } = useParams();
  const nav = useNavigate();
  const [group, setGroup] = useState<DocumentGroup | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let hasLoaded = false;

    const loadDocumentGroup = async () => {
      if (!mounted || hasLoaded) return;

      hasLoaded = true;

      try {
        setLoading(true);
        setError(null);

        if (!sessionId || !groupKey) {
          if (mounted) {
            setError('세션 ID 또는 그룹 키가 없습니다. 다시 시도해주세요.');
          }
          return;
        }

        console.log(`🔄 API 요청: GET /api/document/status/${sessionId}`);
        const data = await getDocumentStatus(sessionId);
        console.log(
          `✅ API 응답: GET /api/document/status/${sessionId}`,
          data.success ? 'SUCCESS' : 'FAILED',
        );

        if (!mounted) return;

        const documentGroups = data.documentGroups || [];
        const foundGroup = documentGroups.find((g) => g.groupKey === groupKey);

        if (foundGroup) {
          const convertedGroup: DocumentGroup = {
            groupKey: foundGroup.groupKey,
            label: foundGroup.label,
            minSelect: foundGroup.minSelect,
            description: foundGroup.description,
            documents: foundGroup.documents.map((doc) => ({
              documentId: doc.id,
              name: doc.name,
              mydataEligible: doc.mydataEligible,
              isMydataRetrieved: doc.isMydataRetrieved || false,
              status:
                doc.uploadStatus === 'COMPLETED' ||
                doc.uploadStatus === 'UPLOADED'
                  ? ('completed' as const)
                  : ('pending' as const),
            })),
          };

          setGroup(convertedGroup);
          setDocuments(convertedGroup.documents);
        } else {
          setError(`해당 서류 그룹을 찾을 수 없습니다. 찾는 그룹: ${groupKey}`);
        }
      } catch (e: any) {
        console.error(
          `❌ API 실패: GET /api/document/status/${sessionId}`,
          e.message,
        );
        if (mounted) {
          setError(
            e?.message || '서류 정보를 불러오는 중 오류가 발생했습니다.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDocumentGroup();

    return () => {
      mounted = false;
    };
  }, [sessionId, groupKey]);

  const handleFileUpload = async (document: DocumentItem, file: File) => {
    if (!document.documentId) {
      alert('문서 ID가 없습니다. 관리자에게 문의하세요.');
      return;
    }

    try {
      setUploading(String(document.documentId));

      console.log(`🔄 API 요청: POST /api/document/upload/${sessionId}`, {
        documentId: document.documentId,
        fileName: file.name,
      });
      const result = await uploadDocument(sessionId, document.documentId, file);
      console.log(
        `✅ API 응답: POST /api/document/upload/${sessionId}`,
        result.success ? 'SUCCESS' : 'FAILED',
      );

      if (result.success) {
        // 로컬 상태 반영(낙관적 업데이트)
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.documentId === document.documentId
              ? { ...doc, status: 'completed' as const }
              : doc,
          ),
        );

        // 서버 상태 새로고침으로 정확한 진행도 동기화
        try {
          const status = await getDocumentStatus(sessionId);
          const foundGroup = status.documentGroups?.find(
            (g) => g.groupKey === groupKey,
          );
          if (foundGroup) {
            const refreshedDocs: DocumentItem[] = foundGroup.documents.map(
              (doc: any) => ({
                documentId: doc.id,
                name: doc.name,
                mydataEligible: doc.mydataEligible,
                isMydataRetrieved: doc.isMydataRetrieved || false,
                status:
                  doc.uploadStatus === 'COMPLETED' ||
                  doc.uploadStatus === 'UPLOADED'
                    ? 'completed'
                    : 'pending',
              }),
            );
            setDocuments(refreshedDocs);
          }
        } catch (err) {
          console.warn('서버 상태 동기화 실패, 로컬 상태 유지', err);
        }

        alert(`${document.name} 업로드가 완료되었습니다.`);
      } else {
        alert('업로드에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (e: any) {
      console.error(
        `❌ API 실패: POST /api/document/upload/${sessionId}`,
        e.message,
      );
      alert(
        `업로드 중 오류가 발생했습니다: ${e?.message || '알 수 없는 오류'}`,
      );
    } finally {
      setUploading(null);
    }
  };

  const onFileSelect = (
    document: DocumentItem,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      handleFileUpload(document, file);
    }
  };

  const getStatusIcon = (status: DocumentItem['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'failed':
        return '✗';
      case 'pending':
      default:
        return '○';
    }
  };

  const getStatusColor = (status: DocumentItem['status']) => {
    switch (status) {
      case 'completed':
        return '#22c55e'; // green
      case 'failed':
        return '#ef4444'; // red
      case 'pending':
      default:
        return '#6b7280'; // gray
    }
  };

  const completedCount = documents.filter(
    (doc) => doc.status === 'completed',
  ).length;
  const isGroupCompleted = group && completedCount >= group.minSelect;

  const onBack = () => {
    nav(-1);
  };

  return (
    <div
      className="w-full min-h-screen py-5 flex flex-col gap-4"
      style={{ backgroundColor: colors.bgSoft }}
    >
      <ProcessStepHeader currentStep={1} />
      
      <section className="rounded-xl p-4 bg-white mx-4">
        <p className="font-bold text-lg mb-1">서류 업로드</p>
        <p className="text-sm leading-5">
          {group && (
            <>
              <span className="font-semibold">{group.label}</span>
              <br />
              {group.description}
            </>
          )}
        </p>
      </section>

      {loading && (
        <div className="text-center py-8 mx-4">
          <p className="text-sm text-gray-600">서류 정보를 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8 mx-4">
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

      {!loading && !error && group && (
        <>
          {/* 진행 상태 */}
          <div className="bg-white rounded-lg p-4 mx-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-base">진행 상태</div>
                <div className="text-sm text-gray-600">
                  {completedCount}/{group.minSelect}개 완료 (최소{' '}
                  {group.minSelect}개 필요)
                </div>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{
                  backgroundColor: isGroupCompleted ? '#22c55e' : '#f59e0b',
                }}
              >
                {isGroupCompleted ? '✓' : `${completedCount}`}
              </div>
            </div>
          </div>

          {/* 서류 목록 */}
          <section className="mx-4">
            <h2 className="font-bold text-lg mb-3">
              서류 목록 ({documents.length}개)
            </h2>
            <div className="flex flex-col gap-3">
              {documents.map((doc, index) => (
                <div
                  key={doc.documentId || index}
                  className="bg-white rounded-lg p-4"
                >
                  {/* 서류 헤더 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: getStatusColor(doc.status) }}
                      >
                        {getStatusIcon(doc.status)}
                      </div>
                      <div>
                        <div className="font-semibold text-base">
                          {doc.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 업로드 섹션 */}
                  <div className="space-y-2">
                    {doc.status === 'completed' ? (
                      <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                        {doc.isMydataRetrieved
                          ? '마이데이터로 업로드 완료!'
                          : '업로드 완료!'}
                      </div>
                    ) : (
                      <>
                        {/* 파일 업로드 */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            id={`file-${doc.documentId || index}`}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => onFileSelect(doc, e)}
                            disabled={uploading === String(doc.documentId)}
                          />
                          <label
                            htmlFor={`file-${doc.documentId || index}`}
                            className={`cursor-pointer ${
                              uploading === String(doc.documentId)
                                ? 'opacity-50'
                                : ''
                            }`}
                          >
                            <div className="text-gray-500 text-sm mb-2">
                              📎 파일을 업로드하세요
                            </div>
                            <div className="text-xs text-gray-400">
                              PDF, 이미지, 문서 파일 (최대 10MB)
                            </div>
                          </label>
                        </div>

                        {/* 마이데이터 연동 버튼 */}
                        {doc.mydataEligible && (
                          <button
                            className="w-full py-2 px-4 rounded-lg border text-sm font-medium"
                            style={{
                              borderColor: colors.navy,
                              color: colors.navy,
                            }}
                            onClick={() =>
                              alert('마이데이터 연동 기능은 준비 중입니다.')
                            }
                          >
                            🔗 마이데이터로 자동 수집하기
                          </button>
                        )}
                      </>
                    )}

                    {uploading === String(doc.documentId) && (
                      <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                        📤 업로드 중...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 하단 버튼 */}
          <div className="mt-6 mx-4">
            <button
              className="w-full py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: colors.navy }}
              onClick={() => nav(`/guide/documents/${sessionId}`)}
            >
              서류 목록
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default DocumentUploadPage;
