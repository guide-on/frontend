import { useEffect, useState } from 'react';
import { MOCK_ACTIVE_LIST, MOCK_SUMMARY } from '../utils/mock';
import type { SimulationListItem } from '@/simulation/types';

export function useHomeMock() {
    const [list, setList] = useState<SimulationListItem[]>([]);
    const [summary, setSummary] = useState(MOCK_SUMMARY);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => {
            setList(MOCK_ACTIVE_LIST);
            setSummary(MOCK_SUMMARY);
            setLoading(false);
        }, 300);
        return () => clearTimeout(t);
    }, []);

    // 가장 최근/완료건을 active로 보여주고 싶다면 첫번째로 취급
    const active = list[0] ?? null;
    return { active, list, summary, loading };
}
