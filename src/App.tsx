import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Guide from './pages/Guide';
import Support from './pages/Support';
import Community from './community/index.tsx';
import MyPage from './pages/MyPage';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import FindIdPw from '@/pages/auth/FindIdPw';

function AppChrome() {
    const { pathname } = useLocation();

    // 검색 입력 화면(/community/search)에서만 헤더 감춤
    const isSearchScreen =
        pathname === '/community/search' || pathname === '/community/search/';

    const paddingTop = isSearchScreen ? 0 : 56; // 헤더 높이
    const paddingBottom = 60;                    // 네브바 높이

    return (
        <>
            {!isSearchScreen && <Header />}

            <main
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingTop,
                    paddingBottom,
                }}
            >
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/guide" element={<Guide />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/community/*" element={<Community />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/signup" element={<Signup />} />
                    <Route path="/auth/find" element={<FindIdPw />} />
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
