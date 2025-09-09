import type { ReactNode } from "react";
import { ArrowLeft, Bell, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function TopBar({
                                   title, back, onSearchClick, onBackClick
                               }:{
    title: ReactNode;
    back?: boolean;
    onSearchClick?: ()=>void;
    onBackClick?: ()=>void;  // ← 선택적 오버라이드
}){
    const nav = useNavigate();
    const loc = useLocation();

    const handleBack = ()=>{
        if (onBackClick) return onBackClick();
        // 검색 결과 페이지에서는 무조건 커뮤니티 홈으로
        if (loc.pathname.startsWith("/community/search/results")) {
            nav("/community");
            return;
        }
        nav(-1);
    };

    return (
        <header className="topbar">
            <div className="topbar-inner">
                {back ? (
                    <button aria-label="back" className="btn-ghost" onClick={handleBack}>
                        <ArrowLeft className="w-5 h-5"/>
                    </button>
                ) : <div />}

                <div className="topbar-title">{title}</div>

                <div className="flex items-center justify-end gap-3">
                    <button className="btn-ghost" aria-label="bell"><Bell className="w-5 h-5"/></button>
                    <button className="btn-ghost" aria-label="search" onClick={onSearchClick}>
                        <Search className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </header>
    );
}
