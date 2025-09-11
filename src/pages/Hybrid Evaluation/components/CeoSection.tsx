import { FaQuestionCircle } from 'react-icons/fa';

type CategoryKey = 'sales' | 'cashflow' | 'esg' | 'ceo';

interface CeoSectionProps {
  content: { title: string; desc: string; items: string[] };
  completed: Record<CategoryKey, boolean>;
  error: string | null;
  isSubmitting: boolean;
  onHelpClick: () => void;
  onConsentClick: () => void;
  onSubmit: () => void;
}

export const CeoSection: React.FC<CeoSectionProps> = ({
  content,
  completed,
  error,
  isSubmitting,
  onHelpClick,
  onConsentClick,
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
            신용정보 조회 동의:
            <br />
          </span>{' '}
          신용점수를 조회하기 위한 서비스 이용 약관 및 개인(신용)정보 조회 동의
          절차를 진행합니다.
        </p>
        <button
          aria-label="신용정보 조회 동의"
          onClick={onConsentClick}
          className="w-full rounded-xl py-3 text-white font-medium bg-blue hover:bg-navy transition"
        >
          신용정보 조회 동의
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="mt-4 w-full rounded-md py-3 text-white font-semibold bg-navy hover:bg-blue shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '처리 중...' : '제출하기'}
      </button>
    </>
  );
};
