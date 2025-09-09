import type { FreeType, PostCategory, PostSort } from "../types/models";
import Button from "./ui/Button";

type Props = {
    category?: PostCategory;
    setCategory?: (c?: PostCategory)=>void;
    freeType?: FreeType;
    setFreeType?: (t?: FreeType)=>void;
    sort?: PostSort;
    setSort?: (s: PostSort)=>void;
};

export default function FiltersBar({category, setCategory, freeType, setFreeType, sort="LATEST", setSort}: Props) {
    return (
        <div className="card p-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
                <span className="label mr-1">카테고리</span>
                <Button variant={category===undefined?'secondary':'outline'} onClick={()=>setCategory?.(undefined)}>전체</Button>
                <Button variant={category==='CASE'?'secondary':'outline'} onClick={()=>setCategory?.('CASE' as PostCategory)}>승인사례</Button>
                <Button variant={category==='FREE'?'secondary':'outline'} onClick={()=>setCategory?.('FREE' as PostCategory)}>자유게시판</Button>
            </div>
            <div className="flex items-center gap-1">
                <span className="label mr-1">정렬</span>
                {(['LATEST','POPULAR','VIEWS','BOOKMARKS','LIKES'] as PostSort[]).map(s=> (
                    <Button key={s} variant={sort===s?'secondary':'outline'} onClick={()=>setSort?.(s)}>{labelSort(s)}</Button>
                ))}
            </div>
            {category==='FREE' && (
                <div className="flex items-center gap-1">
                    <span className="label mr-1">종류</span>
                    <Button variant={!freeType?'secondary':'outline'} onClick={()=>setFreeType?.(undefined)}>전체</Button>
                    {(['QUESTION','PROMO','TIP','OTHER'] as FreeType[]).map(t=> (
                        <Button key={t} variant={freeType===t?'secondary':'outline'} onClick={()=>setFreeType?.(t)}>{labelFreeType(t)}</Button>
                    ))}
                </div>
            )}
        </div>
    );
}

function labelSort(s: PostSort) {
    switch(s){ case 'LATEST': return '최신'; case 'POPULAR': return '인기'; case 'VIEWS': return '조회';
        case 'BOOKMARKS': return '북마크'; case 'LIKES': return '좋아요'; default: return s; }
}
function labelFreeType(t: FreeType){ return t==='QUESTION'?'질문': t==='PROMO'?'홍보': t==='TIP'?'마케팅팁':'기타'; }
