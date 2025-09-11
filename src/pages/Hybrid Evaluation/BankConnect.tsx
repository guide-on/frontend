import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaChevronRight, FaCheckCircle } from 'react-icons/fa';

const BANKS: { id: string; name: string; img: string }[] = [
  { id: 'kb', name: 'KB국민은행', img: '/images/banks/KB.png' },
  { id: 'shinhan', name: '신한은행', img: '/images/banks/Shinhan.png' },
  { id: 'woori', name: '우리은행', img: '/images/banks/Woori.png' },
  { id: 'hana', name: '하나은행', img: '/images/banks/Hana.png' },
  { id: 'nh', name: 'NH농협은행', img: '/images/banks/Nonghyup.png' },
  { id: 'kbank', name: '케이뱅크', img: '/images/banks/Kbank.png' },
  { id: 'ibk', name: 'IBK기업은행', img: '/images/banks/IBK.png' },
  { id: 'sc', name: 'SC제일은행', img: '/images/banks/Sc.png' },
  { id: 'city', name: '씨티은행', img: '/images/banks/City.png' },
  { id: 'post', name: '우체국', img: '/images/banks/PostOffice.png' },
  { id: 'kdb', name: 'KDB산업은행', img: '/images/banks/KDB.png' },
  { id: 'mg', name: '새마을금고', img: '/images/banks/MG.png' },
  { id: 'suhyup', name: '수협은행', img: '/images/banks/Suhyup.png' },
  { id: 'shinhyup', name: '신협은행', img: '/images/banks/Shinhyup.png' },
  { id: 'gwangju', name: '광주은행', img: '/images/banks/Gwangju.png' },
  { id: 'jeju', name: '제주은행', img: '/images/banks/Jeju.png' },
  { id: 'jeonbuk', name: '전북은행', img: '/images/banks/Jeonbuk.png' },
  { id: 'bnk', name: 'BNK부산/경남', img: '/images/banks/BNK.png' },
  { id: 'kyongnam', name: '경남은행', img: '/images/banks/Kyongnam.png' },
  { id: 'im', name: 'iM뱅크', img: '/images/banks/iM.png' },
];

const BankLogo = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="h-10 w-10 rounded-full grid place-items-center bg-paleBlue text-blue text-xs font-bold">
        {alt.substring(0, 2)}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-10 w-10 rounded-full object-contain bg-white border border-lightBlue/50"
      onError={() => setError(true)}
    />
  );
};

export default function BankConnect() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const canNext = selected.length > 0 && !loading;

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const onNext = () => {
    setLoading(true);
    setTimeout(() => {
      const targetPath = sessionId 
        ? `/bank-connect/complete/${sessionId}`
        : '/bank-connect/complete';
      
      navigate(targetPath, {
        replace: true,
        state: { banks: selected },
      });
    }, 1500);
  };

  return (
    <div className="px-4 py-6 space-y-4">
      <h1 className="text-xl font-extrabold text-navy">계좌연결</h1>
      <p className="text-sm text-gray-600">
        연결할 은행을 선택하세요. 복수 선택 가능합니다.
      </p>

      <div className="mt-2 grid grid-cols-2 gap-3">
        {BANKS.map((b) => {
          const active = selected.includes(b.id);
          return (
            <button
              key={b.id}
              aria-pressed={active}
              onClick={() => toggle(b.id)}
              className={[
                'group relative flex items-center gap-3 rounded-xl border p-3.5 bg-white/90 backdrop-blur-sm transition-all',
                active
                  ? 'border-blue ring-2 ring-blue/25 shadow-sm'
                  : 'border-gray-200 hover:bg-gray-50/90 hover:shadow-sm',
              ].join(' ')}
            >
              <BankLogo src={b.img} alt={b.name} />
              <div className="flex-1 text-left leading-tight">
                <div className="text-[13px] font-semibold text-gray-900 truncate">
                  {b.name}
                </div>
              </div>
              {active ? (
                <FaCheckCircle className="absolute right-2 top-2 text-blue" />
              ) : (
                <FaChevronRight className="text-gray-300 group-hover:text-gray-400" />
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!canNext}
        className="w-full rounded-lg py-3.5 text-white font-semibold bg-navy hover:bg-blue shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </button>

      {loading && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/80">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-lightBlue border-t-blue" />
          <div className="mt-4 text-sm text-gray-600">연결 중...</div>
        </div>
      )}
    </div>
  );
}
