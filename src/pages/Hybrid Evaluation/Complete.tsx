import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';



const HybridEvaluationComplete = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  
  console.log('🔍 [HybridEvaluationComplete] URL sessionId:', sessionId);
  
  const confetti = useMemo(() => {
    const colors = ['#1F6FFF', '#62A1FF', '#B3D4FF', '#16a34a', '#f59e0b', '#ef4444'];
    return Array.from({ length: 42 }).map((_, i) => {
      const left = (i * 37) % 100; // 0~99
      const delay = (i % 10) * 0.15; // 0~1.35s
      const duration = 3.6 + (i % 6) * 0.28; // 3.6~5.0s
      const size = 6 + (i % 4) * 2; // 6,8,10,12
      const rotate = (i * 17) % 360;
      const bg = colors[i % colors.length];
      return { id: i, left, delay, duration, size, rotate, bg };
    });
  }, []);

  return (
    <>

      <div className="relative px-4 py-10 min-h-screen flex items-center justify-center">
      <style>{`
        @keyframes rise {
          0%   { transform: translateY(0) rotate(var(--r)); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(-120%) rotate(calc(var(--r) + 180deg)); opacity: 0; }
        }
        @keyframes pulseIn {
          0% { transform: scale(.6); opacity: 0 }
          70% { transform: scale(1.04); opacity: 1 }
          100% { transform: scale(1); opacity: 1 }
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        @keyframes draw {
          to { stroke-dashoffset: 0 }
        }
        @keyframes burst {
          0% { transform: scale(0.8); opacity: .9 }
          60% { transform: scale(1.1); opacity: 1 }
          100% { transform: scale(1); opacity: 1 }
        }
      `}</style>

      <div className="w-full max-w-md relative overflow-hidden rounded-2xl border border-lightBlue/60 shadow-sm">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'linear-gradient(135deg, #E8F1FF 0%, #F3F8FF 30%, #E7FFF7 60%, #F5F0FF 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientMove 10s ease infinite',
          }}
        />

        <div className="absolute -top-16 left-6 h-48 w-48 rounded-full blur-3xl opacity-40" style={{ background: '#93c5fd' }} />
        <div className="absolute -bottom-20 -right-8 h-56 w-56 rounded-full blur-3xl opacity-30" style={{ background: '#c4b5fd' }} />

        <div className="relative flex flex-col items-center px-6 py-10 text-center">
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-white/70 backdrop-blur border border-lightBlue/50 shadow" style={{ animation: 'pulseIn 600ms ease-out both' }}>
              <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="#93C5FD" strokeWidth="4" opacity="0.35" />
                <circle cx="24" cy="24" r="22" stroke="#1F6FFF" strokeWidth="4" strokeLinecap="round" strokeDasharray="138" strokeDashoffset="138" style={{ animation: 'draw 900ms 150ms ease forwards' }} />
                <path d="M16 24.5l5 5 11-11" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="36" strokeDashoffset="36" style={{ animation: 'draw 700ms 450ms ease forwards' }} />
              </svg>
            </div>
            <span className="absolute -inset-1 rounded-full animate-ping bg-blue/20" />
          </div>

          <h1 className="mt-5 text-[22px] font-extrabold leading-tight text-navy">
            하이브리드 신용평가가 완료되었습니다!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            제출하신 정보를 바탕으로 신용평가가 성공적으로 마무리되었습니다.
          </p>

          <div className="mt-6 grid w-full max-w-sm grid-cols-3 gap-3">
            <div className="rounded-xl border border-lightBlue/50 bg-white/70 px-3 py-3 backdrop-blur">
              <div className="text-[10px] text-gray-500">진행 상태</div>
              <div className="mt-1 text-sm font-semibold text-blue">완료</div>
            </div>
            <div className="rounded-xl border border-lightBlue/50 bg-white/70 px-3 py-3 backdrop-blur">
              <div className="text-[10px] text-gray-500">분석 단계</div>
              <div className="mt-1 text-sm font-semibold text-navy">모두 통과</div>
            </div>
            <div className="rounded-xl border border-lightBlue/50 bg-white/70 px-3 py-3 backdrop-blur">
              <div className="text-[10px] text-gray-500">처리 시간</div>
              <div className="mt-1 text-sm font-semibold text-emerald-600">신속</div>
            </div>
          </div>

          <div className="mt-7 w-full max-w-sm space-y-3">
            <Link
              to="/"
              className="block w-full rounded-md bg-navy px-4 py-3 text-center font-semibold text-white shadow-md transition hover:bg-blue"
            >
              메인으로 가기
            </Link>
            <Link
              to="/hybrid-evaluation"
              className="block w-full rounded-md border border-lightBlue/70 bg-white px-4 py-3 text-center font-semibold text-navy transition hover:bg-paleBlue"
            >
              하이브리드 평가 홈으로
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0">
          {confetti.map((c) => (
            <span
              key={c.id}
              className="absolute block"
              style={{
                left: `${c.left}%`,
                bottom: '-10%',
                width: c.size,
                height: c.size * 2,
                background: c.bg,
                borderRadius: 2,
                transform: `rotate(${c.rotate}deg)`,
                animation: `rise ${c.duration}s ${c.delay}s linear infinite`,
              }}
            />
          ))}
        </div>
      </div>
      </div>

    </>
  );
};

export default HybridEvaluationComplete;
