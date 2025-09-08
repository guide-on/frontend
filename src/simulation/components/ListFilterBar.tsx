import { colors } from '@/styles/colors';

type Status = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'PENDING';
type Sort = 'LATEST' | 'OLDEST';

export default function ListFilterBar({
                                          status, setStatus, sort, setSort,
                                      }: {
    status: Status; setStatus: (s: Status) => void;
    sort: Sort; setSort: (s: Sort) => void;
}) {
    const chip = (key: Status, label: string) => {
        const active = status === key;
        return (
            <button
                key={key}
                onClick={() => setStatus(key)}
                className="px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                    background: active ? colors.paleBlue : '#fff',
                    color: active ? colors.navy : '#111827',
                    borderColor: colors.paleBlue,
                }}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="mb-3 flex items-center justify-between">
            <div className="flex gap-6">
                <div className="flex gap-1">{['ALL','COMPLETED','IN_PROGRESS','FAILED'].map((s) =>
                    chip(s as Status, s === 'ALL' ? '전체' : s === 'COMPLETED' ? '완료' : s === 'IN_PROGRESS' ? '진행중' : '중단'))}
                </div>
            </div>

            <div className="flex items-center text-xs gap-1">
                <button
                    onClick={() => setSort('LATEST')}
                    className="px-2 py-1 rounded-full border"
                    style={{
                        background: sort === 'LATEST' ? colors.paleBlue : '#fff',
                        color: sort === 'LATEST' ? colors.navy : '#111827',
                        borderColor: colors.paleBlue,
                    }}
                >최신순</button>
                <button
                    onClick={() => setSort('OLDEST')}
                    className="px-2 py-1 rounded-full border"
                    style={{
                        background: sort === 'OLDEST' ? colors.paleBlue : '#fff',
                        color: sort === 'OLDEST' ? colors.navy : '#111827',
                        borderColor: colors.paleBlue,
                    }}
                >오래된순</button>
            </div>
        </div>
    );
}
