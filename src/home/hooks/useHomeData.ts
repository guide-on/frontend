import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/community/utils/api'; // 공용 axios 인스턴스
import type { SimulationListItem } from '@/simulation/types';

type HomeSummary = {
    joinedCount: number;
    inProgressCount: number;
    recentCompletedProbabilityPct: number | null;
};

function progressFromStep(status?: string, step?: string): number {
    if (status === 'COMPLETED') return 100;
    switch (step) {
        case 'PLAN': return 75;
        case 'CREDIT': return 50;
        case 'DOCS': return 25;
        default: return 0;
    }
}

export function useHomeData() {
    const user = useAuthStore((s) => s.user);
    const isLoggedIn = !!(user?.name && user.name.trim().length > 0);
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState<SimulationListItem[]>([]);
    const [summary, setSummary] = useState<HomeSummary>({
        joinedCount: 0, inProgressCount: 0, recentCompletedProbabilityPct: null,
    });

    useEffect(() => {
        let alive = true;
        async function run() {
            if (!isLoggedIn) {
                setList([]);
                setSummary({ joinedCount: 0, inProgressCount: 0, recentCompletedProbabilityPct: null });
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const [rList, rSum] = await Promise.all([
                    api.get('/simulation/results', { params: { page: 0, size: 4 } }),
                    api.get('/simulation/results/summary'),
                ]);

                const items: SimulationListItem[] =
                    (rList?.data?.data?.content ?? []).map((r: any) => ({
                        id: r.id,
                        title: r.fundName ? `${r.fundName}` : (r.startedAt ?? ''),
                        startedAt: r.startedAt,
                        expectedProbability: Math.round(r.totalProbabilityPct ?? 0),
                        startProbability: 0,
                        progressPct: progressFromStep(r.overallStatus, r.currentStep),
                        status: r.overallStatus ?? 'PENDING',
                        tags: [],
                    }));

                const s = rSum?.data?.data;
                const mapped: HomeSummary = {
                    joinedCount: s?.joinedCount ?? 0,
                    inProgressCount: s?.inProgressCount ?? 0,
                    recentCompletedProbabilityPct: s?.recentCompletedProbabilityPct ?? null,
                };

                if (alive) {
                    setList(items);
                    // 평균대신 “최근 완료 확률”을 카드에 보여주려면 아래에서 가공
                    setSummary(mapped);
                }
            } catch (_e) {
                if (alive) {
                    setList([]);
                    setSummary({ joinedCount: 0, inProgressCount: 0, recentCompletedProbabilityPct: null });
                }
            } finally {
                alive && setLoading(false);
            }
        }
        run();
        return () => { alive = false; };
    }, [isLoggedIn]);

    const active = useMemo(() => list[0] ?? null, [list]);
    return { isLoggedIn, active, list, summary, loading };
}
