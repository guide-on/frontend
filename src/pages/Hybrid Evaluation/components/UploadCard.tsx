import { useRef } from 'react';
import { FaFileUpload } from 'react-icons/fa';

interface UploadCardProps {
  onPdfPicked: (file: File) => void;
  fileName?: string;
  acceptedFileTypes?: string;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  onPdfPicked,
  fileName,
  acceptedFileTypes = 'application/pdf',
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/50 hover:bg-lightBlue/20 transition shadow-[0_12px_36px_rgba(17,24,39,0.06)]"
      >
        <FaFileUpload />
        <span className="text-sm">
          {fileName ? `업로드됨: ${fileName}` : '파일을 클릭하여 업로드'}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedFileTypes}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPdfPicked(f);
        }}
      />
    </div>
  );
};
