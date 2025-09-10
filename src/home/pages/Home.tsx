import HomeLayout from '../layouts/HomeLayout';
import HomeHero from '../components/HomeHero';
import HomeGreeting from '../components/HomeGreeting';
import HomeStatsRow from '../components/HomeStatsRow';
import SectionTitleRow from '../components/SectionTitleRow';
import GuideStatusCarousel from '../components/GuideStatusCarousel';
import RichLinkCard from '../components/RichLinkCard';
import { useHomeMock } from '../hooks/useHomeMock';
import { useNavigate } from 'react-router-dom';
import { HandHeart, Users, MessageCircle } from 'lucide-react';
import { colors } from '@/styles/colors';

export default function Home() {
    const { list, summary, loading } = useHomeMock();
    const nav = useNavigate();

    return (
        <div className="pb-24" style={{ background: colors.bgSoft }}>
            {/* 상단 히어로(텍스트 헤더) */}
            <HomeHero />

            <HomeLayout>
                {/* 인사 문구 */}
                <HomeGreeting />

                {/* 캐러셀 */}
                <div className="mt-5 mb-6">
                    <GuideStatusCarousel items={list.slice(0, 4)} />
                </div>

                {/* 시뮬 내역 */}
                <SectionTitleRow title="시뮬 내역" actionLabel="전체 보기" onAction={() => nav('/simulation')} />
                {loading ? (
                    <div className="rounded-2xl bg-gray-100 h-24 animate-pulse mb-6" />
                ) : (
                    <HomeStatsRow
                        joined={summary.joinedCount}
                        inProgress={summary.inProgressCount}
                        avgExpected={summary.avgExpectedPct}
                    />
                )}

                {/* 추천 */}
                <SectionTitleRow title="지원금 정보" />
                <div className="space-y-3 mb-4">
                    <RichLinkCard
                        title="공공지원금 추천"
                        subtitle="사업 유형과 매칭되는 지원금 보기"
                        onClick={() => nav('/support')}
                        icon={<HandHeart className="w-5 h-5" />}
                    />
                </div>

                {/* 커뮤니티 */}
                <SectionTitleRow title="커뮤니티" />
                <div className="space-y-3">
                    <RichLinkCard
                        title="대출 승인 사례"
                        subtitle="유사 업종의 실제 승인 이야기"
                        onClick={() => nav('/community')}
                        icon={<Users className="w-5 h-5" />}
                    />
                    <RichLinkCard
                        title="자유게시판 살펴보기"
                        subtitle="승인 꿀팁/정보 공유"
                        onClick={() => nav('/community')}
                        icon={<MessageCircle className="w-5 h-5" />}
                    />
                </div>
            </HomeLayout>
        </div>
    );
}
