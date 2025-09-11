import { useNavigate } from 'react-router-dom';
import { Lock, Plus } from 'lucide-react';

export default function GuideStatusSlideCardEmpty({
                                                      type, // 'login' | 'new'
                                                  }: {
    type: 'login' | 'new';
}) {
    const nav = useNavigate();
    const isLogin = type === 'login';

    // ─────────────────────────────────────────────
    // 로그인 필요 카드 (이전 동작/레이아웃 유지)
    // ─────────────────────────────────────────────
    if (isLogin) {
        return (
            <div
                className="snap-center shrink-0 rounded-3xl p-5 bg-white relative overflow-hidden"
                style={{ width: 260, height: 295, boxShadow: '0 14px 32px rgba(17,24,39,0.06)' }}
            >
                <div className="flex flex-col h-full">
                    <div className="mb-2">
            <span className="inline-flex px-2 py-1 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-600">
              안내
            </span>
                    </div>

                    <div className="pr-4">
                        <div className="text-[16px] font-extrabold text-gray-900">대출가이드 현황</div>
                    </div>

                    <div className="mt-6 flex flex-col items-center justify-center text-center px-2">
                        <Lock className="w-10 h-10 text-gray-300" />
                        <div className="mt-3 text-[15px] font-semibold text-gray-800">로그인 후 이용해주세요</div>
                        <div className="mt-1 text-[12px] text-gray-500">개인별 가이드 현황을 볼 수 있어요</div>

                        <button
                            onClick={() => nav('/auth/login')}
                            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-[12px]"
                        >
                            로그인
                        </button>
                    </div>

                    <div className="mt-auto text-[12px] text-transparent select-none">.</div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // 로그인 상태 + 시뮬 내역 없음 카드
    //  - 중앙 플러스 아이콘 클릭 → 가이드 시작
    //  - 하단에 안내 텍스트
    // ─────────────────────────────────────────────
    return (
        <div
            className="snap-center shrink-0 rounded-3xl p-5 bg-white relative overflow-hidden"
            style={{ width: 260, height: 295, boxShadow: '0 14px 32px rgba(17,24,39,0.06)' }}
        >
            {/* 상단 라벨/제목 */}
            <div className="mb-2">
        <span className="inline-flex px-2 py-1 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-600">
          안내
        </span>
            </div>
            <div className="pr-4">
                <div className="text-[16px] font-extrabold text-gray-900">대출가이드 현황</div>
            </div>

            {/* 정중앙 플러스 아이콘 (버튼) */}
            <button
                type="button"
                aria-label="가이드 시작"
                onClick={() => nav('/guide/survey')}
                className="absolute flex items-center justify-center rounded-full cursor-pointer"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 56,
                    height: 56,
                }}
            >
                <Plus className="w-14 h-14 text-gray-300" />
            </button>

            {/* 하단 안내 텍스트 */}
            <div className="absolute left-0 right-0 bottom-8 text-center px-4">
                <div className="text-[15px] font-semibold text-gray-800">아직 내역이 없어요!</div>
                <div className="mt-1 text-[12px] text-gray-500">가이드를 시작해보세요</div>
            </div>
        </div>
    );
}
