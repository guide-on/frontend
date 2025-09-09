import type { ReactNode } from 'react';

export default function RichLinkCard({
                                         title, subtitle, onClick, icon,
                                     }: { title: string; subtitle: string; onClick: () => void; icon: ReactNode; }) {
    return (
        <button
            onClick={onClick}
            className="w-full rounded-3xl text-left p-4 bg-white shadow-[0_12px_36px_rgba(17,24,39,0.06)] relative overflow-hidden"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl grid place-items-center bg-gray-100 text-gray-700">
                    {icon}
                </div>
                <div>
                    <div className="text-sm font-semibold text-gray-900">{title}</div>
                    <div className="text-[12px] text-gray-600">{subtitle}</div>
                </div>
            </div>
        </button>
    );
}
