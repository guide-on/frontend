import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/styles/colors';
import { mydataSync } from '@/api/documentApi';

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
      await mydataSync(sessionId, {
        serviceTerms: !!checked.serviceTerms,
        privacyPolicy: !!checked.privacyPolicy,
        thirdPartyConsent: !!checked.thirdPartyConsent,
      });
      nav(`/guide/mydata-result/${sessionId}`);
    } catch (e: any) {
      setError(e?.message || '연동 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onSkip = () => nav(`/guide/documents/${sessionId}`);

  return (
    <div className="max-w-[375px] mx-auto px-4 py-5 flex flex-col gap-4">
      {/* Header with back */}
      <div className="flex items-center gap-3">
        <button onClick={() => nav(-1)} className="text-gray-600 px-2 py-1">←</button>
        <div className="flex-1">
          <p className="font-bold text-lg mb-1">마이데이터 연동 동의</p>
          <p className="text-sm text-gray-600">서류 자동 수집을 위해 아래 약관에 동의해 주세요. 원하지 않으면 건너뛰실 수 있습니다.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {AGREEMENTS.map((a) => (
          <div key={a.key} className="bg-white rounded-xl p-4 border" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={!!checked[a.key]} onChange={() => toggle(a.key)} className="mt-1" />
                <div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-xs text-gray-500">{a.summary}</div>
                </div>
              </div>
              <button className="text-sm text-gray-500" onClick={() => toggleExpand(a.key)}>
                {expanded[a.key] ? '접기' : '자세히 보기'}
              </button>
            </div>
            {expanded[a.key] && (
              <div className="mt-3 text-sm text-gray-700 border-t pt-3">{a.detail}</div>
            )}
          </div>
        ))}
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="mt-4">
        <button
          onClick={onConfirm}
          className="w-full py-3 rounded-lg font-semibold text-white mb-2"
          style={{ backgroundColor: allChecked ? colors.navy : '#9ca3af' }}
          disabled={!allChecked || loading}
        >
          {loading ? '연동 중…' : '동의하고 연동하기'}
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
