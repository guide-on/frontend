import { useEffect, useRef, useState } from "react";
import { api } from "../utils/api";
import PostCard from "../components/PostCard";
import type { PostListItem, Paged, PostSort } from "../types/models";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

function makeExcerpt(item: PostListItem, max = 80) {
    const raw = item.excerpt ?? item.contentPreview ?? "";
    if (!raw) return undefined;
    const t = raw.replace(/\s+/g, " ").trim();
    return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

export default function CaseList(){
    const [items,setItems]=useState<PostListItem[]>([]);
    const [total,setTotal]=useState(0);
    const [page,setPage]=useState(1);
    const [sort,setSort]=useState<PostSort>("LATEST");
    const [error,setError]=useState<string|undefined>(undefined);

    const size=10;
    const loadingRef = useRef(false);
    const bootstrappedRef = useRef(false);

    const hasMore = items.length < total;

    const loadMore = async ()=>{
        if (loadingRef.current) return;
        loadingRef.current = true;
        setError(undefined);
        try{
            const res=await api.get("/community/posts",{params:{category:"CASE", page, size, sort}});
            const data:Paged<PostListItem>=res.data.data;
            const next = data.items.map(it => ({ ...it, excerpt: makeExcerpt(it) }));
            setItems(p=>[...p,...next]);
            setTotal(data.total);
        }catch(e){
            // eslint-disable-next-line no-console
            console.debug("🔻 CASE list load failed:", e);
            setError("목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
        }finally{
            setPage(p=>p+1);
            loadingRef.current = false;
        }
    };

    // 정렬이 바뀌면 초기화
    useEffect(()=>{
        setItems([]); setTotal(0); setPage(1); setError(undefined);
        bootstrappedRef.current = false;
    },[sort]);

    // ✅ 진입/필터 변경 시 1페이지를 강제 로드(부트스트랩)
    useEffect(()=>{
        if (!bootstrappedRef.current && page===1 && items.length===0){
            bootstrappedRef.current = true;
            void loadMore();
        }
    },[page, items.length]);

    const {sentinelRef}=useInfiniteScroll(loadMore,hasMore,[sort,page,items.length,total]);

    return (
        <div className="space-y-3">
            {/*<h1 className="text-lg font-bold text-center my-2">동일업종 승인 사례</h1>*/}

            <div className="card p-3 flex flex-wrap gap-2">
                {(['LATEST','POPULAR','VIEWS','BOOKMARKS','LIKES'] as PostSort[]).map(s=>(
                    <button key={s} className={`chip ${sort===s?'chip-blue':'chip-gray'}`} onClick={()=>setSort(s)}>
                        {s==='LATEST'?'최신':s==='POPULAR'?'인기':s==='VIEWS'?'조회':s==='BOOKMARKS'?'북마크':'좋아요'}
                    </button>
                ))}
            </div>

            {error && <div className="card p-4 text-sm text-red-600">{error}</div>}
            {!error && items.length===0 && total===0 && (
                <div className="card p-4 text-sm text-gray-500">게시글이 없습니다.</div>
            )}

            <div className="grid gap-3">{items.map(p=><PostCard key={p.id} item={p}/>)}</div>
            <div ref={sentinelRef} className="h-10"/>
        </div>
    );
}
