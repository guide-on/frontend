import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// 공통 컴포넌트
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';

// 페이지 컴포넌트
import Home from './home/pages/Home';
import Support from './pages/Support';
import MyPage from './pages/MyPage';
import Community from './community/index.tsx';

// 인증
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import FindIdPw from '@/pages/auth/FindIdPw';

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

// 하이브리드 평가 (브랜치 추가분)
// ⚠️ 실제 폴더명이 다르면 import 경로를 프로젝트에 맞게 조정하세요.
import HybridEvaluation from './pages/Hybrid Evaluation';
import StartHybridEvaluation from './pages/Hybrid Evaluation/Start';

/**
 * 라우팅에 따라 Header, Navbar 및 메인 콘텐츠의 패딩을 관리하는 컴포넌트
 */
function AppChrome() {
  const { pathname } = useLocation();

  // === Header 숨김 조건 ===
  // - 홈(/)
  // - 커뮤니티 검색(/community/search, /community/search/)
  // - 인증/하이브리드 시작 화면
  const hideHeaderExact = new Set([
    '/', // 홈
    '/community/search',
    '/community/search/',
    '/auth/login',
    '/auth/signup',
    '/auth/find',
    '/hybrid-evaluation/start',
  ]);

  // === Navbar 숨김 조건 ===
  // - 인증/하이브리드 시작 화면
  // - 시뮬레이션 상세(/simulation/:id)
  const hideNavbarExact = new Set([
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
      {!isHeaderHidden && <Header />}
      <main style={{ flex: 1, overflowY: 'auto', paddingTop, paddingBottom }}>
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
      </main>
      {!isNavbarHidden && <Navbar />}
    </>
  );
}

/**
 * 앱의 최상위 컴포넌트
 */
export default function App() {
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
    </div>
  );
}
