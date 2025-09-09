import { colors } from '@/styles/colors';

export default function SectionTitleRow({
                                            title,
                                            actionLabel,
                                            onAction,
                                        }: {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
}) {
    return (
        <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold" style={{ color: colors.navy }}>
                {title}
            </div>
            {actionLabel && onAction && (
                <button
                    className="text-xs px-2 py-1 rounded-full"
                    onClick={onAction}
                    style={{ background: colors.paleBlue, color: colors.navy }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
