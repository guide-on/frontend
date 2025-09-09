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
        // 오른쪽 여백 조금 주어 너무 끝에 붙지 않도록
        <div className="mb-2 flex items-center justify-between pr-2">
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            {actionLabel && onAction && (
                <button className="text-xs text-gray-500 hover:text-gray-700" onClick={onAction}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
