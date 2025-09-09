import { colors } from '@/styles/colors';
import type {ReactNode} from 'react';

export default function RichLinkCard({
                                         title, subtitle, onClick, icon,
                                     }: {
    title: string;
    subtitle: string;
    onClick: () => void;
    icon: ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className="w-full rounded-3xl text-left p-4 bg-white border shadow-[0_10px_30px_rgba(37,67,123,0.06)] relative overflow-hidden"
            style={{ borderColor: colors.paleBlue }}
        >
            <div className="absolute -right-6 -bottom-10 w-32 h-32 rounded-full opacity-20"
                 style={{ background: `radial-gradient(closest-side, ${colors.lightBlue}, transparent)` }} />
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl grid place-items-center"
                     style={{ background: colors.paleBlue, color: colors.navy }}>
                    {icon}
                </div>
                <div>
                    <div className="text-sm font-semibold" style={{ color: colors.navy }}>{title}</div>
                    <div className="text-[12px] text-gray-600">{subtitle}</div>
                </div>
            </div>
        </button>
    );
}
