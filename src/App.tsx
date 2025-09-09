import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

// 공통 컴포넌트
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import SplashScreen from './components/common/SplashScreen';

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

// 하이브리드 평가 페이지
import HybridEvaluation from './pages/Hybrid Evaluation';
import StartHybridEvaluation from './pages/Hybrid Evaluation/Start';

// 시뮬레이션 페이지
import SimulationList from './simulation/pages/SimulationList';
import SimulationDetail from './simulation/pages/SimulationDetail';

function AppChrome() {
    const location = useLocation();

    // 헤더/네브바 표시 정책
    const hideHeaderPaths = ['/', '/auth/login', '/auth/signup', '/auth/find', '/hybrid-evaluation/start'];
    const hideNavbarPaths = ['/auth/login', '/auth/signup', '/auth/find', '/hybrid-evaluation/start', `/simulation/${location.pathname.split('/')[2]}`];

    const isHeaderHidden = hideHeaderPaths.includes(location.pathname);
    const isNavbarHidden = hideNavbarPaths.includes(location.pathname);

    const paddingTop = isHeaderHidden ? '0' : '56px';
    const paddingBottom = isNavbarHidden ? '0' : '80px';

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
                    minHeight: 0, // flex 자식 스크롤 활성화
                }}
            >
                {/* location.key를 key로 사용해서 화면 전환 시 리마운트 → 진입 애니메이션 */}
                <div key={location.key} className="route-animate" style={{ animation: 'routeFadeSlideIn 240ms ease-out both' }}>
                    <Routes location={location}>
                        <Route path="/" element={<Home />} />
                        <Route path="/guide" element={<Guide />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/community/*" element={<Community />} />
                        <Route path="/mypage" element={<MyPage />} />
                        <Route path="/auth/login" element={<Login />} />
                        <Route path="/auth/signup" element={<Signup />} />
                        <Route path="/auth/find" element={<FindIdPw />} />
                        <Route path="/hybrid-evaluation" element={<HybridEvaluation />} />
                        <Route path="/hybrid-evaluation/start" element={<StartHybridEvaluation />} />
                        <Route path="/simulation" element={<SimulationList />} />
                        <Route path="/simulation/:id" element={<SimulationDetail />} />
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
