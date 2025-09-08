import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { X, Search as SearchIcon, ChevronLeft } from "lucide-react";
import { api } from "../utils/api";
import type { HashtagDto, FreeType } from "../types/models";

type Category = "CASE" | "FREE" | undefined;
type FreeTypeOpt = { code: FreeType; label: string };

export default function Search(){
    const nav = useNavigate();
    const [q,setQ]=useState("");
    const [category,setCategory]=useState<Category>(undefined);

    // 선택 값들
    const [tags,setTags]=useState<string[]>([]);
    const [industries,setIndustries] = useState<string[]>([]);
    const [freeTypes,setFreeTypes] = useState<string[]>([]); // ← code 배열(QUESTION 등)

    // 🔹 서버에서 가져온 옵션 풀
    const [sectorPool, setSectorPool] = useState<string[]>([]);
    const [freeTypePool, setFreeTypePool] = useState<FreeTypeOpt[]>([]);
    const [tagPool, setTagPool] = useState<string[]>([]);

    // 검색 모드 진입 시 공통 헤더 숨김
    useEffect(()=>{
        const root = document.querySelector(".community");
        root?.classList.add("search-mode");
        return ()=>root?.classList.remove("search-mode");
    },[]);

    // 🔹 옵션 풀 로드
    useEffect(()=>{
        Promise.all([
            api.get("/community/hashtags",{ params:{ type:"SECTOR" } }),
            api.get("/community/hashtags",{ params:{ type:"POST_TYPE" } }),
            api.get("/community/hashtags",{ params:{ type:"GENERIC" } }),
        ])
            .then(([s, p, g])=>{
                const sectors = (s.data?.data as HashtagDto[] | undefined)?.map(h=>h.name) ?? [];
                const fts = (p.data?.data as HashtagDto[] | undefined)?.map(h=>({
                    code: (h.code as FreeType) ?? (
                        h.name==="질문" ? "QUESTION" :
                            h.name==="홍보" ? "PROMO"   :
                                h.name.replace(/\s/g,"")==="마케팅팁" ? "TIP" : "OTHER"
                    ),
                    label: h.name
                })) ?? [];
                const tags = (g.data?.data as HashtagDto[] | undefined)?.map(h=>h.name) ?? [];
                setSectorPool(sectors);
                setFreeTypePool(fts);
                setTagPool(tags);
            })
            .catch(()=>{ // fallback(스샷 기반)
                setSectorPool(["요식업","미용","의류","소매업","서비스업"]);
                setFreeTypePool([
                    { code:"QUESTION", label:"질문" },
                    { code:"PROMO",    label:"홍보" },
                    { code:"TIP",      label:"마케팅팁" },
                    { code:"OTHER",    label:"기타" },
                ]);
                setTagPool(["정부지원","세무","노무","마케팅","창업","운영팁"]);
            });
    },[]);

    // 카테고리 바뀌면 보조필터 정리 + 자유 해시태그만 유지
    useEffect(()=>{
        setIndustries(prev => prev.filter(t=>sectorPool.includes(t)));
        setFreeTypes(prev => prev.filter(code=>freeTypePool.some(ft=>ft.code===code)));
        const reserved = new Set<string>([
            ...sectorPool,
            ...freeTypePool.map(ft=>ft.label)
        ]);
        setTags(prev => prev.filter(t=>!reserved.has(t)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[category, sectorPool.join("|"), freeTypePool.map(f=>f.code).join("|")]);

    const recentKey="recentSearches";
    const recent:string[] = (JSON.parse(localStorage.getItem(recentKey)||"[]") as string[])
        .filter(v => typeof v === "string" && v.trim().length>0);

    const addRecent=(text:string)=>{
        const v = text.trim();
        if(!v) return;
        const next=[v, ...recent.filter(r=>r!==v)].slice(0,8);
        localStorage.setItem(recentKey, JSON.stringify(next));
    };

    const submit=(e?:React.FormEvent)=>{
        e?.preventDefault();
        const params = new URLSearchParams();
        if(q.trim()) params.set("q", q.trim());
        if(category) params.set("category", category);
        if(industries.length) params.set("industries", industries.join(","));
        if(freeTypes.length) params.set("freeType", freeTypes.join(",")); // ← code 로 전달
        if(tags.length) params.set("hashtags", tags.join(","));
        addRecent(q);
        nav(`/community/search/results?${params.toString()}`);
    };

    const toggle = (arr:string[], setter:(v:string[])=>void, name:string)=>{
        const has = arr.includes(name);
        setter(has ? arr.filter(x=>x!==name) : [...arr, name]);
    };

    return (
        <div className="container-mobile py-3">
            {/* 상단 검색 전용 헤더 : 컨테이너 양끝까지 확장 */}
            <form onSubmit={submit} className="flex items-center gap-2 mb-6 -mx-4 px-0">
                <button type="button" onClick={()=>nav(-1)} className="p-2 rounded-lg hover:bg-gray-100 shrink-0">
                    <ChevronLeft className="w-5 h-5"/>
                </button>

                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 h-11 flex-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
                    <input
                        className="bg-transparent outline-none w-full text-sm pl-2"
                        value={q}
                        onChange={e=>setQ(e.target.value)}
                        placeholder="원하는 글을 검색해보세요"
                    />
                    {q && (
                        <button type="button" onClick={()=>setQ("")} className="p-1 rounded hover:bg-gray-200">
                            <X className="w-4 h-4 text-gray-500"/>
                        </button>
                    )}
                    <button type="submit" className="p-1 rounded hover:bg-gray-200">
                        <SearchIcon className="w-5 h-5 text-gray-700"/>
                    </button>
                </div>
            </form>

            <div className="space-y-8">
                {/* 최근 검색어 */}
                <Section
                    title="최근검색어"
                    right={recent.length ? <button className="text-xs text-gray-500" onClick={()=>{localStorage.removeItem(recentKey); location.reload();}}>전체 삭제</button> : undefined}
                >
                    {recent.length ? (
                        <div className="flex flex-wrap gap-2">
                            {recent.map(r=>(
                                <button key={r} className="chip-toggle" onClick={()=>{ setQ(r); submit(); }}>{r}</button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400">검색 내역이 없습니다.</div>
                    )}
                </Section>

                {/* 카테고리 */}
                <Section title="카테고리">
                    <div className="flex flex-wrap gap-2">
                        <ToggleChip active={category===undefined} onClick={()=>setCategory(undefined)}>전체</ToggleChip>
                        <ToggleChip active={category==='CASE'} onClick={()=>setCategory('CASE')}>대출 승인 사례</ToggleChip>
                        <ToggleChip active={category==='FREE'} onClick={()=>setCategory('FREE')}>자유게시판</ToggleChip>
                    </div>
                </Section>

                {/* 보조 필터 */}
                {category==='CASE' && (
                    <Section title="업종">
                        <div className="flex flex-wrap gap-2">
                            {sectorPool.map(n=>(
                                <button key={n}
                                        onClick={()=>toggle(industries,setIndustries,n)}
                                        className={`chip-toggle ${industries.includes(n)?"chip-toggle-active":""}`}
                                >#{n}</button>
                            ))}
                        </div>
                    </Section>
                )}

                {category==='FREE' && (
                    <Section title="글 유형">
                        <div className="flex flex-wrap gap-2">
                            {freeTypePool.map(({code,label})=>(
                                <button key={code}
                                        onClick={()=>toggle(freeTypes,setFreeTypes,code)}
                                        className={`chip-toggle ${freeTypes.includes(code)?"chip-toggle-active":""}`}
                                >#{label}</button>
                            ))}
                        </div>
                    </Section>
                )}

                {/* 자유 해시태그 */}
                <Section title="해시태그">
                    <div className="flex flex-wrap gap-2">
                        {tagPool.map(t=>{
                            const active = tags.includes(t);
                            return (
                                <button key={t}
                                        onClick={()=>toggle(tags,setTags,t)}
                                        className={`chip-toggle ${active?"chip-toggle-active":""}`}
                                >#{t}</button>
                            );
                        })}
                    </div>
                </Section>
            </div>
        </div>
    );
}

function Section({title,right,children}:{title:string;right?:React.ReactNode;children:React.ReactNode}){
    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="label">{title}</div>
                {right}
            </div>
            {children}
        </section>
    );
}

function ToggleChip({active, children, onClick}:{active?:boolean; children:React.ReactNode; onClick?:()=>void;}){
    return (
        <button onClick={onClick} className={`chip-toggle ${active ? "chip-toggle-active" : ""}`}>
            {children}
        </button>
    );
}
