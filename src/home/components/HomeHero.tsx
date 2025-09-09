import { useLayoutEffect, useRef, useState } from 'react';
import { colors } from '@/styles/colors';

/** 네이비 솔리드 종 아이콘 */
function NavyBell({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
            <path d="M10 2a6 6 0 00-6 6v2.586l-.707.707A1 1 0 004 13h12a1 1 0 00.707-1.707L16 10.586V8a6 6 0 00-6-6z" />
            <path d="M10 18a3 3 0 002.995-2.824L13 15H7a3 3 0 002.824 2.995L10 18z" />
        </svg>
    );
}

export default function HomeHero() {
    const labelRef = useRef<HTMLSpanElement | null>(null);
    const [underlineW, setUnderlineW] = useState(0);

    useLayoutEffect(() => {
        const measure = () => setUnderlineW(labelRef.current?.getBoundingClientRect().width ?? 0);
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    // 길이/위치 파라미터
    const EXTRA_PX = 18;        // 선이 글자보다 오른쪽으로 더 뻗는 길이
    const UNDER_GAP = 10;       // 텍스트와 선의 간격
    const FLAG_SIZE = 20;       // 깃발 크기
    const FLAG_OVER = 2;        // 선 위로 올라오게 하는 정도
    const FLAG_SHIFT = 4;       // 깃발을 아주 조금 오른쪽으로 이동(px)
    const finalLineW = Math.max(0, underlineW + EXTRA_PX);
    const flagLeft = Math.max(0, finalLineW - FLAG_SIZE / 2);

    return (
        <div className="pb-2" style={{ background: colors.bgSoft }}>
            <style>{`
        .brand-underline{
          position:absolute; left:0; height:2px; /* 얇게 유지 */
          /* 네이비를 살짝 연하게 (투명도 0.65) */
          background: rgba(37, 67, 123, 0.65);
          border-radius:9999px;
          transform-origin:left center; transform:scaleX(0);
          animation:underlineGrow 720ms ease-out 120ms forwards;
        }
        @keyframes underlineGrow{ from{transform:scaleX(0)} to{transform:scaleX(1)} }
        .brand-flag{
          position:absolute; width:${FLAG_SIZE}px; height:${FLAG_SIZE}px; color:${colors.navy};
          opacity:0; transform:translateY(6px) scale(.86) rotate(-6deg);
          animation:flagPop 520ms cubic-bezier(.22,1.4,.36,1) 860ms forwards;
        }
        @keyframes flagPop{
          0%{opacity:0; transform:translateY(6px) scale(.86) rotate(-6deg)}
          70%{opacity:1; transform:translateY(-1px) scale(1.04) rotate(0)}
          100%{opacity:1; transform:translateY(0) scale(1) rotate(0)}
        }
        @media (prefers-reduced-motion: reduce){
          .brand-underline,.brand-flag{animation:none !important; opacity:1 !important; transform:none !important;}
        }
      `}</style>

            <div className="px-4 pt-4 flex items-center justify-between">
                {/* 브랜드 + 밑줄 + 깃발 */}
                <div className="relative inline-block leading-none select-none">
          <span
              ref={labelRef}
              className="tracking-tight"
              style={{ color: colors.navy, fontWeight: 900, fontSize: 22 }}
          >
            <span style={{ fontWeight: 800 }}>Guide</span>
            <span className="mx-0.5">:</span>
            <span>ON</span>
          </span>

                    {/* 선: 글자보다 약간 아래/더 길게, 연한 네이비 */}
                    <span
                        className="brand-underline"
                        style={{ width: `${finalLineW}px`, bottom: `-${UNDER_GAP}px` }}
                    />

                    {/* 깃발: 선 끝에서 아주 살짝 오른쪽으로 이동 + 선 위에 걸치게 */}
                    <svg
                        viewBox="0 0 24 24"
                        className="brand-flag"
                        style={{
                            left: `${flagLeft + FLAG_SHIFT}px`,                         // ✅ 오른쪽으로 4px
                            bottom: `-${Math.max(UNDER_GAP - FLAG_OVER, 0)}px`,         // 선 위로 살짝
                        }}
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <rect x="3" y="3" width="2" height="18" rx="1" />
                        <path d="M5 4h13l-3.5 4L18 12H5V4z" />
                    </svg>
                </div>

                <button
                    className="p-2 rounded-full hover:bg-black/5 active:bg-black/10"
                    style={{ color: colors.navy }}
                    aria-label="알림"
                >
                    <NavyBell className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
