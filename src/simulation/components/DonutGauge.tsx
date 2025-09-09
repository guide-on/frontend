import { colors } from '@/styles/colors.ts';

export default function DonutGauge({
                                       value, size = 140, thickness = 12, color = colors.navy, label = '현재 승인 확률',
                                   }: {
    value: number; size?: number; thickness?: number; color?: string; label?: string;
}) {
    const v = Math.max(0, Math.min(100, Math.round(value)));
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    const dash = (v / 100) * c;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} stroke={colors.paleBlue} strokeWidth={thickness} fill="none" />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke={color}
                    strokeWidth={thickness}
                    fill="none"
                    strokeDasharray={`${dash} ${c}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
                <div className="text-3xl font-extrabold" style={{ color }}>{v}%</div>
                <div className="text-[11px] text-gray-500 -mt-2">{label}</div>
            </div>
        </div>
    );
}
