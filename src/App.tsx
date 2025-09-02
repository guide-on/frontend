import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Guide from './pages/Guide';
import Support from './pages/Support';
import Community from './pages/Community';
import MyPage from './pages/MyPage';

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
        <main className="pb-20" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/support" element={<Support />} />
            <Route path="/community" element={<Community />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </main>
        <Navbar />
      </BrowserRouter>
    </div>
  );
}

export default App;
