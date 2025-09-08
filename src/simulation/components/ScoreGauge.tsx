import { colors } from '@/styles/colors';
import { clampPct } from '../utils/format';

export default function ScoreGauge({
                                       label,
                                       value,
                                       size = 140,
                                   }: {
    label: string;
    value: number;
    size?: number;
}) {
    const radius = size / 2;
    const stroke = 10;
    const v = clampPct(value);
    const c = 2 * Math.PI * (radius - stroke);
    const dash = (v / 100) * c;

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} className="rotate-[-90deg]">
                <circle cx={radius} cy={radius} r={radius - stroke} stroke={colors.paleBlue} strokeWidth={stroke} fill="none" />
                <circle cx={radius} cy={radius} r={radius - stroke} stroke={colors.navy} strokeWidth={stroke}
                        fill="none" strokeDasharray={`${dash} ${c}`} />
            </svg>
            <div className="-mt-8 text-center">
                <div className="text-3xl font-bold" style={{ color: colors.navy }}>{v}%</div>
                <div className="text-xs text-gray-500">{label}</div>
            </div>
        </div>
    );
}
