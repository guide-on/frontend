import type {ReactNode} from 'react';

/**
 * 홈 공통 레이아웃
 * - 375~420px 모바일 프레임 폭 정렬
 * - App에서 Header/BottomNav padding을 이미 주므로 여기선 내부 여백만 관리
 */
export default function HomeLayout({
                                       children,
                                       footerSpace = true,
                                   }: {
    children: ReactNode;
    /** 네브바 높이만큼 하단 여백 유지 (기본 true) */
    footerSpace?: boolean;
}) {
    return (
        <div
            className="mx-auto w-full"
            style={{
                maxWidth: 420,
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 8,
                paddingBottom: footerSpace ? 96 : 0, // 네브바(+여유)
            }}
        >
            {children}
        </div>
    );
}
