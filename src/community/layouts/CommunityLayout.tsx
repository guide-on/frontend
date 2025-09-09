import { Outlet, useLocation, useNavigate } from "react-router-dom";
// ✅ 공통 헤더/네브바는 App.tsx에서 렌더 → 여기선 제거
// import Header from "../../components/common/Header";
// import Navbar from "../../components/common/Navbar";

// ✅ 내 디자인(임시 비활성화)
// import TopBar from "../components/nav/TopBar";
// import BottomTab from "../components/nav/BottomTab";

import { Pencil } from "lucide-react";
import "../styles/index.css";
import AuthModal from "../components/auth/AuthModal";

export default function CommunityLayout(){
    const nav = useNavigate();
    const { pathname } = useLocation();
    const isHome = pathname === "/community" || pathname === "/community/";

    return (
        <div className="community app-shell with-common-header">
            <main className="main-content container-mobile py-3">
                <Outlet/>
            </main>

            {/* 내 디자인 BottomTab/TopBar는 주석 유지 */}

            {isHome && (
                <button aria-label="글 작성" className="fab" onClick={()=>nav("/community/posts/new")}>
                    <Pencil className="w-5 h-5"/>
                </button>
            )}

            <AuthModal/>
        </div>
    );
}
