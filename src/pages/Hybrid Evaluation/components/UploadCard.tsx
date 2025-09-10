import { useRef } from 'react';
import { FaFileUpload } from 'react-icons/fa';

interface UploadCardProps {
  onPdfPicked: (file: File) => void;
  fileName?: string;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  onPdfPicked,
  fileName,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  return (
    <div className="rounded-md p-4 space-y-3 border bg-white border-lightBlue/50">
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-paleBlue text-navy hover:bg-lightBlue/20 transition"
      >
        <FaFileUpload />
        <span>
          {fileName ? `업로드됨: ${fileName}` : '파일을 클릭하여 업로드'}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPdfPicked(f);
        }}
      />
    </div>
  );
};