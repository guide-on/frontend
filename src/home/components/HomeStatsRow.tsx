import { colors } from '@/styles/colors';

export default function HomeStatsRow({
                                         joined, inProgress, avgExpected,
                                     }: { joined: number; inProgress: number; avgExpected: number; }) {
    const Cell = ({ label, value }: { label: string; value: string }) => (
        <div
            className="flex-1 rounded-2xl bg-white p-3 text-left"
            style={{ border: `2px solid ${colors.paleBlue}` }}
        >
            <div className="text-[11px] text-gray-500 mb-1">{label}</div>
            <div className="text-lg font-extrabold" style={{ color: colors.navy }}>{value}</div>
        </div>
    );
    return (
        <div className="grid grid-cols-3 gap-2 mb-8">
            <Cell label="참여한 개수" value={`${joined}건`} />
            <Cell label="현재 진행 중인" value={`${inProgress}건`} />
            <Cell label="예상 확률" value={`${avgExpected}%`} />
        </div>
    );
}
