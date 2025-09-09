import { useRef, useState, useEffect } from 'react';
import type { SimulationListItem } from '@/simulation/types';
import GuideStatusSlideCard from './GuideStatusSlideCard';
import { colors } from '@/styles/colors';

export default function GuideStatusCarousel({ items }: { items: SimulationListItem[] }) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onScroll = () => {
            const i = Math.round(el.scrollLeft / el.clientWidth);
            setIdx(i);
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div>
            <div ref={ref} className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory">
                {items.map((it) => <GuideStatusSlideCard key={it.id} item={it} />)}
            </div>
            {/* dots */}
            <div className="flex items-center justify-center gap-2 mt-3">
                {items.slice(0, 4).map((_, i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ background: i === idx ? colors.navy : colors.paleBlue }}
                    />
                ))}
            </div>
        </div>
    );
}
