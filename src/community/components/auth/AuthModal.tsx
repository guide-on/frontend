import { useEffect, useState } from 'react';
import { AUTH_REQUIRED_EVENT } from '../../utils/api';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';

const APP_W = 375; // 앱 프레임 폭

export default function AuthModal() {
    const [open, setOpen] = useState(false);
    const nav = useNavigate();
    const loc = useLocation();

    useEffect(() => {
        const onAuth = () => setOpen(true);
        window.addEventListener(AUTH_REQUIRED_EVENT, onAuth);
        return () => window.removeEventListener(AUTH_REQUIRED_EVENT, onAuth);
    }, []);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    if (!open) return null;

    const goLogin = () => {
        const redirectTo = loc.pathname + loc.search;
        setOpen(false);
        nav('/auth/login', { state: { redirectTo } });
    };

    const goHome = () => {
        // 커뮤니티에서 발생 → 커뮤니티 홈으로, 그 외(홈/다른 화면) → 앱 홈으로
        const to = loc.pathname.startsWith('/community') ? '/community' : '/';
        setOpen(false);
        nav(to);
    };

    return createPortal(
        <div className="fixed inset-0 z-[120] pointer-events-auto">
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[var(--app-w,375px)]" style={{ ['--app-w' as any]: `${APP_W}px` }}>
                    <div className="mx-auto flex items-center justify-center">
                        <div className="bg-white w-[320px] rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] border border-gray-200">
                            <div className="text-[15px] font-semibold">로그인 필요</div>
                            <div className="mt-2 text-sm text-gray-600">로그인 후 이용해주세요.</div>
                            <div className="mt-4 flex gap-2 justify-end">
                                <button className="px-4 py-2 text-sm rounded-xl border" onClick={goHome}>
                                    홈으로
                                </button>
                                <button
                                    className="px-4 py-2 text-sm rounded-xl bg-[color:var(--brand-primary)] text-white"
                                    onClick={goLogin}
                                >
                                    로그인
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
