import React from 'react';
import { colors } from '../../styles/colors'; // Import colors

// Define FundDetail type here for clarity and type safety
type FundDetail = {
  id: number;
  name: string;
  status: string;
  target: string;
  rate: string;
  term: string;
  limitAmount: string;
  saved: boolean;
  purpose: string;
  createdAt: string;
  updatedAt?: string;
  categoryCode: string;
  year: number;
};

interface FundDetailModalProps {
  open: boolean;
  onClose: () => void;
  fund: FundDetail | null; // Use the defined type
}

const FundDetailModal: React.FC<FundDetailModalProps> = ({
  open,
  onClose,
  fund,
}) => {
  if (!open || !fund) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md relative shadow-xl flex flex-col" style={{ maxHeight: '90vh' }}>
        
        <h2 className="font-bold text-2xl mb-4 text-gray-800" style={{ color: colors.navy }}>{fund.name}</h2>

        <div className="flex-grow overflow-y-auto no-scrollbar pr-2">
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.gray }}>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">상태: </span>
              <span className={`font-bold ${fund.status === '마감' ? 'text-red-500' : 'text-green-600'}`}>
                {fund.status}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">북마크: </span>
              <span className="text-yellow-400">{fund.saved ? '★' : '☆'}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg col-span-2">
              <p className="text-xs text-gray-500">지원대상</p>
              <p className="font-semibold text-sm text-gray-800">{fund.target}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">대출용도</p>
              <p className="font-semibold text-sm text-gray-800">{fund.purpose}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">대출기간</p>
              <p className="font-semibold text-sm text-gray-800">{fund.term}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">대출한도</p>
              <p className="font-semibold text-sm text-gray-800">{fund.limitAmount}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">금리</p>
              <p className="font-semibold text-sm text-gray-800">{fund.rate}</p>
            </div>
            
          </div>
        </div>

        <button
          className="mt-4 py-3 rounded-lg text-white text-lg font-semibold w-full"
          style={{ backgroundColor: colors.navy }}
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default FundDetailModal;
