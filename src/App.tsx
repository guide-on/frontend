import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';

// 공통 페이지
import Home from './home/pages/Home';
import Support from './pages/Support';
import Community from './community/index.tsx';
import MyPage from './pages/MyPage';

// 인증
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import FindIdPw from '@/pages/auth/FindIdPw';

// 시뮬레이션
import SimulationList from './simulation/pages/SimulationList';
import SimulationDetail from './simulation/pages/SimulationDetail';
import DocumentSurveyPage from '@/guide/pages/DocumentSurveyPage';
import PolicyListPage from '@/guide/pages/PolicyListPage';
import RequiredDocumentsPage from '@/guide/pages/RequiredDocumentsPage';
import DocumentUploadPage from '@/guide/pages/DocumentUploadPage';
import MydataConsentPage from '@/guide/pages/MydataConsentPage';
import MydataSyncComplete from '@/guide/pages/MydataSyncComplete';

// 가이드(서류 등록)
import DocumentSurveyPage from '@/guide/pages/DocumentSurveyPage';
import PolicyListPage from '@/guide/pages/PolicyListPage';
import RequiredDocumentsPage from '@/guide/pages/RequiredDocumentsPage';
import DocumentUploadPage from '@/guide/pages/DocumentUploadPage';
import MydataConsentPage from '@/guide/pages/MydataConsentPage';
import MydataSyncComplete from '@/guide/pages/MydataSyncComplete';

// 하이브리드 평가 (브랜치 추가분)
// ⚠️ 실제 경로가 다르면 아래 import 경로를 프로젝트 구조에 맞춰 수정하세요.
import HybridEvaluation from './pages/Hybrid Evaluation';
import StartHybridEvaluation from './pages/Hybrid Evaluation/Start';

function AppChrome() {
  const { pathname } = useLocation();

  // 커뮤니티 검색화면 또는 홈에서는 헤더 숨김
  const isSearchScreen =
    pathname === '/community/search' || pathname === '/community/search/';
  const hideHeader = isSearchScreen || pathname === '/';

  const paddingTop = hideHeader ? 0 : 56;
  const paddingBottom = 60;

  return (
    <>
      {!hideHeader && <Header />}
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
      <Navbar />
    </>
  );
}

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
