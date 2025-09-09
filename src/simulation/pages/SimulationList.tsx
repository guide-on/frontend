import { useEffect, useMemo, useState } from 'react';
import type { SimulationListItem } from '../types';
import ResultCard from '../components/ResultCard';
import ListFilterBar from '../components/ListFilterBar';
import { MOCK_LIST } from '../utils/mock';

type Status = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'PENDING';
type Sort = 'LATEST' | 'OLDEST';

export default function SimulationListPage() {
    const [raw, setRaw] = useState<SimulationListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<Status>('ALL');
    const [sort, setSort] = useState<Sort>('LATEST');

    useEffect(() => {
        const t = setTimeout(() => {
            setRaw(MOCK_LIST);
            setLoading(false);
        }, 200);
        return () => clearTimeout(t);
    }, []);

    const list = useMemo(() => {
        let arr = raw.slice();
        if (status !== 'ALL') arr = arr.filter((i) => i.status === status);
        arr.sort((a, b) =>
            sort === 'LATEST'
                ? +new Date(b.startedAt) - +new Date(a.startedAt)
                : +new Date(a.startedAt) - +new Date(b.startedAt)
        );
        return arr;
    }, [raw, status, sort]);

    return (
        <div className="max-w-[420px] mx-auto p-4">
            <ListFilterBar status={status} setStatus={setStatus} sort={sort} setSort={setSort} />
            {loading && <div>로딩 중...</div>}
            {!loading && list.length === 0 && <div className="text-sm text-gray-500">해당 조건의 내역이 없습니다.</div>}
            <div className="space-y-3">
                {list.map((it) => <ResultCard key={it.id} item={it} />)}
            </div>
        </div>
    );
}
