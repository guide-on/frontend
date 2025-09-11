import { useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { ESG_STEPS } from './EsgSteps';
import { UploadCard } from './UploadCard';
import { FaQuestionCircle, FaTimes } from 'react-icons/fa';
import StoreMap from './StoreMap';
import api from '@/api';

type CategoryKey = 'sales' | 'cashflow' | 'esg' | 'ceo';

const Modal = ({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[343px] max-h-[calc(100vh-64px)] mx-4 overflow-auto rounded-xl bg-white shadow-lg">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-white/95 px-4 py-3 backdrop-blur">
          {title ? (
            <h4 className="text-sm font-extrabold tracking-tight text-navy">
              {title}
            </h4>
          ) : (
            <div />
          )}
          <button
            aria-label="닫기"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        <div className="px-4 py-3">{children}</div>
      </div>
    </div>
  );
};

interface EsgSectionProps {
  completed: Record<CategoryKey, boolean>;
  onHelpClick: () => void;
  onAttachHelpClick: () => void;
  onComplete: () => void;
}

export const EsgSection: React.FC<EsgSectionProps> = ({
  completed,
  onHelpClick,
  onAttachHelpClick,
  onComplete,
}) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [esgStep, setEsgStep] = useState(1);
  const [esgFiles, setEsgFiles] = useState<Record<number, string | undefined>>({
    1: undefined,
    2: undefined,
    3: undefined,
    31: undefined,
    32: undefined,
  });
  const [step1Manual, setStep1Manual] = useState({
    electricityCustomerNumber: '',
    gasCustomerNumber: '',
    waterCustomerNumber: '',
    energyEfficiencyRate: '',
    energyEfficiencyBusinessNumber: '',
    highEfficiencyDeviceBusinessNumber: '',
    totalApplianceCount: '',
    highEfficiencyApplianceCount: '',
  });
  const [step2Manual, setStep2Manual] = useState({
    yellowUmbrellaId: '',
    businessName: '',
  });
  const [step3Mydata, setStep3Mydata] = useState({
    serviceTerms: false,
    privacyPolicy: false,
    thirdPartyConsent: false,
  });
  const [step3Loading, setStep3Loading] = useState(false);
  const [step3Error, setStep3Error] = useState<string | null>(null);
  const [isEnergyModalOpen, setEnergyModalOpen] = useState(false);
  const [isMydataSuccessModalOpen, setMydataSuccessModalOpen] = useState(false);

  const currentStep = ESG_STEPS[esgStep - 1];

  const handleStep1ManualChange = (
    field: keyof typeof step1Manual,
    value: string,
  ) => {
    setStep1Manual({ ...step1Manual, [field]: value });
  };

  const handleStep2ManualChange = (
    field: keyof typeof step2Manual,
    value: string,
  ) => {
    setStep2Manual({ ...step2Manual, [field]: value });
  };

  const handleStep3MydataToggle = (key: keyof typeof step3Mydata) => {
    setStep3Mydata((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStep3MydataSync = async () => {
    const allChecked =
      step3Mydata.serviceTerms &&
      step3Mydata.privacyPolicy &&
      step3Mydata.thirdPartyConsent;
    if (!allChecked) {
      alert('모두 동의해 주세요.');
      return;
    }

    setStep3Loading(true);
    setStep3Error(null);

    try {
      // 마이데이터 연동 API 호출 (실제 구현에서는 mydataSync 함수 사용)
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 시뮬레이션
      // 성공 시 처리
      setMydataSuccessModalOpen(true);
    } catch (e) {
      setStep3Error(
        e instanceof Error ? e.message : '연동 중 오류가 발생했습니다.',
      );
    } finally {
      setStep3Loading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setEsgFiles((prev) => ({ ...prev, [esgStep]: file.name }));
  };

  const handleSentimentalAnalysis = async () => {
    if (!sessionId) {
      console.error('Session ID not found');
      return;
    }

    try {
      const response = await api.get(`http://localhost:8000/sentimental-analysis-result/${sessionId}`);
      console.log('Sentimental analysis result:', response.data);
      // 성공적으로 API 호출 완료 후 다음 단계로 이동
      setEsgStep(3);
    } catch (error) {
      console.error('Error calling sentimental analysis API:', error);
      // 에러가 발생해도 다음 단계로 이동 (필요에 따라 수정 가능)
      setEsgStep(3);
    }
  };

  return (
    <>
      <h3 className="text-xl font-bold text-navy">{currentStep.title}</h3>
      <p className="text-sm text-gray-600">{currentStep.desc}</p>

      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">평가 항목</span>
        <button
          aria-label="도움말"
          onClick={onHelpClick}
          className="text-blue hover:text-navy"
        >
          <FaQuestionCircle />
        </button>
      </div>

      <div className="rounded-xl p-3 text-sm space-y-1 shadow-[0_12px_36px_rgba(17,24,39,0.06)] bg-white">
        {currentStep.items.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span>•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* {esgStep === 1 || esgStep === 2 ? (
        <div className="flex items-center gap-2 pt-2">
          <span className="font-semibold text-gray-900">수기 입력</span>
        </div>
      ) : esgStep === 3 ? (
        <div className="flex items-center gap-2 pt-2">
          <span className="font-semibold text-gray-900">마이데이터 연동</span>
        </div>
      ) : null} */}

      {/* 자원관리 섹션 */}
      {esgStep === 1 && (
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              에너지 자원 관리
            </span>
            <button
              aria-label="에너지 자원 관리 도움말"
              onClick={() => setEnergyModalOpen(true)}
              className="text-blue hover:text-navy"
            >
              <FaQuestionCircle />
            </button>
          </div>
          <div className="mt-2 space-y-3">
            <div className="rounded-xl p-3 space-y-3 shadow-[0_12px_36px_rgba(17,24,39,0.06)] bg-white">
              <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-2 p-3">
                <label className="text-sm text-gray-700">
                  <span className="block font-medium mb-2">
                    한국전력공사 고객번호
                  </span>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    value={step1Manual.electricityCustomerNumber}
                    onChange={(e) =>
                      handleStep1ManualChange(
                        'electricityCustomerNumber',
                        e.target.value,
                      )
                    }
                    placeholder="'&mdash;' 없이 10자리 숫자 입력"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  <span className="block font-medium mb-2">
                    도시가스 고객번호
                  </span>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    value={step1Manual.gasCustomerNumber}
                    onChange={(e) =>
                      handleStep1ManualChange(
                        'gasCustomerNumber',
                        e.target.value,
                      )
                    }
                    placeholder="7-17자리의 고유 번호 입력"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  <span className="block font-medium mb-2">
                    상수도요금 고객번호
                  </span>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    value={step1Manual.waterCustomerNumber}
                    onChange={(e) =>
                      handleStep1ManualChange(
                        'waterCustomerNumber',
                        e.target.value,
                      )
                    }
                    placeholder="'&mdash;' 없이 14자리 숫자 입력"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">에너지 효율성</span>
              <button
                aria-label="에너지 효율성 도움말"
                onClick={() => setEnergyModalOpen(true)}
                className="text-blue hover:text-navy"
              >
                <FaQuestionCircle />
              </button>
            </div>
            <div className="mt-2 space-y-3">
              <div className="rounded-xl p-3 space-y-3 shadow-[0_12px_36px_rgba(17,24,39,0.06)] bg-white">
                <div className="space-y-2 grid grid-cols-1 gap-2 p-3">
                  <div className="space-y-2">
                    <span className="block font-medium mb-2 text-sm text-gray-700">
                      에너지효율등급 가전 비율 계산
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-sm text-gray-700">
                        <span className="block font-medium mb-1">
                          전체 가전 개수
                        </span>
                        <input
                          type="number"
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          value={step1Manual.totalApplianceCount || ''}
                          onChange={(e) =>
                            handleStep1ManualChange(
                              'totalApplianceCount',
                              e.target.value,
                            )
                          }
                          placeholder="개수 입력"
                          min="0"
                        />
                      </label>
                      <label className="text-sm text-gray-700">
                        <span className="block font-medium mb-1">
                          효율 1등급 가전 개수
                        </span>
                        <input
                          type="number"
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          value={step1Manual.highEfficiencyApplianceCount || ''}
                          onChange={(e) =>
                            handleStep1ManualChange(
                              'highEfficiencyApplianceCount',
                              e.target.value,
                            )
                          }
                          placeholder="개수 입력"
                          min="0"
                          max={step1Manual.totalApplianceCount || undefined}
                        />
                      </label>
                    </div>
                    {step1Manual.totalApplianceCount &&
                      step1Manual.highEfficiencyApplianceCount && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <span className="text-sm font-medium text-gray-700">
                            계산된 비율:{' '}
                            <span className="text-blue font-semibold">
                              {Math.round(
                                (Number(
                                  step1Manual.highEfficiencyApplianceCount,
                                ) /
                                  Number(step1Manual.totalApplianceCount)) *
                                  100,
                              )}
                              %
                            </span>
                          </span>
                        </div>
                      )}
                  </div>
                  <label className="text-sm text-gray-700">
                    <span className="block font-medium mb-2">
                      에너지효율향상 지원 사업 참여 여부
                    </span>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      value={step1Manual.energyEfficiencyBusinessNumber}
                      onChange={(e) =>
                        handleStep1ManualChange(
                          'energyEfficiencyBusinessNumber',
                          e.target.value,
                        )
                      }
                      placeholder='사업자 번호 입력 (예: "123-45-67890")'
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="block font-medium mb-2">
                      고효율기기 구매 지원 사업 참여 여부
                    </span>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      value={step1Manual.highEfficiencyDeviceBusinessNumber}
                      onChange={(e) =>
                        handleStep1ManualChange(
                          'highEfficiencyDeviceBusinessNumber',
                          e.target.value,
                        )
                      }
                      placeholder='사업자 번호 입력 (예: "123-45-67890")'
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {esgStep === 2 && (
        <div className="space-y-4">
          {/* 지역사회 상생 섹션 */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                지역사회 상생 - 노란우산 공제 정보
              </span>
              <button
                aria-label="지역사회 상생 도움말"
                onClick={() => setEnergyModalOpen(true)}
                className="text-blue hover:text-navy"
              >
                <FaQuestionCircle />
              </button>
            </div>
            <div className="mt-2 space-y-3">
              <div className="rounded-xl p-3 space-y-3 shadow-[0_12px_36px_rgba(17,24,39,0.06)] bg-white">
                <div className="space-y-2 p-3">
                  <label className="text-sm text-gray-700">
                    <span className="block font-medium mb-2">
                      노란우산 공제 아이디
                    </span>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      value={step2Manual.yellowUmbrellaId}
                      onChange={(e) =>
                        handleStep2ManualChange(
                          'yellowUmbrellaId',
                          e.target.value,
                        )
                      }
                      placeholder="노란우산 공제 아이디 입력"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 고객 만족 및 안전도 섹션 */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                고객 리뷰 만족도
              </span>
              <button
                aria-label="고객 리뷰 만족도 도움말"
                onClick={() => setEnergyModalOpen(true)}
                className="text-blue hover:text-navy"
              >
                <FaQuestionCircle />
              </button>
            </div>
            <div className="mt-2 space-y-3">
              <div className="rounded-xl p-3 space-y-3 shadow-[0_12px_36px_rgba(17,24,39,0.06)] bg-white">
                <div className="space-y-2 p-3">
                  <StoreMap />
                  <label className="text-sm text-gray-700"></label>
                </div>
              </div>
            </div>
          </div>

          {/* 식품/위생 안전 관리 섹션 */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                식품/위생 안전 관리
              </span>
              <button
                aria-label="식품/위생 안전 관리 도움말"
                onClick={onAttachHelpClick}
                className="text-blue hover:text-navy"
              >
                <FaQuestionCircle />
              </button>
            </div>
            <div className="mt-2 space-y-3">
              <span className="font-medium text-gray-700 text-sm">
                위생 등급 참여 내역 (외식업의 경우)
              </span>
              <UploadCard
                fileName={esgFiles[esgStep]}
                onPdfPicked={handleFileUpload}
              />
            </div>
          </div>
        </div>
      )}

      {esgStep === 3 && (
        <div className="space-y-4">
          {/* 마이데이터 연동 섹션 */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                마이데이터 활용 동의
              </span>
              <button
                aria-label="마이데이터 연동 도움말"
                onClick={() => setEnergyModalOpen(true)}
                className="text-blue hover:text-navy"
              >
                <FaQuestionCircle />
              </button>
            </div>
            <div className="mt-2 space-y-3">
              <div className="rounded-xl p-3 space-y-3 shadow-[0_12px_36px_rgba(17,24,39,0.06)] bg-white">
                <div className="space-y-4 p-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-4">
                      성실납세 이력, 4대 보험료 납부 이력 자동 수집을 위해
                      <br />
                      아래 약관에 동의해 주세요.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div
                      className="bg-gray-50 rounded-lg p-3 border cursor-pointer hover:border-gray-300 transition-colors"
                      onClick={() => handleStep3MydataToggle('serviceTerms')}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={step3Mydata.serviceTerms}
                          onChange={() =>
                            handleStep3MydataToggle('serviceTerms')
                          }
                          className="pointer-events-none"
                        />
                        <div>
                          <div className="font-semibold text-sm">
                            서비스 이용 약관
                          </div>
                          <div className="text-xs text-gray-500">
                            마이데이터 서비스 이용을 위한 약관입니다.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="bg-gray-50 rounded-lg p-3 border cursor-pointer hover:border-gray-300 transition-colors"
                      onClick={() => handleStep3MydataToggle('privacyPolicy')}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={step3Mydata.privacyPolicy}
                          onChange={() =>
                            handleStep3MydataToggle('privacyPolicy')
                          }
                          className="pointer-events-none"
                        />
                        <div>
                          <div className="font-semibold text-sm">
                            개인정보 처리방침
                          </div>
                          <div className="text-xs text-gray-500">
                            마이데이터 수집/처리 관련 개인정보 처리 방침입니다.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="bg-gray-50 rounded-lg p-3 border cursor-pointer hover:border-gray-300 transition-colors"
                      onClick={() =>
                        handleStep3MydataToggle('thirdPartyConsent')
                      }
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={step3Mydata.thirdPartyConsent}
                          onChange={() =>
                            handleStep3MydataToggle('thirdPartyConsent')
                          }
                          className="pointer-events-none"
                        />
                        <div>
                          <div className="font-semibold text-sm">
                            제3자 제공 동의
                          </div>
                          <div className="text-xs text-gray-500">
                            제3자에게 정보 제공에 대한 동의입니다.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {step3Error && (
                    <div className="text-sm text-red-600">{step3Error}</div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={handleStep3MydataSync}
                      className={`w-full py-3 rounded-lg font-semibold text-white mb-2 transition ${
                        step3Mydata.serviceTerms &&
                        step3Mydata.privacyPolicy &&
                        step3Mydata.thirdPartyConsent &&
                        !step3Loading
                          ? 'bg-navy hover:bg-blue'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      disabled={
                        !(
                          step3Mydata.serviceTerms &&
                          step3Mydata.privacyPolicy &&
                          step3Mydata.thirdPartyConsent
                        ) || step3Loading
                      }
                    >
                      {step3Loading ? '연동 중…' : '동의하고 연동하기'}
                    </button>

                    <div className="text-center">
                      <button
                        className="text-sm text-gray-600"
                        disabled={step3Loading}
                      >
                        연동하지 않고 서류 제출
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 알레르기 유발 성분 표시 섹션 */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                알레르기 유발 성분 표시
              </span>
              <button
                aria-label="알레르기 유발 성분 표시 도움말"
                onClick={onAttachHelpClick}
                className="text-blue hover:text-navy"
              >
                <FaQuestionCircle />
              </button>
            </div>
            <div className="mt-2 space-y-3">
              <UploadCard
                fileName={esgFiles[31]} // step 3-1용 파일
                onPdfPicked={(f) => {
                  setEsgFiles((prev) => ({ ...prev, 31: f.name }));
                }}
              />
            </div>
          </div>

          {/* 원산지/가격 표시 준수 섹션 */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                원산지/가격 표시 준수
              </span>
              <button
                aria-label="원산지/가격 표시 준수 도움말"
                onClick={onAttachHelpClick}
                className="text-blue hover:text-navy"
              >
                <FaQuestionCircle />
              </button>
            </div>
            <div className="mt-2 space-y-3">
              <UploadCard
                fileName={esgFiles[32]} // step 3-2용 파일
                onPdfPicked={(f) => {
                  setEsgFiles((prev) => ({ ...prev, 32: f.name }));
                }}
              />
            </div>
          </div>
        </div>
      )}

      {esgStep === 1 && (
        <button
          onClick={() => setEsgStep(2)}
          className="mt-4 w-full rounded-md py-3 text-white font-semibold bg-navy hover:bg-blue shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      )}
      {esgStep === 2 && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setEsgStep(1)}
            className="flex-1 rounded-md border border-gray-300 py-3 text-gray-700"
          >
            이전
          </button>
          <button
            onClick={handleSentimentalAnalysis}
            className="flex-1 rounded-md py-3 text-white bg-blue hover:bg-navy transition"
          >
            다음
          </button>
        </div>
      )}
      {esgStep === 3 && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setEsgStep(2)}
            className="flex-1 rounded-md border border-gray-300 py-3 text-gray-700"
          >
            이전
          </button>
          <button
            onClick={onComplete}
            className="flex-1 rounded-md py-3 text-white bg-blue hover:bg-navy transition"
          >
            완료
          </button>
        </div>
      )}

      <Modal
        open={isEnergyModalOpen}
        onClose={() => setEnergyModalOpen(false)}
        title="에너지 자원 관리 도움말"
      >
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            에너지 자원 관리는 기업의 환경 경영과 지속가능성을 평가하는 중요한
            지표입니다.
          </p>

          <div className="space-y-2">
            <h5 className="font-semibold text-gray-800">평가 항목 설명</h5>

            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-md">
                <h6 className="font-medium text-gray-800 mb-1">
                  전력 사용량 관리
                </h6>
                <p className="text-xs text-gray-600">
                  한국전력공사 고객번호를 통해 전력 사용 효율성과 절약 노력을
                  평가합니다.
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <h6 className="font-medium text-gray-800 mb-1">
                  가스 사용량 관리
                </h6>
                <p className="text-xs text-gray-600">
                  도시가스 사용량을 통해 에너지 효율성과 친환경 경영을
                  평가합니다.
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <h6 className="font-medium text-gray-800 mb-1">
                  상수도 사용량 관리
                </h6>
                <p className="text-xs text-gray-600">
                  물 사용량 관리를 통해 자원 절약과 환경 보호 노력을 확인합니다.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <h6 className="font-medium text-blue-800 mb-1">
              에너지 효율화 사업
            </h6>
            <p className="text-xs text-blue-600">
              정부 지원 에너지 효율화 사업 참여는 기업의 친환경 경영 의지와
              실질적인 에너지 절약 노력을 보여주는 중요한 지표입니다.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        open={isMydataSuccessModalOpen}
        onClose={() => setMydataSuccessModalOpen(false)}
        title="마이데이터 연동 완료"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-900">
              연동이 완료되었습니다!
            </h4>
            <p className="text-sm text-gray-600">
              성실납세 이력과 4대 보험료 납부 이력이
              <br />
              성공적으로 수집되었습니다.
            </p>
          </div>
          <button
            onClick={() => setMydataSuccessModalOpen(false)}
            className="w-full py-3 rounded-lg font-semibold text-white bg-navy hover:bg-blue transition"
          >
            확인
          </button>
        </div>
      </Modal>
    </>
  );
};
