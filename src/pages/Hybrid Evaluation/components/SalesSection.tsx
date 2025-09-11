import { FaQuestionCircle } from 'react-icons/fa';
import { UploadCard } from './UploadCard';

type CategoryKey = 'sales' | 'cashflow' | 'esg' | 'ceo';

interface SalesSectionProps {
  content: { title: string; desc: string; items: string[] };
  fileNames: Record<CategoryKey, string | undefined>;
  completed: Record<CategoryKey, boolean>;
  error: string | null;
  isSubmitting: boolean;
  onHelpClick: () => void;
  onAttachHelpClick: () => void;
  onFileUpload: (file: File) => void;
  onSubmit: () => void;
}

export const SalesSection: React.FC<SalesSectionProps> = ({
  content,
  fileNames,
  completed,
  error,
  isSubmitting,
  onHelpClick,
  onAttachHelpClick,
  onFileUpload,
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

      <div className="rounded-md p-3 text-sm space-y-1 border border-gray-200 bg-white shadow-sm">
        {content.items.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span>•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

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

      <UploadCard fileName={fileNames.sales} onPdfPicked={onFileUpload} />

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
