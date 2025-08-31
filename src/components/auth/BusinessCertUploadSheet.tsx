import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectFile?: (file: File) => void;
};

const BusinessCertUploadSheet: React.FC<Props> = ({
  open,
  onClose,
  onSelectFile,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('overflow-hidden');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('overflow-hidden');
    };
  }, [open, onClose]);

  const accept = useMemo(
    () => 'image/jpeg,image/png,image/jpg,image/tiff,application/pdf',
    [],
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const handleBrowseClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const max = 5 * 1024 * 1024; // 5MB
    if (file.size > max) {
      window.alert('5MB 이하의 파일만 업로드할 수 있습니다.');
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleConfirm = useCallback(() => {
    if (!selectedFile) return;
    onSelectFile?.(selectedFile);
    onClose();
  }, [onSelectFile, onClose, selectedFile]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="px-5 pt-4 pb-5">
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-200" />
          <div className="flex items-start gap-2 mb-1">
            <h3 className="text-lg font-extrabold text-slate-900">
              사업자등록증 업로드
            </h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            업로드한 사업자 등록증은 자동입력 후 즉시 파기됩니다.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-slate-600 transition-colors ${dragOver ? 'bg-slate-50 border-slate-400' : 'bg-slate-100 border-slate-300 hover:bg-slate-50'}`}
          >
            <i className="fa-solid fa-upload fa-2x mb-3 text-slate-500" />
            {selectedFile ? (
              <>
                <span className="font-semibold">{selectedFile.name}</span>
                <span className="mt-1 text-xs text-slate-500">선택됨</span>
              </>
            ) : (
              <span className="font-bold">파일 첨부</span>
            )}
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          <p className="mt-3 text-[11px] leading-4 text-slate-500">
            5MB 이내의 JPG, PNG, JPEG, TIF, PDF 단일 페이지 파일만 첨부 가능
          </p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border-2 border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedFile}
              className="flex-1 rounded-md py-3 text-sm font-bold text-white disabled:opacity-50 next-button"
            >
              업로드
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default BusinessCertUploadSheet;
