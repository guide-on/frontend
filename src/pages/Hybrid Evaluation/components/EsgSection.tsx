import { useState } from 'react';
import { ESG_STEPS } from './EsgSteps';
import { UploadCard } from './UploadCard';
import { FaQuestionCircle } from 'react-icons/fa';

type CategoryKey = 'sales' | 'cashflow' | 'esg' | 'ceo';

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
  const [esgStep, setEsgStep] = useState(1);
  const [esgFiles, setEsgFiles] = useState<Record<number, string | undefined>>({
    1: undefined,
    2: undefined,
    3: undefined,
    4: undefined,
  });
  const [esgManual, setEsgManual] = useState({
    energyConsumption: '',
    recyclingRate: '',
    safetyIncidents: '',
    notes: '',
  });

  const currentStep = ESG_STEPS[esgStep - 1];

  const handleManualChange = (field: keyof typeof esgManual, value: string) => {
    setEsgManual({ ...esgManual, [field]: value });
  };

  const handleFileUpload = (file: File) => {
    setEsgFiles((prev) => ({ ...prev, [esgStep]: file.name }));
  };

  return (
    <>
      <h3 className="text-xl font-extrabold text-navy">{currentStep.title}</h3>
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

      <div className="rounded-md p-3 text-sm space-y-1 border border-gray-200 bg-white shadow-sm">
        {currentStep.items.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span>•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      {esgStep !== 4 ? (
        <>
          <div className="flex items-center gap-2 pt-2">
            <span className="font-semibold text-gray-900">관련 서류 첨부</span>
            <button
              aria-label="도움말"
              onClick={onAttachHelpClick}
              className="text-blue hover:text-navy"
            >
              <FaQuestionCircle />
            </button>
          </div>
          <UploadCard
            fileName={esgFiles[esgStep]}
            onPdfPicked={handleFileUpload}
          />
        </>
      ) : (
        <div className="flex items-center gap-2 pt-2">
          <span className="font-semibold text-gray-900">수기 입력</span>
        </div>
      )}

      {esgStep === 4 && (
        <div className="mt-2 rounded-md border p-3 space-y-3 bg-paleBlue/30 border-lightBlue">
          <div className="grid grid-cols-1 gap-3">
            <label className="text-sm text-gray-700">
              <span className="block font-medium mb-1">에너지 사용량(월간 kWh)</span>
              <input
                type="number"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={esgManual.energyConsumption}
                onChange={(e) => handleManualChange('energyConsumption', e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700">
              <span className="block font-medium mb-1">폐기물 재활용률(%)</span>
              <input
                type="number"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={esgManual.recyclingRate}
                onChange={(e) => handleManualChange('recyclingRate', e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700">
              <span className="block font-medium mb-1">안전사고 건수(월간)</span>
              <input
                type="number"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={esgManual.safetyIncidents}
                onChange={(e) => handleManualChange('safetyIncidents', e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700">
              <span className="block font-medium mb-1">기타 메모</span>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-[80px]"
                value={esgManual.notes}
                onChange={(e) => handleManualChange('notes', e.target.value)}
              />
            </label>
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
            onClick={() => setEsgStep(3)}
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
            onClick={() => setEsgStep(4)}
            className="flex-1 rounded-md py-3 text-white bg-blue hover:bg-navy transition"
          >
            다음
          </button>
        </div>
      )}
      {esgStep === 4 && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setEsgStep(3)}
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
    </>
  );
};