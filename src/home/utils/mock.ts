import type { SimulationListItem } from '@/simulation/types';

export const MOCK_ACTIVE_LIST: SimulationListItem[] = [
    {
        id: 101,
        title: '2024.10.25 내역',
        startedAt: '2024-10-25T10:00:00Z',
        expectedProbability: 85,
        startProbability: 50,
        progressPct: 100,
        status: 'COMPLETED',
        tags: ['#신용등급보완', '#매출증대'],
    },
    {
        id: 95,
        title: '2024.10.20 내역',
        startedAt: '2024-10-20T11:30:00Z',
        expectedProbability: 70,
        startProbability: 40,
        progressPct: 75,
        status: 'IN_PROGRESS',
        tags: ['#서류보완', '#사업계획서'],
    },
    {
        id: 90,
        title: '2024.10.12 내역',
        startedAt: '2024-10-12T08:45:00Z',
        expectedProbability: 62,
        startProbability: 35,
        progressPct: 45,
        status: 'IN_PROGRESS',
        tags: ['#현금흐름', '#매출예측'],
    },
    {
        id: 77,
        title: '2024.10.01 내역',
        startedAt: '2024-10-01T09:10:00Z',
        expectedProbability: 0,
        startProbability: 0,
        progressPct: 0,
        status: 'FAILED',
        tags: ['#검토중단'],
    },
];

export const MOCK_SUMMARY = {
    joinedCount: 6,
    inProgressCount: 2,
    avgExpectedPct: 78,
};
