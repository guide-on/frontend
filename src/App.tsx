import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import Home from './home/pages/Home';
import Guide from './pages/Guide';
import Support from './pages/Support';
import Community from './community/index.tsx';
import MyPage from './pages/MyPage';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import FindIdPw from '@/pages/auth/FindIdPw';
import SimulationList from './simulation/pages/SimulationList';
import SimulationDetail from './simulation/pages/SimulationDetail';

function AppChrome() {
    const { pathname } = useLocation();
    const isSearchScreen = pathname === '/community/search' || pathname === '/community/search/';
    const hideHeader = isSearchScreen || pathname === '/';           // 홈에서는 헤더 감춤
    const paddingTop = hideHeader ? 0 : 56;
    const paddingBottom = 60;

    return (
        <>
            {!hideHeader && <Header />}
            <main style={{ flex: 1, overflowY: 'auto', paddingTop, paddingBottom }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/guide" element={<Guide />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/community/*" element={<Community />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/signup" element={<Signup />} />
                    <Route path="/auth/find" element={<FindIdPw />} />
                    <Route path="/simulation" element={<SimulationList />} />
                    <Route path="/simulation/:id" element={<SimulationDetail />} />
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
