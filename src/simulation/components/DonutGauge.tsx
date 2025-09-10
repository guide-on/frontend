import { useEffect, useMemo, useState } from 'react';
import { colors } from '@/styles/colors';

export default function DonutGauge({
                                       value,
                                       size = 120,
                                       thickness = 12,
                                       color = colors.navy,
                                       label = '예상 확률',
                                   }: {
    value: number; size?: number; thickness?: number; color?: string; label?: string;
}) {
    const v = Math.max(0, Math.min(100, Math.round(value)));
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    const dashTarget = useMemo(() => (v / 100) * c, [v, c]);

    // stroke 애니메이션
    const [dash, setDash] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setDash(dashTarget), 30);
        return () => clearTimeout(t);
    }, [dashTarget]);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} stroke={colors.paleBlue} strokeWidth={thickness} fill="none" />
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    stroke={color} strokeWidth={thickness} fill="none"
                    strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dasharray 800ms ease-out' }}
                />
            </svg>
            {/* 중앙 텍스트 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-extrabold" style={{ color }}>{v}%</div>
                <div className="text-[11px] text-gray-500 mt-1">{label}</div>
            </div>
        </div>
    );
}
