import { Home, BookOpenCheck, FolderOpen, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function BottomTab(){
    const loc = useLocation();
    const path = loc.pathname;

    return (
        <nav className="bottombar">
            <div className="bottombar-inner">
                <Tab to="/"           label="대출가이드"  icon={<BookOpenCheck className="w-5 h-5"/>} active={path === "/"} />
                <Tab to="/"           label="공공지원"    icon={<FolderOpen className="w-5 h-5"/>}    active={false} />
                <Tab to="/"           label="홈"          icon={<Home className="w-5 h-5"/>}          active={false} />
                <Tab to="/community"  label="커뮤니티"    icon={<MessageSquare className="w-5 h-5"/>} active={path.startsWith("/community")} />
                <Tab to="/"           label="마이페이지"  icon={<User className="w-5 h-5"/>}          active={path.startsWith("/mypage")} />
            </div>
        </nav>
    );
}

function Tab({to,label,icon,active}:{to:string;label:string;icon:React.ReactNode;active?:boolean}){
    return (
        <Link
            to={to}
            className={`bottombar-item ${active?'bottombar-item-active':''}`}
            aria-current={active ? 'page' : undefined}
        >
            {icon}<span>{label}</span>
        </Link>
    );
}
