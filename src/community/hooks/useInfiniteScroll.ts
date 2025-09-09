import { useCallback, useEffect, useRef, useState } from "react";

export function useInfiniteScroll(loadMore: ()=>Promise<void>, hasMore: boolean, deps: any[] = []) {
    const ref = useRef<HTMLDivElement|null>(null);
    const [ready, setReady] = useState(false);

    const ioCb = useCallback((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore) {
            loadMore();
        }
    }, [hasMore, loadMore]);

    useEffect(()=>{
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(ioCb, { rootMargin: "200px" });
        io.observe(el);
        setReady(true);
        return ()=>io.disconnect();
    }, [ioCb, ...deps]);

    return { sentinelRef: ref, ready };
}
