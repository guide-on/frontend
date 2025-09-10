import type {CSSProperties} from 'react';

export type ChipTone = 'ok' | 'warn' | 'bad' | 'info' | 'neutral';

const tone: Record<ChipTone, CSSProperties> = {
    ok:      { background: '#5A89E2', color: '#FFFFFF' }, // 파랑 계열
    warn:    { background: '#F59E0B', color: '#FFFFFF' }, // 주황
    bad:     { background: '#ff6363', color: '#FFFFFF' }, // 빨강
    info:    { background: '#9CA3AF', color: '#FFFFFF' }, // 연회색
    neutral: { background: '#D1D5DB', color: '#111827' },
};

export default function PillChip({ label, tone: t = 'neutral' }: { label: string; tone?: ChipTone }) {
    return (
        <span
            className="px-2 py-1 rounded-full text-[11px] font-semibold select-none"
            style={tone[t]}
        >
      {label}
    </span>
    );
}
