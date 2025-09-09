// src/home/utils/user.ts
import { useMemo } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

/** 로그인 사용자 이름(없으면 '방문자') */
export function useDisplayName(): string {
    const user = useAuthStore((s) => s.user);
    return useMemo(() => {
        const nm = user?.name?.trim?.();
        return nm && nm.length > 0 ? nm : '방문자';
    }, [user?.name]);
}

/** 로그인 여부 플래그 (단순히 이름 존재로 판정) */
export function useIsLoggedIn(): boolean {
    const user = useAuthStore((s) => s.user);
    return !!(user?.name && user.name.trim().length > 0);
}
