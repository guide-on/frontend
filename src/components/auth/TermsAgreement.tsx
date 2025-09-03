// src/components/auth/TermsAgreement.tsx
import React, { useCallback, useMemo, useState } from 'react';

export type Agreements = {
  terms: boolean;
  privacy: boolean;
};

type Props = {
  value: Agreements; // 부모의 동의 상태
  onChange: (next: Agreements) => void; // 상태 변경 콜백
};

const TermsAgreement: React.FC<Props> = ({ value, onChange }) => {
  // 모달 상태
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // 모든 필수 약관에 동의했는지
  const allAgreed = useMemo(() => value.terms && value.privacy, [value]);

  // 전체 동의 체크박스 핸들러
  const handleAllChecked = useCallback(
    (checked: boolean) => {
      onChange({ terms: checked, privacy: checked });
    },
    [onChange],
  );

  // 개별 체크박스 핸들러
  const toggleTerm = useCallback(
    (key: keyof Agreements) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, [key]: e.target.checked });
    },
    [value, onChange],
  );

  // 모달 열기/닫기
  const openTermsModal = useCallback(() => setShowTermsModal(true), []);
  const openPrivacyModal = useCallback(() => setShowPrivacyModal(true), []);
  const closeTermsModal = useCallback(() => {
    setShowTermsModal(false);
    onChange({ ...value, terms: true }); // 닫을 때 동의 처리 (원본 로직 유지)
  }, [onChange, value]);
  const closePrivacyModal = useCallback(() => {
    setShowPrivacyModal(false);
    onChange({ ...value, privacy: true }); // 닫을 때 동의 처리
  }, [onChange, value]);

  return (
    <div>
      {/* 전체 동의 */}
      <div className="mb-4 py-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={allAgreed}
            onChange={(e) => handleAllChecked(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-2 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-slate-700 font-semibold">전체 동의</span>
        </label>
      </div>

      {/* 개별 동의 */}
      <div className="space-y-4 mb-8">
        {/* 서비스 이용약관 */}
        <div className="flex items-start gap-3">
          <label className="flex items-center gap-3 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={value.terms}
              onChange={toggleTerm('terms')}
              className="w-4 h-4 text-blue-600 border-2 border-slate-300 rounded focus:ring-blue-500 mt-1"
            />
            <span className="text-slate-700 text-sm">
              <span className="font-bold">[필수]</span> 서비스 이용약관 동의
            </span>
          </label>
          <button
            type="button"
            onClick={openTermsModal}
            className="text-slate-500 hover:text-slate-700 p-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* 개인정보 수집·이용 동의 */}
        <div className="flex items-start gap-3">
          <label className="flex items-center gap-3 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={value.privacy}
              onChange={toggleTerm('privacy')}
              className="w-4 h-4 text-blue-600 border-2 border-slate-300 rounded focus:ring-blue-500 mt-1"
            />
            <span className="text-slate-700 text-sm">
              <span className="font-bold">[필수]</span> 개인정보 수집·이용
              동의서
            </span>
          </label>
          <button
            type="button"
            onClick={openPrivacyModal}
            className="text-slate-500 hover:text-slate-700 p-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 약관 모달 */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">
                서비스 이용약관
              </h3>
              <button
                type="button"
                onClick={closeTermsModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="text-sm text-slate-700 space-y-4 leading-relaxed">
                <div>
                  <h4 className="font-bold mb-2">제1조 (목적)</h4>
                  <p>
                    본 약관은 뱅크랩 (이하 "회사")이 제공하는 금융 분석·비교
                    서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의
                    권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로
                    합니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">제2조 (용어의 정의)</h4>
                  <p>
                    1. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를
                    이용하는 회원을 말합니다.
                  </p>
                  <p>
                    2. "회원"이란 회사와 서비스 이용계약을 체결하고 회원ID를
                    부여받은 자를 말합니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">제3조 (약관의 효력과 변경)</h4>
                  <p>
                    1. 본 약관은 이용자가 동의하고 회원가입을 완료한 시점부터
                    효력이 발생합니다.
                  </p>
                  <p>
                    2. 회사는 관계 법령을 위배하지 않는 범위에서 약관을 개정할
                    수 있으며, 변경 시 사전 공지 후 적용합니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">제4조 (서비스의 제공)</h4>
                  <p>
                    1. 회사는 회원에게 금융 분석·비교, 관련 정보 제공, 기타
                    부가서비스를 제공합니다.
                  </p>
                  <p>
                    2. 서비스의 내용은 회사의 정책에 따라 변경될 수 있습니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">제5조 (회원가입 및 자격)</h4>
                  <p>
                    1. 회원가입은 이용자가 약관에 동의하고, 회사가 정한 가입
                    양식에 필수 정보를 입력한 후 가입 절차를 완료하면
                    성립합니다.
                  </p>
                  <p>2. 회원 자격은 다음 각 호의 사유가 없는 한 유지됩니다.</p>
                  <p className="ml-4">- 가입 신청 시 허위 내용을 기재한 경우</p>
                  <p className="ml-4">- 법령 또는 본 약관을 위반한 경우</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">제6조 (회원의 의무)</h4>
                  <p>회원은 서비스 이용 시 다음 행위를 하여서는 안 됩니다.</p>
                  <p>- 타인의 정보 도용</p>
                  <p>- 법령 또는 선량한 풍속에 반하는 행위</p>
                  <p>- 서비스 운영을 방해하는 행위</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">제7조 (회사의 의무)</h4>
                  <p>
                    회사는 관련 법령과 본 약관이 금지하거나 미풍양속에 반하는
                    행위를 하지 않으며, 안정적으로 서비스를 제공하기 위해 최선을
                    다합니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">
                    제8조 (계약 해지 및 이용 제한)
                  </h4>
                  <p>
                    회원이 서비스 해지를 원할 경우, 회원 탈퇴 절차를 통해 해지할
                    수 있습니다. 회사는 회원이 법령 또는 본 약관을 위반한 경우
                    사전 통지 후 이용을 제한하거나 계약을 해지할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">제9조 (손해배상 및 면책)</h4>
                  <p>
                    1. 회사의 고의 또는 중대한 과실로 발생한 손해에 대해서는
                    책임을 부담합니다.
                  </p>
                  <p>2. 불가항력으로 인한 서비스 중단에 대해서는 면책됩니다.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">
                    제10조 (준거법 및 재판관할)
                  </h4>
                  <p>
                    본 약관은 대한민국 법령에 따라 해석되며, 서비스와 관련하여
                    발생한 분쟁은 회사의 본점 소재지 관할 법원에 제소합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200">
              <button
                type="button"
                onClick={closeTermsModal}
                className="next-button w-full text-white py-3 rounded-md font-bold transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보 모달 */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">
                개인정보 수집·이용 동의서
              </h3>
              <button
                type="button"
                onClick={closePrivacyModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="text-sm text-slate-700 space-y-4 leading-relaxed">
                <p>
                  회사는 「개인정보 보호법」 및 관련 법령에 따라 회원가입 및
                  서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다.
                </p>
                <div>
                  <h4 className="font-bold mb-2">1. 수집 항목</h4>
                  <p>- 필수: 이름, 생년월일, 성별, 휴대폰번호, 이메일</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">2. 수집·이용 목적</h4>
                  <p>- 본인 확인 및 회원가입 절차 진행</p>
                  <p>- 회원관리(서비스 이용 및 상담, 공지사항 전달)</p>
                  <p>- 금융 분석 및 비교 서비스 제공</p>
                  <p>- 서비스 개선, 통계 분석</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">3. 보유·이용 기간</h4>
                  <p>- 회원 탈퇴 시까지 보관 후 즉시 파기</p>
                  <p>
                    - 단, 관계 법령에 따라 보존이 필요한 경우 해당 법령에서 정한
                    기간 동안 보관
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">
                    4. 동의 거부 권리 및 불이익
                  </h4>
                  <p>
                    - 귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가
                    있습니다.
                  </p>
                  <p>
                    - 다만, 필수 항목에 대한 동의를 거부하실 경우 회원가입 및
                    서비스 이용이 불가합니다.
                  </p>
                </div>
                <p className="font-semibold">
                  위 내용을 충분히 이해하였으며, 개인정보 수집·이용에
                  동의합니다.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200">
              <button
                type="button"
                onClick={closePrivacyModal}
                className="next-button w-full text-white py-3 rounded-md font-bold transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SFC <style scoped> 대체용 보조 스타일 */}
      <style>{`
        .next-button { background: var(--point-color); border: none; touch-action: manipulation; }
        .next-button:hover { background: #63b6ae; }
        .next-button:disabled { background: var(--logo-color); }
        input[type='checkbox']:checked { background-color: #2563eb; border-color: #2563eb; }
        .overflow-y-auto::-webkit-scrollbar { width: 6px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default TermsAgreement;
