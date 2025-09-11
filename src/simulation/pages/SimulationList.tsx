// src/simulation/pages/SimulationList.tsx
import { useEffect, useMemo, useState } from 'react';
import type { SimulationListItem } from '../types';
import ResultCard from '../components/ResultCard';
import ListFilterBar from '../components/ListFilterBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchSimulationList } from '../api';
import { useAuthStore } from '@/stores/useAuthStore';
import { AUTH_REQUIRED_EVENT } from '@/community/utils/api';

type Status = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'PENDING';
type Sort = 'LATEST' | 'OLDEST';

export default function SimulationListPage() {
    const [raw, setRaw] = useState<SimulationListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<Status>('ALL');
    const [sort, setSort] = useState<Sort>('LATEST');

    const user = useAuthStore((s) => s.user);
    const isLoggedIn = !!user?.email || (user?.roles?.length ?? 0) > 0;

    // ✅ 로그인 안 했으면 즉시 모달 띄우고 API 호출 안 함
    useEffect(() => {
        if (!isLoggedIn) {
            window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
            setLoading(false);
        }
    }, [isLoggedIn]);

    // 실제 데이터 호출
    useEffect(() => {
        if (!isLoggedIn) return; // 차단
        let alive = true;
        (async () => {
            try {
                const list = await fetchSimulationList(0, 50);
                if (alive) setRaw(list);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [isLoggedIn]);

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

    // UI
    return (
        <div className="max-w-[420px] mx-auto p-4">
            <ListFilterBar status={status} setStatus={setStatus} sort={sort} setSort={setSort} />
            {loading && (
                <div className="text-center py-8">
                    <LoadingSpinner type="dots" color="#25437B" />
                </div>
            )}
            {!loading && !isLoggedIn && (
                <div className="text-sm text-gray-500">로그인 후 이용해주세요.</div>
            )}
            {!loading && isLoggedIn && list.length === 0 && (
                <div className="text-sm text-gray-500">해당 조건의 내역이 없습니다.</div>
            )}
            {isLoggedIn && (
                <div className="space-y-3">
                    {list.map((it) => <ResultCard key={it.id} item={it} />)}
                </div>
            )}
        </div>
    );
}
