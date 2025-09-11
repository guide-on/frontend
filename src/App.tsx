// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

// 공통 컴포넌트
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import SplashScreen from './components/common/SplashScreen';
import AuthModal from '@/community/components/auth/AuthModal';

// 페이지 컴포넌트
import Home from './home/pages/Home';
import Support from './pages/Support';
import MyPage from './pages/MyPage';
import Community from './community/index.tsx';
import NotFound from './pages/NotFound';
import CommunityFab from './community/components/CommunityFab';

// 인증
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import FindIdPw from '@/pages/auth/FindIdPw';
import Onboarding from '@/pages/auth/Onboarding';

// 시뮬레이션
import SimulationList from './simulation/pages/SimulationList';
import SimulationDetail from './simulation/pages/SimulationDetail';

// 가이드(서류 등록)
import DocumentSurveyPage from '@/guide/pages/DocumentSurveyPage';
import PolicyListPage from '@/guide/pages/PolicyListPage';
import RequiredDocumentsPage from '@/guide/pages/RequiredDocumentsPage';
import DocumentUploadPage from '@/guide/pages/DocumentUploadPage';
import MydataConsentPage from '@/guide/pages/MydataConsentPage';
import MydataSyncComplete from '@/guide/pages/MydataSyncComplete';

// 사업계획서
import BusinessPlanResult from './pages/evaluation/BusinessPlanResult';
import BusinessPlanReady from './pages/evaluation/BusinessPlanReady';
import BusinessPlanAnalysisLoading from './pages/evaluation/BusinessPlanAnalysisLoading';
import OverallProgressComplete from './pages/evaluation/OverallProgressComplete';

// 하이브리드 평가
import HybridEvaluation from './pages/Hybrid Evaluation';
import StartHybridEvaluation from './pages/Hybrid Evaluation/Start.tsx';
import BankConnect from './pages/Hybrid Evaluation/BankConnect';
import BankConnectComplete from './pages/Hybrid Evaluation/BankConnectComplete';
import HybridEvaluationComplete from './pages/Hybrid Evaluation/Complete.tsx';

/**
 * 라우팅에 따라 Header, Navbar 및 메인 콘텐츠의 패딩/애니메이션을 관리하는 컴포넌트
 */
function AppChrome() {
  const { pathname, key } = useLocation();

  // === Header 숨김 조건 ===
  const hideHeaderExact = new Set<string>([
    '/', // 홈
    '/community/search',
    '/community/search/',
    '/auth/login',
    '/auth/signup',
    '/auth/find',
    '/bank-connect',
    '/bank-connect/complete',
    '/hybrid-evaluation/start',
    '/hybrid-evaluation/complete',
  ]);
  const hideHeaderPrefixes = [
    '/hybrid-evaluation/start', // 파라미터 대응
    '/hybrid-evaluation/complete', // 파라미터 대응
  ];

  // === Navbar 숨김 조건 ===
  const hideNavbarExact = new Set<string>([
    '/auth/login',
    '/auth/signup',
    '/auth/find',
    '/bank-connect',
    '/bank-connect/complete',
    '/hybrid-evaluation/start',
    '/hybrid-evaluation/complete',
  ]);
  const hideNavbarPrefixes = [
    '/simulation/', // 목록/상세 공통
    '/hybrid-evaluation/start', // 파라미터 대응
    '/hybrid-evaluation/complete', // 파라미터 대응
  ];

  const isHeaderHidden =
    hideHeaderExact.has(pathname) ||
    hideHeaderPrefixes.some((p) => pathname.startsWith(p));

  const isNavbarHidden =
    hideNavbarExact.has(pathname) ||
    hideNavbarPrefixes.some((p) => pathname.startsWith(p));

  // Header / Navbar 유무에 따른 main 패딩
  const paddingTop = isHeaderHidden ? 0 : 64; // px
  const paddingBottom = isNavbarHidden ? 0 : 70; // px

  return (
    <>
      {/* 라우트 전환 애니메이션 스타일 */}
      <style>{`
        @keyframes routeFadeSlideIn {
          0%   { opacity: 0; transform: translateY(6px) }
          100% { opacity: 1; transform: translateY(0) }
        }
        @media (prefers-reduced-motion: reduce) {
          .route-animate { animation: none !important; }
        }
      `}</style>

      {!isHeaderHidden && <Header />}

      <main
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingTop,
          paddingBottom,
          minHeight: 0,
        }}
      >
        {/* location.key를 key로 사용해서 화면 전환 시 진입 애니메이션 */}
        <div
          key={key}
          className="route-animate"
          style={{ animation: 'routeFadeSlideIn 240ms ease-out both' }}
        >
          <Routes>
            {/* 메인 */}
            <Route path="/" element={<Home />} />

            {/* 가이드(서류 등록) */}
            <Route path="/guide/survey" element={<DocumentSurveyPage />} />
            <Route
              path="/guide/policy/:businessId"
              element={<PolicyListPage />}
            />
            <Route
              path="/guide/documents/:sessionId"
              element={<RequiredDocumentsPage />}
            />
            <Route
              path="/guide/mydata/:sessionId"
              element={<MydataConsentPage />}
            />
            <Route
              path="/guide/mydata-result/:sessionId"
              element={<MydataSyncComplete />}
            />
            <Route
              path="/guide/upload/:sessionId/:groupKey"
              element={<DocumentUploadPage />}
            />

            {/* 공통 */}
            <Route path="/support" element={<Support />} />
            <Route path="/community/*" element={<Community />} />
            <Route path="/mypage" element={<MyPage />} />

            {/* 사업계획서 평가 */}
            <Route
              path="/guide/:sessionId/business-plan/result"
              element={<BusinessPlanResult />}
            />
            <Route
              path="/guide/:sessionId/business-plan/ready"
              element={<BusinessPlanReady />}
            />
            <Route
              path="/guide/:sessionId/business-plan/analysis-loading"
              element={<BusinessPlanAnalysisLoading />}
            />
            <Route
              path="/guide/:sessionId/business-plan/overall-complete"
              element={<OverallProgressComplete />}
            />

            {/* 인증 */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/find" element={<FindIdPw />} />
            <Route path="/auth/onboarding" element={<Onboarding />} />

            {/* 시뮬레이션 */}
            <Route path="/simulation" element={<SimulationList />} />
            <Route path="/simulation/:id" element={<SimulationDetail />} />

            {/* 하이브리드 평가 */}
            <Route path="/hybrid-evaluation" element={<HybridEvaluation />} />
            <Route
              path="/hybrid-evaluation/:sessionId"
              element={<HybridEvaluation />}
            />
            <Route
              path="/hybrid-evaluation/start"
              element={<StartHybridEvaluation />}
            />
            <Route
              path="/hybrid-evaluation/start/:sessionId"
              element={<StartHybridEvaluation />}
            />
            <Route
              path="/hybrid-evaluation/complete"
              element={<HybridEvaluationComplete />}
            />
            <Route
              path="/hybrid-evaluation/complete/:sessionId"
              element={<HybridEvaluationComplete />}
            />

            {/* 계좌 연결 */}
            <Route path="/bank-connect" element={<BankConnect />} />
            <Route
              path="/bank-connect/complete"
              element={<BankConnectComplete />}
            />

            {/* 404 - 다른 모든 라우트에 매칭되지 않을 때 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>

      {!isNavbarHidden && <Navbar />}
      <CommunityFab />
    </>
  );
}

export default function App() {
  // 스플래시 표시/페이드 상태
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    // 2.6s 후 페이드아웃 시작, 3.0s 후 스플래시 제거
    const a = setTimeout(() => setFadeSplash(true), 2600);
    const b = setTimeout(() => setShowSplash(false), 3000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        maxWidth: 480,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F9F9F9',
      }}
    >
      {/* ✅ 전역 모달은 Router 안에서 어느 라우트에서나 뜨도록 */}
      <BrowserRouter>
        <AuthModal />
        <AppChrome />
      </BrowserRouter>

      {/* 스플래시를 최상단 오버레이로 두어 뒤에 홈이 준비된 상태에서 자연스러운 전환 */}
      {showSplash && <SplashScreen fading={fadeSplash} />}
    </div>
  );
}
