import { useEffect, useState, useRef } from 'react';
import DonutGauge from './DonutGauge';
import { colors } from '@/styles/colors';

export default function PolicySummaryCard({
                                              policyTitle,
                                              expected,
                                              improvedTarget,
                                              executedAt,
                                              isPass,
                                          }: {
    policyTitle: string;
    expected: number;
    improvedTarget: number;
    executedAt: string;
    isPass: boolean;
}) {
    const accent = isPass ? colors.navy : '#EF4444';
    const donutSize = 120;

    // 애니메이션 트리거
    const [mounted, setMounted] = useState(false);
    useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

    // 도넛 왼쪽 이동(말풍선 공간)
    const donutShiftPx = 80;
    const bubbleGap = 12;

    // 참고 말풍선
    const [showInfo, setShowInfo] = useState(false);
    const infoBtnRef = useRef<HTMLButtonElement | null>(null);

    return (
        <div className="rounded-3xl bg-white p-4 shadow-sm relative">
            {/* 타이틀 + 실행일 */}
            <div className="text-center">
                <div className="text-[17px] font-extrabold" style={{ color: colors.navy }}>
                    {policyTitle} 결과
                </div>
                <div className="text-[12px] text-gray-500 mt-1">
                    실행일: {new Date(executedAt).toLocaleDateString()}
                </div>
            </div>

            {/* 도넛 + (보완 시 최대 %) 말풍선 */}
            <div className="relative mt-4" style={{ height: donutSize }}>
                <div
                    className="absolute left-1/2 top-1/2 -translate-y-1/2 transition-transform duration-500 ease-out"
                    style={{ transform: `translate(-50%, -50%) ${mounted ? `translateX(-${donutShiftPx}px)` : ''}` }}
                >
                    <DonutGauge value={expected} size={donutSize} color={accent} label="예상 확률" />
                </div>

                <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
                    style={{
                        left: `calc(50% + ${donutSize / 2 - donutShiftPx + bubbleGap}px)`,
                        opacity: mounted ? 1 : 0,
                        transform: `translateY(-50%) translateX(${mounted ? '0px' : '8px'})`,
                    }}
                >
                    <div
                        className="relative rounded-2xl shadow-sm px-3 py-1.5 whitespace-nowrap text-[12px]"
                        style={{ background: '#fff', border: `1px solid ${colors.paleBlue}`, color: colors.navy }}
                    >
                        <b>부족분 보완 시</b> 최대 <b>{improvedTarget}%</b>
                        <div
                            className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0"
                            style={{ borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: `8px solid ${colors.paleBlue}` }}
                        />
                        <div
                            className="absolute right-[calc(100%-7px)] top-1/2 -translate-y-1/2 w-0 h-0"
                            style={{ borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '7px solid #fff' }}
                        />
                    </div>
                </div>
            </div>

            {/* ---------- 참고해주세요 (오른쪽 하단) ---------- */}
            <div className="mt-2 flex justify-end">
                <div className="relative">
                    <button
                        ref={infoBtnRef}
                        type="button"
                        className="text-[11px] text-gray-500"
                        onClick={() => setShowInfo(v => !v)}
                    >
                        ⓘ 참고해주세요
                    </button>

                    {showInfo && (
                        <div
                            className="absolute z-20 bottom-full right-0 mb-2 w-[280px] text-[12px] leading-relaxed rounded-xl shadow-lg p-3"
                            style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#374151' }}
                        >
                            이 점수는 <b>가이드온(Guide ON)</b> 전용 산정 방식으로,
                            <br />서류(60)·신용(30)·사업계획서(10)를 가중합하여 산출합니다.
                            따라서 금융기관의 실제 평가와 다를 수 있습니다.
                            {/* 꼬리 */}
                            <div
                                className="absolute bottom-[-6px] right-3 w-0 h-0"
                                style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #E5E7EB' }}
                            />
                            <div
                                className="absolute bottom-[-5px] right-3 w-0 h-0"
                                style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #fff' }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
