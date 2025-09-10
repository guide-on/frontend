import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/styles/colors';
import { mydataSync } from '@/api/documentApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

type Agreement = {
  key: 'serviceTerms' | 'privacyPolicy' | 'thirdPartyConsent';
  title: string;
  summary: string;
  detail: string;
};

const AGREEMENTS: Agreement[] = [
  {
    key: 'serviceTerms',
    title: '서비스 이용 약관',
    summary: '마이데이터 서비스 이용을 위한 약관입니다.',
    detail: '서비스 이용 약관 상세 내용이 여기에 표시됩니다. 실제 약관 내용을 보여주세요.',
  },
  {
    key: 'privacyPolicy',
    title: '개인정보 처리방침',
    summary: '마이데이터 수집/처리 관련 개인정보 처리 방침입니다.',
    detail: '개인정보 처리방침 상세 내용이 여기에 표시됩니다. 실제 약관 내용을 보여주세요.',
  },
  {
    key: 'thirdPartyConsent',
    title: '제3자 제공 동의',
    summary: '제3자에게 정보 제공에 대한 동의입니다.',
    detail: '제3자 제공 동의 상세 내용이 여기에 표시됩니다. 실제 약관 내용을 보여주세요.',
  },
];

export default function MydataConsentPage() {
  const { sessionId = '' } = useParams();
  const nav = useNavigate();
  const [checked, setChecked] = useState<Record<string, boolean>>({
    serviceTerms: false,
    privacyPolicy: false,
    thirdPartyConsent: false,
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[2] 동의 페이지 로드 ID: ${sessionId}`);
  }, [sessionId]);

  const toggle = (k: string) => setChecked((s) => ({ ...s, [k]: !s[k] }));
  const toggleExpand = (k: string) => setExpanded((s) => ({ ...s, [k]: !s[k] }));

  const allChecked = checked.serviceTerms && checked.privacyPolicy && checked.thirdPartyConsent;

  const onConfirm = async () => {
    if (!allChecked) return alert('모두 동의해 주세요.');
    setLoading(true);
    setError(null);
    try {
      // 마이데이터 연동 시도 기록 (영구 저장)
      localStorage.setItem(`mydata_attempted_${sessionId}`, 'true');
      
      await mydataSync(sessionId, {
        serviceTerms: !!checked.serviceTerms,
        privacyPolicy: !!checked.privacyPolicy,
        thirdPartyConsent: !!checked.thirdPartyConsent,
      });
      nav(`/guide/mydata-result/${sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '연동 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onSkip = () => {
    // 마이데이터 연동 시도 기록 (건너뛰기도 시도한 것으로 간주, 영구 저장)
    localStorage.setItem(`mydata_attempted_${sessionId}`, 'true');
    nav(`/guide/documents/${sessionId}`);
  };

  return (
    <div className="w-full min-h-screen py-5 flex flex-col gap-4" style={{ backgroundColor: colors.bgSoft }}>
      {/* Header */}
      <section className="rounded-xl p-4 bg-white mx-4">
        <p className="font-bold text-lg mb-1">마이데이터 연동 동의</p>
        <p className="text-sm text-gray-600">서류 자동 수집을 위해 아래 약관에 동의해 주세요.<br />원하지 않으면 건너뛰실 수 있습니다.</p>
      </section>

      <div className="flex flex-col gap-3 mx-4">
        {AGREEMENTS.map((a) => (
          <div key={a.key} className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-all" onClick={() => toggle(a.key)}>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={!!checked[a.key]} onChange={() => toggle(a.key)} className="mt-1 pointer-events-none" />
                <div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-xs text-gray-500">{a.summary}</div>
                </div>
              </div>
              <button className="text-sm text-gray-500" onClick={(e) => { e.stopPropagation(); toggleExpand(a.key); }}>
                {expanded[a.key] ? '접기' : '자세히 보기'}
              </button>
            </div>
            {expanded[a.key] && (
              <div className="mt-3 text-sm text-gray-700 border-t pt-3">{a.detail}</div>
            )}
          </div>
        ))}
      </div>

      {error && <div className="text-sm text-red-600 mx-4">{error}</div>}

      <div className="mt-4 mx-4">
        <button
          onClick={onConfirm}
          className="w-full py-3 rounded-lg font-semibold text-white mb-2 flex items-center justify-center gap-2"
          style={{ backgroundColor: allChecked ? colors.navy : '#9ca3af' }}
          disabled={!allChecked || loading}
        >
          {loading && <LoadingSpinner type="dots" size="sm" color="white" />}
          {loading ? '마이데이터 연동 중' : '동의하고 연동하기'}
        </button>

        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-sm text-gray-600"
            disabled={loading}
          >
            연동하지 않고 서류 제출
          </button>
        </div>
      </div>
    </div>
  );
}
