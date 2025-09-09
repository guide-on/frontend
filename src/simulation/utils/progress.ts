import { colors } from '@/styles/colors';
import type { SimulationStatus } from '../types';

export const statusLabel: Record<SimulationStatus, string> = {
    PENDING: '대기',
    IN_PROGRESS: '진행중',
    COMPLETED: '완료',
    FAILED: '실패',
};

export const progressBarColor = (pct: number) => {
    if (pct >= 100) return colors.blue;
    if (pct >= 75) return '#F59E0B'; // amber-500
    return colors.navy;
};
