import { colors } from '@/styles/colors';
import Logo from '@/assets/logo/logo.png';

export default function SplashScreen({ fading = false }: { fading?: boolean }) {
    return (
        <>
            <style>{`
        @keyframes splashFadeIn {
          0% { opacity: 0; transform: scale(.98) }
          100% { opacity: 1; transform: scale(1) }
        }
        @keyframes splashFadeOut {
          0% { opacity: 1; transform: translateY(0) }
          100% { opacity: 0; transform: translateY(-6px) }
        }
        @keyframes splashProgress {
          0%   { transform: scaleX(0) }
          50%  { transform: scaleX(1) }
          100% { transform: scaleX(0) }
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-root { animation: none !important; }
        }
      `}</style>

            <div
                className="splash-root absolute inset-0 z-[9999] flex items-center justify-center"
                style={{
                    background: colors.navy, // 군청 배경
                    animation: fading
                        ? 'splashFadeOut 420ms ease forwards'
                        : 'splashFadeIn 360ms ease-out both',
                }}
            >
                {/* 콘텐츠 살짝 위로 올림 */}
                <div className="text-center" style={{ transform: 'translateY(-18px)' }}>
                    {/* 로고 */}
                    <img
                        src={Logo}
                        alt="Guide:ON logo"
                        className="w-14 h-14 mx-auto mb-3 object-contain"
                        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                    />

                    {/* 앱 네임 */}
                    <div
                        className="font-black tracking-tight"
                        style={{ color: '#FFFFFF', fontSize: 28, letterSpacing: '-0.02em' }}
                    >
                        Guide<span style={{ fontWeight: 800 }}>:</span>ON
                    </div>

                    {/* 한 줄 소개 (멘트 수정) */}
                    <div className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                        소상공인을 위한 따뜻한 가이드
                    </div>

                    {/* 진행 바 */}
                    <div className="mt-6 h-[3px] w-48 rounded-full overflow-hidden mx-auto" style={{ background: 'rgba(255,255,255,0.28)' }}>
                        <div
                            className="h-full"
                            style={{
                                width: '100%',
                                background: '#FFFFFF', // 흰색 채우기
                                transformOrigin: 'left',
                                animation: 'splashProgress 1800ms ease-in-out infinite',
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
