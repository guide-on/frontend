import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// 공통 컴포넌트
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';

// 페이지 컴포넌트
import Home from './home/pages/Home';
import Guide from './pages/Guide';
import Support from './pages/Support';
import MyPage from './pages/MyPage';
import Community from './community/index.tsx';

// 인증 관련 페이지
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import FindIdPw from '@/pages/auth/FindIdPw';
import Onboarding from '@/pages/auth/Onboarding';

// 하이브리드 평가 페이지
import HybridEvaluation from './pages/Hybrid Evaluation';
import StartHybridEvaluation from './pages/Hybrid Evaluation/Start';

// 시뮬레이션 페이지
import SimulationList from './simulation/pages/SimulationList';
import SimulationDetail from './simulation/pages/SimulationDetail';

/**
 * 라우팅에 따라 Header, Navbar 및 메인 콘텐츠의 패딩을 관리하는 컴포넌트
 */
function AppChrome() {
  const location = useLocation();

  // Header를 숨길 경로 목록
  const hideHeaderPaths = [
    '/auth/login',
    '/auth/signup',
    '/auth/find',
    '/hybrid-evaluation/start',
  ];

  // Navbar를 숨길 경로 목록
  const hideNavbarPaths = [
    '/auth/login',
    '/auth/signup',
    '/auth/find',
    '/hybrid-evaluation/start',
    // 시뮬레이션 상세 페이지에서도 Navbar 숨김 처리
    `/simulation/${location.pathname.split('/')[2]}`,
  ];

  const isHeaderHidden = hideHeaderPaths.includes(location.pathname);
  const isNavbarHidden = hideNavbarPaths.includes(location.pathname);

  // Header와 Navbar의 유무에 따라 main 영역의 padding을 동적으로 조절
  const paddingTop = isHeaderHidden ? '0' : '56px'; // Header 높이만큼 패딩
  const paddingBottom = isNavbarHidden ? '0' : '80px'; // Navbar 높이만큼 패딩

  return (
    <>
      {!isHeaderHidden && <Header />}
      <main style={{ flex: 1, overflowY: 'auto', paddingTop, paddingBottom }}>
        <Routes>
          {/* 두 버전의 모든 라우트를 통합 */}
          <Route path="/" element={<Home />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/support" element={<Support />} />
          <Route path="/community/*" element={<Community />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/find" element={<FindIdPw />} />
          <Route path="/auth/onboarding" element={<Onboarding />} />
          <Route path="/hybrid-evaluation" element={<HybridEvaluation />} />
          <Route
            path="/hybrid-evaluation/start"
            element={<StartHybridEvaluation />}
          />
          <Route path="/simulation" element={<SimulationList />} />
          <Route path="/simulation/:id" element={<SimulationDetail />} />
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
