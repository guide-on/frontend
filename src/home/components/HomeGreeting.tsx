import { colors } from '@/styles/colors';
import { useDisplayName } from '../utils/user';
import { Sparkles } from 'lucide-react';

export default function HomeGreeting() {
    const name = useDisplayName();
    return (
        <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
        <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: colors.paleBlue, color: colors.navy, border: `1px solid ${colors.lightBlue}` }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          가이드온
        </span>
            </div>
            <div className="text-[22px] leading-7 font-extrabold" style={{ color: '#111827' }}>
                {name}님 현재 시뮬 상황
            </div>
        </div>
    );
}
