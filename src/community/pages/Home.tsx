import { useEffect, useRef, useState } from "react";
import { api } from "../utils/api";
import PostCard from "../components/PostCard";
import { useNavigate } from "react-router-dom";
import type { PostListItem, HashtagDto, Paged } from "../types/models";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 더미 슬라이드 4개
const slides = [
    { title: "카페는, 브랜딩이다.", subtitle: "SNS에서 핫한 카페의 비밀", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1200" },
    { title: "소상공인 정책자금 한눈에", subtitle: "오늘 받을 수 있는 지원은?", img: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1200" },
    { title: "마케팅은 데이터로", subtitle: "동네상권 분석 가이드", img: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200" },
    { title: "금융은 타이밍", subtitle: "승인확률 높이는 팁", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200" }
];

function makeExcerpt(item: PostListItem, max = 64) {
    const raw = item.excerpt ?? item.contentPreview ?? "";
    if (!raw) return undefined;
    const t = raw.replace(/\s+/g, " ").trim();
    return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

const fallback = {
    case(): PostListItem {
        const tags: HashtagDto[] = [
            { id: -101, name: "카페", tagType: "SECTOR" },
            { id: -102, name: "매출증대", tagType: "GENERIC" },
            { id: -103, name: "시뮬레이션", tagType: "GENERIC" },
        ];
        return {
            id: 999001, category: "CASE",
            title: "창업 2년차, 매출 부족으로 고민하다 승인 받았어요",
            createdAt: "2024-10-27T09:00:00Z",
            hashtags: tags, viewCount: 150,
            likeCount: 12, bookmarkCount: 25, commentCount: 5,
            authorEmail: "owner@cafe.com",
            sectorName: "카페",
            thumbnailUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&q=80",
            excerpt: "운전자금 + 카드매출 실적 기반으로 승인률을 높인 사례를 공유합니다."
        } as PostListItem;
    },
    free(): PostListItem {
        const tags: HashtagDto[] = [
            { id: -201, name: "마케팅", tagType: "GENERIC" },
            { id: -202, name: "인스타그램", tagType: "GENERIC" },
            { id: -203, name: "홍보", tagType: "POST_TYPE" },
        ];
        return {
            id: 999002, category: "FREE", freeType: "TIP",
            title: "인스타그램 팔로워 늘리는 팁 공유합니다!",
            createdAt: "2024-10-26T11:00:00Z",
            hashtags: tags, viewCount: 250,
            likeCount: 32, bookmarkCount: 18, commentCount: 5,
            authorEmail: "marketer@example.com",
            thumbnailUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&q=80",
            excerpt: "스토리 하이라이트와 릴스 해시태그 전략 정리."
        } as PostListItem;
    }
};

export default function Home(){
    const [topCase,setTopCase]=useState<PostListItem|null>(null);
    const [topFree,setTopFree]=useState<PostListItem|null>(null);
    const nav = useNavigate();

    useEffect(()=>{
        Promise.all([
            api.get("/community/posts",{params:{category:"CASE", sort:"POPULAR", size:1, page:1}}),
            api.get("/community/posts",{params:{category:"FREE", sort:"POPULAR", size:1, page:1}})
        ])
            .then(([a,b])=>{
                const aData = (a.data?.data as Paged<PostListItem> | undefined)?.items?.[0];
                const bData = (b.data?.data as Paged<PostListItem> | undefined)?.items?.[0];
                if (aData) aData.excerpt = makeExcerpt(aData);
                if (bData) bData.excerpt = makeExcerpt(bData);
                setTopCase(aData ?? fallback.case());
                setTopFree(bData ?? fallback.free());
            })
            .catch((e)=>{
                console.debug("🔻 home top fetch failed:", e);
                setTopCase(fallback.case());
                setTopFree(fallback.free());
            });
    },[]);

    return (
        <div className="space-y-4">
            <div className="mt-6"><BannerCarousel/></div>
            <SectionHeader title="대출 승인 사례" onMore={()=>nav("/community/cases")} />
            {topCase ? <PostCard item={topCase}/> : <EmptyCard/>}
            <SectionHeader title="자유게시판" onMore={()=>nav("/community/freeboard")} />
            {topFree ? <PostCard item={topFree}/> : <EmptyCard/>}
        </div>
    );
}

function SectionHeader({title,onMore}:{title:string;onMore:()=>void}){
    return (
        <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{title}</h2>
            <button className="text-xs text-[color:var(--brand-secondary)] hover:underline" onClick={onMore}>더 보기</button>
        </div>
    );
}
function EmptyCard(){ return <div className="card p-4 text-sm text-gray-500">게시글이 없습니다.</div>; }

function BannerCarousel(){
    const [index,setIndex] = useState(0);
    const ref = useRef<HTMLDivElement|null>(null);

    useEffect(()=>{
        const el = ref.current;
        if(!el) return;
        const onScroll = () => {
            const i = Math.round(el.scrollLeft / el.clientWidth);
            setIndex(Math.max(0, Math.min(slides.length-1, i)));
        };
        el.addEventListener("scroll", onScroll, { passive:true });
        return ()=>el.removeEventListener("scroll", onScroll);
    },[]);

    const goTo = (i:number)=>{
        const el = ref.current;
        if(!el) return;
        const next = Math.max(0, Math.min(slides.length-1, i));
        el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    };

    return (
        <div className="card overflow-hidden relative">
            <div ref={ref} className="carousel-track">
                {slides.map((s, i)=>(
                    <div key={i} className="carousel-slide">
                        <img src={s.img} className="w-full h-40 object-cover"/>
                        <div className="absolute inset-0 p-4">
                            <div className="text-white text-xl font-extrabold drop-shadow">{s.title}</div>
                            <div className="text-white/90 text-xs mt-1 drop-shadow">{s.subtitle}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 좌/우 화살표 */}
            <button
                aria-label="이전 배너"
                onClick={()=>goTo(index-1)}
                disabled={index===0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center
                   bg-white/80 backdrop-blur shadow-md disabled:opacity-40"
            >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
                aria-label="다음 배너"
                onClick={()=>goTo(index+1)}
                disabled={index===slides.length-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center
                   bg-white/80 backdrop-blur shadow-md disabled:opacity-40"
            >
                <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            <div className="carousel-dots">
                {slides.map((_,i)=>(
                    <button key={i} className={`dot ${i===index?'dot-active':''}`} onClick={()=>goTo(i)} aria-label={`배너 ${i+1}`} />
                ))}
            </div>
        </div>
    );
}