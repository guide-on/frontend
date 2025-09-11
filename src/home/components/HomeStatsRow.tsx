import { Lock} from 'lucide-react';

export default function HomeStatsRow({
                                         variant = 'normal',
                                         joined,
                                         inProgress,
                                         avgExpected, // number | null
                                         onLogin,
                                     }: {
    variant?: 'normal' | 'loginRequired' | 'empty';
    joined: number;
    inProgress: number;
    avgExpected: number | null;
    onStartGuide?: () => void;
    onLogin?: () => void;
}) {
    // 공용 카드 스타일
    const Card = ({ children }: { children: React.ReactNode }) => (
        <div className="flex-1 rounded-2xl bg-white px-5 py-4 shadow-[0_8px_20px_rgba(17,24,39,0.06)] border border-gray-100">
            {children}
        </div>
    );

    if (variant === 'loginRequired') {
        return (
            <div className="flex gap-3 mb-6">
                <Card>
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <Lock className="w-6 h-6 text-gray-300" />
                        <div className="mt-2 text-sm font-semibold text-gray-800">로그인 후 이용해주세요</div>
                        <div className="text-[12px] text-gray-500">내 시뮬 내역 요약을 볼 수 있어요</div>
                        {onLogin && (
                            <button
                                onClick={onLogin}
                                className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-900 text-white text-[12px]"
                            >
                                로그인
                            </button>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    if (variant === 'empty') {
        return (
            <div className="flex gap-3 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[12px] text-gray-500">참여한 개수</div>
                            <div className="text-[20px] font-black text-gray-900">0건</div>
                        </div>
                        <div>
                            <div className="text-[12px] text-gray-500">현재 진행 중인</div>
                            <div className="text-[20px] font-black text-gray-900">0건</div>
                        </div>
                        <div>
                            <div className="text-[12px] text-gray-500">예상 확률</div>
                            <div className="text-[20px] font-black text-gray-900">—</div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // normal
    return (
        <div className="flex gap-3 mb-6">
            <Card>
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <div className="text-[12px] text-gray-500">참여한 개수</div>
                        <div className="text-[22px] font-black text-gray-900">{joined}건</div>
                    </div>
                    <div>
                        <div className="text-[12px] text-gray-500">현재 진행 중인</div>
                        <div className="text-[22px] font-black text-gray-900">{inProgress}건</div>
                    </div>
                    <div>
                        <div className="text-[12px] text-gray-500">예상 확률</div>
                        <div className="text-[22px] font-black text-gray-900">
                            {avgExpected === null ? '—' : `${avgExpected}%`}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
