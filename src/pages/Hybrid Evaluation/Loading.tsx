import { FaClock } from 'react-icons/fa';
import { colors } from '../../styles/colors';

const LoadingOverlay = ({ progress }: { progress: number }) => {
  const radius = 44;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, progress)) / 100);

  const stepIndex = progress < 34 ? 0 : progress < 67 ? 1 : 2;
  const steps = [
    { t: '개인정보 확인', s: '본인인증 정보를 확인하고 있습니다' },
    { t: '신용정보 수집', s: '금융기관 신용정보를 수집하고 있습니다' },
    { t: '신용점수 계산', s: '종합 신용점을 계산하고 있습니다' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-white px-6 pt-10 pb-8" aria-live="polite">
      <style>
        {`
        @keyframes slide {
          0% { transform: translateX(-100%); opacity: .0; }
          10% { opacity: .25; }
          50% { opacity: .35; }
          100% { transform: translateX(100%); opacity: .0; }
        }
        `}
      </style>

      {/* Animated ring + SVG progress */}
      <div className="relative h-28 w-28">
        {/* rotating rim */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{ border: `6px solid ${colors.lightBlue}`, borderTopColor: colors.blue, animationDuration: '2s' }}
        />
        {/* progress ring */}
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={colors.paleBlue}
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={colors.blue}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 200ms ease' }}
          />
        </svg>
        {/* center icon */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-10 w-10 place-items-center rounded-full" style={{ backgroundColor: colors.paleBlue, color: colors.blue }}>
            <FaClock />
          </div>
        </div>
      </div>

      {/* Title & subtitle */}
      <h1 className="mt-6 text-2xl font-extrabold text-navy">신용도 분석 중</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        고객님의 신용정보를 안전하게
        <br />분석하고 있습니다
      </p>

      {/* Progress bar with shimmer */}
      <div className="mt-5 w-[312px] max-w-full">
        <div className="flex items-center justify-between text-[11px] text-gray-600">
          <span>분석 진행</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded" style={{ backgroundColor: `${colors.lightBlue}33` }}>
          <div
            className="h-full rounded"
            style={{ width: `${progress}%`, backgroundColor: colors.blue, transition: 'width 250ms ease' }}
          />
          {/* shimmer scanner */}
          <div
            className="pointer-events-none absolute h-2 w-12 rounded"
            style={{ backgroundColor: `${colors.white}66`, animation: 'slide 1.6s ease-in-out infinite' }}
          />
        </div>
      </div>

      {/* Steps with active highlight */}
      <div className="mt-6 w-full max-w-sm space-y-3">
        {steps.map((row, i) => {
          const active = i === stepIndex;
          const done = i < stepIndex;
          return (
            <div
              key={row.t}
              className="flex items-center gap-3 rounded-xl border p-4 bg-white border-lightBlue/50"
            >
              <div className="relative h-8 w-8">
                <div
                  className="absolute inset-0 rounded-full grid place-items-center"
                  style={{ backgroundColor: active ? colors.paleBlue : done ? colors.blue : colors.paleBlue, color: done ? colors.white : colors.blue }}
                >
                  {done ? '✓' : <FaClock />}
                </div>
                {active && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ backgroundColor: `${colors.lightBlue}55` }}
                  />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{row.t}</div>
                <div className="text-xs text-gray-600">{row.s}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom indicator & tip */}
      <div className="mt-8 text-center">
        <div className="mx-auto mb-3 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-lightBlue animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-blue animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-lightBlue animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <div className="text-xs text-gray-400">잠시만 기다려주세요</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
