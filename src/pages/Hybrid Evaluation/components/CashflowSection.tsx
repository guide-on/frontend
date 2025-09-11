import { FaQuestionCircle } from 'react-icons/fa';

type CategoryKey = 'sales' | 'cashflow' | 'esg' | 'ceo';

interface CashflowSectionProps {
  content: { title: string; desc: string; items: string[] };
  completed: Record<CategoryKey, boolean>;
  error: string | null;
  isSubmitting: boolean;
  isBankConsentCompleted: boolean;
  onHelpClick: () => void;
  onBankConsentClick: () => void;
  onSubmit?: () => void;
}

export const CashflowSection: React.FC<CashflowSectionProps> = ({
  content,
  completed,
  error,
  isSubmitting,
  isBankConsentCompleted,
  onHelpClick,
  onBankConsentClick,
  onSubmit,
}) => {
  return (
    <>
      <h3 className="text-xl font-bold text-navy">{content.title}</h3>
      <p className="text-sm text-gray-600">{content.desc}</p>

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

      <div className="rounded-xl p-3 text-sm space-y-1  bg-white shadow-[0_12px_36px_rgba(17,24,39,0.06)]">
        {content.items.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span>•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 rounded-xl border p-3 space-y-4 bg-paleBlue/30 shadow-[0_12px_36px_rgba(17,24,39,0.06)]">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">
            계좌연결 및 조회 동의:
            <br />
          </span>{' '}
          현금흐름 분석을 위해 사업자(또는 대표자) 명의 계좌를 연결하고 최근
          거래내역 조회에 동의해 주세요.
        </p>
        <button
          aria-label="계좌연결 및 조회 동의"
          onClick={onBankConsentClick}
          disabled={isBankConsentCompleted}
          className={`w-full rounded-xl py-3 text-white font-medium transition ${
            isBankConsentCompleted
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue hover:bg-navy'
          }`}
        >
          {isBankConsentCompleted ? '동의 완료' : '계좌연결 및 조회 동의'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={isSubmitting || !onSubmit}
        className="mt-4 w-full rounded-md py-3 text-white font-semibold bg-navy hover:bg-blue shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '처리 중...' : '제출하기'}
      </button>
    </>
  );
};
