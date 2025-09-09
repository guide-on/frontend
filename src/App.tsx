// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

// 공통 컴포넌트
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import SplashScreen from './components/common/SplashScreen';

// 페이지 컴포넌트
import Home from './home/pages/Home';
import Support from './pages/Support';
import MyPage from './pages/MyPage';
import Community from './community/index.tsx';

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

// 하이브리드 평가
import HybridEvaluation from './pages/Hybrid Evaluation';
import StartHybridEvaluation from './pages/Hybrid Evaluation/Start.tsx';

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
    '/hybrid-evaluation/start',
  ]);

  // === Navbar 숨김 조건 ===
  const hideNavbarExact = new Set<string>([
    '/auth/login',
    '/auth/signup',
    '/auth/find',
    '/hybrid-evaluation/start',
  ]);
  const hideNavbarPrefixes = ['/simulation/'];

  const isHeaderHidden = hideHeaderExact.has(pathname);
  const isNavbarHidden =
    hideNavbarExact.has(pathname) ||
    hideNavbarPrefixes.some((p) => pathname.startsWith(p));

  // Header / Navbar 유무에 따른 main 패딩
  const paddingTop = isHeaderHidden ? 0 : 56; // px
  const paddingBottom = isNavbarHidden ? 0 : 80; // px

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
            <Route path="/guide" element={<DocumentSurveyPage />} />
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
              path="/hybrid-evaluation/start"
              element={<StartHybridEvaluation />}
            />
          </Routes>
        </div>
      </main>

      {!isNavbarHidden && <Navbar />}
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
        width: 375,
        height: 812,
        margin: '0 auto',
        boxShadow: '0 0 24px 0 rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <BrowserRouter>
        <AppChrome />
      </BrowserRouter>

      {/* 스플래시를 최상단 오버레이로 → 뒤에 홈이 준비된 상태에서 자연스러운 전환 */}
      {showSplash && <SplashScreen fading={fadeSplash} />}
    </div>
  );
}
