import { colors } from '@/styles/colors';
import type { ScoreCategory } from '../types';

export default function StatusChip({ label, category }: { label: string; category: ScoreCategory }) {
    const map: Record<ScoreCategory, { bg: string; fg: string }> = {
        STRENGTH: { bg: colors.paleBlue, fg: colors.navy },
        NEUTRAL:  { bg: '#E5E7EB',       fg: '#111827' },
        WEAKNESS: { bg: '#FDE68A',       fg: '#92400E' },
    };
    const s = map[category];
    return (
        <span className="px-2 py-1 text-xs rounded-full" style={{ background: s.bg, color: s.fg }}>
      {label}
    </span>
    );
}
