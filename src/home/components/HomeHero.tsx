import { colors } from '@/styles/colors';
import { Bell, User, Search } from 'lucide-react';
import { useDisplayName } from '../utils/user';

export default function HomeHero() {
    const name = useDisplayName();

    return (
        <div
            className="rounded-b-3xl pb-5 text-white"
            style={{
                background: `linear-gradient(180deg, ${colors.blue} 0%, ${colors.navy} 100%)`,
            }}
        >
            <div className="px-4 pt-4 flex items-center justify-between">
                <div className="text-xl font-extrabold tracking-wide">가이드온</div>
                <div className="flex gap-3 opacity-90">
                    <Bell className="w-5 h-5" />
                    <User className="w-5 h-5" />
                </div>
            </div>

            <div className="px-4 mt-1 text-[13px] opacity-90">
                {name}님, 무엇을 도와드릴까요?
            </div>

            <div className="px-4 mt-3">
                <div className="flex items-center gap-2 bg-white/95 rounded-full px-3 py-2 shadow-sm">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input
                        className="bg-transparent outline-none text-sm flex-1 placeholder-gray-400"
                        placeholder="대출/지원 정보를 검색해보세요"
                    />
                </div>
            </div>
        </div>
    );
}
