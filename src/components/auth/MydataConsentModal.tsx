import React, { useState } from 'react';
import { colors } from '@/styles/colors';

type Agreements = {
  serviceTerms: boolean;
  privacyPolicy: boolean;
  thirdPartyConsent: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (agreements: Agreements) => Promise<void>;
  onSkip: () => void;
  loading?: boolean;
};

export default function MydataConsentModal({ open, onClose, onConfirm, onSkip, loading }: Props) {
  const [agreements, setAgreements] = useState<Agreements>({
    serviceTerms: false,
    privacyPolicy: false,
    thirdPartyConsent: false,
  });

  const allChecked = agreements.serviceTerms && agreements.privacyPolicy && agreements.thirdPartyConsent;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-[360px] bg-white rounded-xl p-5" style={{ border: `1px solid ${colors.paleBlue}` }}>
        <div className="text-lg font-bold mb-2">마이데이터 연동 안내</div>
        <div className="text-sm text-gray-600 mb-4">서류 자동 수집(마이데이터)을 위해 아래 약관에 동의해주세요. 동의하지 않으면 수동으로 파일을 업로드하셔야 합니다.</div>

        <div className="space-y-3 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={agreements.serviceTerms}
              onChange={(e) => setAgreements(a => ({ ...a, serviceTerms: e.target.checked }))}
            />
            <div className="text-sm">서비스 이용 약관 동의</div>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={agreements.privacyPolicy}
              onChange={(e) => setAgreements(a => ({ ...a, privacyPolicy: e.target.checked }))}
            />
            <div className="text-sm">개인정보 처리방침 동의</div>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={agreements.thirdPartyConsent}
              onChange={(e) => setAgreements(a => ({ ...a, thirdPartyConsent: e.target.checked }))}
            />
            <div className="text-sm">제3자 제공 동의</div>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => {
                const v = e.target.checked;
                setAgreements({ serviceTerms: v, privacyPolicy: v, thirdPartyConsent: v });
              }}
            />
            <div className="text-sm">모두 동의</div>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 py-3 rounded-lg font-semibold border"
            style={{ borderColor: colors.navy, color: colors.navy }}
            disabled={loading}
          >
            동의하지 않음
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!allChecked) return alert('모두 동의해 주세요.');
              await onConfirm(agreements);
            }}
            className="flex-1 py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: colors.navy }}
            disabled={loading}
          >
            {loading ? '연동 중…' : '동의하고 연동하기'}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
