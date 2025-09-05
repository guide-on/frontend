import React, { useCallback, useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import BusinessCertUploadSheet from '@/components/auth/BusinessCertUploadSheet';
import type { BusinessInfoUI } from '@/utils/signup';
import KsicModal from '@/components/auth/KsicModal';

type Props = {
  totalSteps: number;
  value: BusinessInfoUI;
  onChange: (v: BusinessInfoUI) => void;
  isValid: boolean;
  onPrev: () => void;
  onSubmit: () => void;
  submitting: boolean;
};

const StepBusiness: React.FC<Props> = ({ totalSteps, value, onChange, isValid, onPrev, onSubmit, submitting }) => {
  const [openPostcode, setOpenPostcode] = useState(false);
  const [showBizUpload, setShowBizUpload] = useState(false);
  const [openKsic, setOpenKsic] = useState(false);

  const handleCompletePostcode = useCallback((data: any) => {
    const road = data.roadAddress || data.address || '';
    const sggCode: string = (data.sigunguCode as string) || (data.bcode ? String(data.bcode).slice(0, 5) : '');
    onChange({
      ...value,
      businessSggCode: (sggCode || '').slice(0, 5),
      addrRoad: road,
    });
    setOpenPostcode(false);
  }, [onChange, value]);

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative">
      <div className="absolute top-6 right-6">
        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">{`5/${totalSteps}`}</span>
      </div>

      <div className="mb-2">
        <h2 className="text-xl font-bold text-slate-800">사업자 정보</h2>
        <p className="text-slate-600 text-sm">유효한 사업자 정보를 입력해주세요.</p>
      </div>

      <button type="button" onClick={() => setShowBizUpload(true)} className="w-full border rounded-md py-3 my-5 text-gray-500 cursor-pointer hover:bg-slate-100">
        <div className="flex items-center justify-center gap-2">
          <i className="fa-solid fa-file-arrow-up fa-lg leading-none"></i>
          <span className="font-extrabold text-sm">사업자등록증으로 자동입력</span>
        </div>
      </button>

      <div className="mb-4">
        <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
          <span className="ps-1">사업자 등록 번호</span>
          <button type="button" className="ml-auto px-2.5 py-1 rounded-md text-xs font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
            사업자번호 인증
          </button>
        </label>
        <div className="flex items-center gap-2">
          <input value={value.bno1} onChange={(e) => onChange({ ...value, bno1: e.target.value.replace(/[^0-9]/g, '').slice(0, 3) })} className="w-1/3 px-3 py-2 border-2 border-slate-200 rounded-lg text-center" />
          <span className="text-slate-500">-</span>
          <input value={value.bno2} onChange={(e) => onChange({ ...value, bno2: e.target.value.replace(/[^0-9]/g, '').slice(0, 2) })} className="w-1/3 px-3 py-2 border-2 border-slate-200 rounded-lg text-center" />
          <span className="text-slate-500">-</span>
          <input value={value.bno3} onChange={(e) => onChange({ ...value, bno3: e.target.value.replace(/[^0-9]/g, '').slice(0, 5) })} className="w-1/3 px-3 py-2 border-2 border-slate-200 rounded-lg text-center" />
        </div>
      </div>

      <div className="mb-4">
        <label className="flex text-sm font-semibold text-slate-700 mb-1.5 ps-1">업체명</label>
        <input value={value.bizName} onChange={(e) => onChange({ ...value, bizName: e.target.value })} className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg" />
      </div>

      <div className="mb-4">
        <label className="flex text-sm font-semibold text-slate-700 mb-1.5 ps-1">업종</label>
        <div className="flex gap-2">
          <input value={value.ksicName || ''} readOnly placeholder="업종선택으로 입력" className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg bg-slate-50" />
          <button type="button" onClick={() => setOpenKsic(true)} className="px-3 py-2 border-2 border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 inline-flex items-center justify-center">업종선택</button>
        </div>
      </div>

      <div className="mb-4">
        <label className="flex text-sm font-semibold text-slate-700 mb-1.5 ps-1">개업일자</label>
        <input type="date" value={value.openDate} onChange={(e) => onChange({ ...value, openDate: e.target.value })} className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg" />
      </div>

      <div className="mb-6">
        <label className="flex text-sm font-semibold text-slate-700 mb-1.5 ps-1">사업장 주소</label>
        <div className="flex gap-2 mb-2">
          <input value={value.addrRoad} readOnly placeholder="도로명 주소(주소 검색으로 입력)" className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg bg-slate-50 text-slate-700" />
          <button type="button" onClick={() => setOpenPostcode(true)} className="px-4 border-2 border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50">검색</button>
        </div>
        <input value={value.addrDetail} onChange={(e) => onChange({ ...value, addrDetail: e.target.value })} placeholder="상세주소 (선택)" className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg" />
      </div>

      <div className="flex gap-3">
        <button onClick={onPrev} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-md font-bold text-sm transition-all duration-200 hover:bg-slate-300">이전</button>
        <button onClick={onSubmit} disabled={!isValid || submitting} className="flex-1 next-button text-white py-3 rounded-md font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? (<><span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent inline-block mr-2" />가입 중...</>) : '가입하기'}</button>
      </div>

      {openPostcode && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <strong className="text-slate-800">주소 검색</strong>
              <button onClick={() => setOpenPostcode(false)} className="text-slate-500 hover:text-slate-700">닫기</button>
            </div>
            <div className="p-2">
              <DaumPostcode onComplete={handleCompletePostcode} style={{ width: '100%', height: 470 }} />
            </div>
          </div>
        </div>
      )}

      <KsicModal
        open={openKsic}
        onClose={() => setOpenKsic(false)}
        onSelect={(code, name) => {
          onChange({ ...value, ksicCode: code, ksicName: name });
          setOpenKsic(false);
        }}
      />

      <BusinessCertUploadSheet open={showBizUpload} onClose={() => setShowBizUpload(false)} onSelectFile={() => setShowBizUpload(false)} />
    </div>
  );
};

export default StepBusiness;
