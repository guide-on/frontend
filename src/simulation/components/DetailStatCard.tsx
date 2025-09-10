import type {ReactNode} from 'react';
import PillChip, {type ChipTone } from './PillChip';

function IconSearch() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-40">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
            <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}

export default function DetailStatCard({
                                           title, chip, main, desc, onClick, showSearchIcon,
                                       }: {
    title: string;
    chip?: { label: string; tone?: ChipTone };
    main: ReactNode;
    desc?: string;
    onClick?: () => void;
    showSearchIcon?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="relative text-left p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition w-full min-h-[132px]"
        >
            <div className="flex items-center justify-between mb-1">
                <div className="text-[14px] font-medium text-gray-800">{title}</div>
                {chip && <PillChip label={chip.label} tone={chip.tone} />}
            </div>
            <div className="text-xl font-extrabold leading-tight" style={{ color: '#25437B' }}>
                {main}
            </div>
            {desc && <div className="text-[10px] text-gray-500 mt-3">{desc}</div>}
            {showSearchIcon && (
                <div className="absolute right-3 bottom-3 text-gray-400">
                    <IconSearch />
                </div>
            )}
        </button>
    );
}
