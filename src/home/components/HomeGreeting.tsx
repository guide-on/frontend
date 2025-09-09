import { useDisplayName } from '../utils/user';
import { useMemo } from 'react';

export default function HomeGreeting() {
    const name = useDisplayName();
    const greeting = useMemo(() => `안녕하세요, ${name}님`, [name]);

    // 글자 배열 (이모지/한글 결합 문자도 안전하게 처리)
    const chars = useMemo(() => Array.from(greeting), [greeting]);

    // 두 번째 줄은 글자 애니메이션이 끝난 뒤 살짝 나타나게
    const STAGGER = 0.035; // s per char
    const line2DelaySec = chars.length * STAGGER + 0.12;

    return (
        <>
            <style>{`
        @keyframes charFloat {
          0%   { opacity: 0; transform: translateY(8px) scale(0.98); }
          60%  { opacity: 1; transform: translateY(-1px) scale(1); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        /* 모션 최소화 환경에서는 애니메이션 비활성화 */
        @media (prefers-reduced-motion: reduce) {
          .greet-char, .greet-line2 { animation: none !important; }
        }
      `}</style>

            <div className="px-1 mt-3 mb-4">
                {/* 스크린리더에선 한 번만 읽히도록 */}
                <span className="sr-only">{greeting}</span>

                <div aria-hidden className="text-[20px] text-gray-800 font-normal">
                    {chars.map((c, i) => (
                        <span
                            key={`${c}-${i}`}
                            className="greet-char inline-block font-extrabold text-gray-900"
                            style={{
                                // 글자별로 약간씩 튀어오르는 스태거
                                animation: `charFloat 520ms ease-out both`,
                                animationDelay: `${i * STAGGER}s`,
                            }}
                        >
              {c === ' ' ? '\u00A0' : c}
            </span>
                    ))}
                </div>

                <div
                    className="greet-line2 mt-1 text-[14px] leading-5 text-gray-600"
                    style={{
                        animation: `fadeUp 420ms ease-out both`,
                        animationDelay: `${line2DelaySec}s`,
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        display: '-webkit-box',
                        overflow: 'hidden',
                    }}
                >
                    진행 중인 가이드를 한눈에 살펴보세요 :)
                </div>
            </div>
        </>
    );
}
