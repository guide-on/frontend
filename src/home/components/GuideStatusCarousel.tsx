import { useRef, useState, useEffect } from 'react';
import type { SimulationListItem } from '@/simulation/types';
import GuideStatusSlideCard from './GuideStatusSlideCard';

const CARD_W = 260;
const GAP = 20;

export default function GuideStatusCarousel({ items }: { items: SimulationListItem[] }) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // 도트 계산
        const onScroll = () => {
            const step = CARD_W + GAP;
            setIdx(Math.round(el.scrollLeft / step));
        };
        el.addEventListener('scroll', onScroll, { passive: true });

        // 첫/마지막 카드가 중앙에 오도록 좌우 패딩 동적 계산
        const setSidePadding = () => {
            const viewport = el.clientWidth;
            const side = Math.max(0, (viewport - CARD_W) / 2);
            el.style.paddingLeft = `${side}px`;
            el.style.paddingRight = `${side}px`;
            // 초기 스냅을 확실히 가운데로
            el.scrollTo({ left: 0, behavior: 'auto' });
        };
        // 렌더 직후 + 이미지 로딩 이후 1프레임 뒤에도 한 번 더
        const rAF = () => requestAnimationFrame(setSidePadding);
        setSidePadding();
        const ro = new ResizeObserver(rAF);
        ro.observe(el);

        return () => {
            el.removeEventListener('scroll', onScroll);
            ro.disconnect();
        };
    }, []);

    return (
        <div>
            {/* 투명 트랙 + 간격(gap)으로 카드 사이 여백 분명히. */}
            <div
                ref={ref}
                className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
                style={{
                    background: 'transparent',   // ← 회색 네모(트랙 배경) 제거
                    gap: `${GAP}px`,
                    scrollPadding: '0px',
                }}
            >
                {items.map((it) => (
                    <GuideStatusSlideCard key={it.id} item={it} />
                ))}
            </div>

            <div className="flex items-center justify-center gap-2 mt-3">
                {items.slice(0, 4).map((_, i) => (
                    <span key={i} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-gray-900' : 'bg-gray-300'}`} />
                ))}
            </div>
        </div>
    );
}
