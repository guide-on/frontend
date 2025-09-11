import { useRef, useState, useEffect } from 'react';
import type { SimulationListItem } from '@/simulation/types';
import GuideStatusSlideCard from './GuideStatusSlideCard';
import GuideStatusSlideCardEmpty from './GuideStatusSlideCardEmpty';

const CARD_W = 260;
const GAP = 20;

export default function GuideStatusCarousel({
                                                items,
                                                placeholderType = 'new', // 'login' | 'new'
                                            }: {
    items: SimulationListItem[];
    placeholderType?: 'login' | 'new';
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [idx, setIdx] = useState(0);

    const cards = items.length > 0 ? items : ([] as SimulationListItem[]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const onScroll = () => {
            const step = CARD_W + GAP;
            setIdx(Math.round(el.scrollLeft / step));
        };
        el.addEventListener('scroll', onScroll, { passive: true });

        const setSidePadding = () => {
            const viewport = el.clientWidth;
            const side = Math.max(0, (viewport - CARD_W) / 2);
            el.style.paddingLeft = `${side}px`;
            el.style.paddingRight = `${side}px`;
            el.scrollTo({ left: 0, behavior: 'auto' });
        };
        const rAF = () => requestAnimationFrame(setSidePadding);
        setSidePadding();
        const ro = new ResizeObserver(rAF);
        ro.observe(el);

        return () => {
            el.removeEventListener('scroll', onScroll);
            ro.disconnect();
        };
    }, []);

    const dotCount = Math.max(cards.length, 1);

    return (
        <div>
            <div
                ref={ref}
                className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
                style={{ background: 'transparent', gap: `${GAP}px`, scrollPadding: '0px' }}
            >
                {cards.length === 0 ? (
                    <GuideStatusSlideCardEmpty type={placeholderType} />
                ) : (
                    cards.map((it) => <GuideStatusSlideCard key={it.id} item={it} />)
                )}
            </div>

            <div className="flex items-center justify-center gap-2 mt-3">
                {Array.from({ length: dotCount }).map((_, i) => (
                    <span key={i} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-gray-900' : 'bg-gray-300'}`} />
                ))}
            </div>
        </div>
    );
}
