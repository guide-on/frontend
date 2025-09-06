import { FaClock } from 'react-icons/fa';
import { colors } from '../../styles/colors';

const LoadingOverlay = ({ progress }: { progress: number }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-white px-6 pt-10 pb-8">
      {/* Top clock ring */}
      <div className="relative h-28 w-28">
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: `6px solid ${colors.lightBlue}` }}
        />
        <div
          className="absolute inset-2 rounded-full grid place-items-center"
          style={{ backgroundColor: colors.paleBlue }}
        >
          <FaClock style={{ color: colors.blue, fontSize: 24 }} />
        </div>
      </div>

      {/* Title & subtitle */}
      <h1 className="mt-6 text-2xl font-extrabold">신용도 분석 중</h1>
      <p className="mt-2 text-center text-sm" style={{ color: '#6B7280' }}>
        고객님의 신용정보를 안전하게
        <br />분석하고 있습니다
      </p>

      {/* Progress bar with labels */}
      <div className="mt-5 w-[312px] max-w-full">
        <div className="flex items-center justify-between text-[11px]" style={{ color: '#6B7280' }}>
          <span>분석 완료!</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded" style={{ backgroundColor: colors.lightBlue, opacity: 0.5 }}>
          <div
            className="h-full rounded"
            style={{ width: `${progress}%`, backgroundColor: colors.blue }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="mt-6 w-full max-w-sm space-y-3">
        {[
          { t: '개인정보 확인', s: '본인인증 정보를 확인하고 있습니다' },
          { t: '신용정보 수집', s: '금융기관 신용정보를 수집하고 있습니다' },
          { t: '신용점수 계산', s: '종합 신용점수를 계산하고 있습니다' },
        ].map((row) => (
          <div
            key={row.t}
            className="flex items-center gap-3 rounded-xl border p-4"
            style={{ borderColor: '#E5E7EB', backgroundColor: colors.white }}
          >
            <div
              className="grid h-8 w-8 place-items-center rounded-full"
              style={{ backgroundColor: colors.paleBlue, color: colors.blue }}
            >
              <FaClock />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: '#111827' }}>
                {row.t}
              </div>
              <div className="text-xs" style={{ color: '#6B7280' }}>
                {row.s}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom indicator & tip */}
      <div className="mt-8 text-center">
        <div className="mx-auto mb-3 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.lightBlue }} />
          <span className="h-1.5 w-3 rounded-full" style={{ backgroundColor: colors.blue }} />
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.lightBlue }} />
        </div>
        <div className="text-xs" style={{ color: '#9CA3AF' }}>
          잠시만 기다려주세요
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
