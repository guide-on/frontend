import HomeLayout from '../layouts/HomeLayout';
import HomeHero from '../components/HomeHero';
import HomeGreeting from '../components/HomeGreeting';
import HomeStatsRow from '../components/HomeStatsRow';
import SectionTitleRow from '../components/SectionTitleRow';
import GuideStatusCarousel from '../components/GuideStatusCarousel';
import RichLinkCard from '../components/RichLinkCard';
import { useNavigate } from 'react-router-dom';
import { HandHeart, Users, MessageCircle } from 'lucide-react';
import { colors } from '@/styles/colors';
import { useHomeData } from '../hooks/useHomeData';

export default function Home() {
  const { isLoggedIn, list, summary, loading } = useHomeData();
  const nav = useNavigate();

  const placeholderType = isLoggedIn ? 'new' : 'login';

  return (
      <div className="pb-24" style={{ background: colors.bgSoft }}>
        <HomeHero />
        <HomeLayout>
          <HomeGreeting />

          {/* 캐러셀: 로그인 X 또는 내역 없음 → 동일 틀의 빈 카드 노출 */}
          <div className="mt-5 mb-6">
            {loading ? (
                <div className="rounded-3xl bg-gray-100 h-[295px] w-full animate-pulse" />
            ) : (
                <GuideStatusCarousel items={list} placeholderType={placeholderType} />
            )}
          </div>

          {/* 시뮬 내역 요약: 동일 틀 + 상태별 메시지 */}
          <SectionTitleRow
              title="시뮬 내역"
              actionLabel={isLoggedIn ? '전체 보기' : undefined}
              onAction={isLoggedIn ? () => nav('/simulation') : undefined}
          />

          {loading ? (
              <div className="rounded-2xl bg-gray-100 h-24 animate-pulse mb-6" />
          ) : (
              <HomeStatsRow
                  variant={
                    !isLoggedIn ? 'loginRequired' : list.length === 0 ? 'empty' : 'normal'
                  }
                  joined={summary.joinedCount}
                  inProgress={summary.inProgressCount}
                  // 최근 완료 확률이 없으면 ‘—’
                  avgExpected={summary.recentCompletedProbabilityPct ?? null}
                  onStartGuide={() => nav('/guide')}
                  onLogin={() => nav('/auth/login')}
              />
          )}

          {/* 추천/커뮤니티 섹션은 모두에게 노출 */}
          <SectionTitleRow title="지원금 정보" />
          <div className="space-y-3 mb-4">
            <RichLinkCard
                title="공공지원금 추천"
                subtitle="사업 유형과 매칭되는 지원금 보기"
                onClick={() => nav('/support')}
                icon={<HandHeart className="w-5 h-5" />}
            />
          </div>

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
