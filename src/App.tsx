import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Guide from './pages/Guide';
import Support from './pages/Support';
import Community from './pages/Community';
import MyPage from './pages/MyPage';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import FindIdPw from '@/pages/auth/FindIdPw';
import HybridEvaluation from './pages/Hybrid Evaluation';
import StartHybridEvaluation from './pages/Hybrid Evaluation/Start';

function App() {
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
        <Header />
        <main className="pb-20" style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/support" element={<Support />} />
            <Route path="/community" element={<Community />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/find" element={<FindIdPw />} />
            <Route path="/hybrid-evaluation" element={<HybridEvaluation />} />
            <Route path="/hybrid-evaluation/start" element={<StartHybridEvaluation />} />
          </Routes>
        </main>
        <Navbar />
      </BrowserRouter>
    </div>
  );
}

export default App;
