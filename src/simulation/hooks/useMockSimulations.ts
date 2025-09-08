import { useEffect, useState } from 'react';
import type { SimulationDetail, SimulationListItem } from '../types';
import { MOCK_DETAIL, MOCK_LIST } from '../utils/mock';

export function useMockList() {
    const [data, setData] = useState<SimulationListItem[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => {
            setData(MOCK_LIST);
            setLoading(false);
        }, 350); // 로딩 느낌만
        return () => clearTimeout(t);
    }, []);

    return { data, loading };
}

export function useMockDetail(id?: number | string) {
    const [data, setData] = useState<SimulationDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => {
            const key = Number(id);
            setData(MOCK_DETAIL[key] ?? null);
            setLoading(false);
        }, 350);
        return () => clearTimeout(t);
    }, [id]);

    return { data, loading };
}
