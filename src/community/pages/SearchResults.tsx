// src/community/pages/SearchResults.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import type {
    PostListItem,
    PostCategory,
    FreeType,
    PostSort,
    Paged,
    HashtagDto,
} from "../types/models";
import { useSearchParams } from "react-router-dom";
import { api } from "../utils/api";
import PostCard from "../components/PostCard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { SlidersHorizontal } from "lucide-react";
import { createPortal } from "react-dom";

function makeExcerpt(item: PostListItem, max = 80) {
    const raw = item.excerpt ?? item.contentPreview ?? "";
    if (!raw) return undefined;
    const t = raw.replace(/\s+/g, " ").trim();
    return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

/* ─────────────────────── Helpers ─────────────────────── */
const arrFromCSV = (csv?: string) =>
    (csv ? csv.split(",").map((s) => s.trim()).filter(Boolean) : []) as string[];

// 그룹 내 OR, 그룹 간 AND 보정 필터
function buildLocalMatcher({
                               category,
                               freeTypeParam,
                               industriesParam,
                               hashtagsParam,
                           }: {
    category?: PostCategory;
    freeTypeParam: string;
    industriesParam: string;
    hashtagsParam: string;
}) {
    const freeTypesSel = arrFromCSV(freeTypeParam) as FreeType[];
    const industriesSel = arrFromCSV(industriesParam);
    const hashtagsSel = arrFromCSV(hashtagsParam); // 이름 기준

    const namesOf = (it: PostListItem) =>
        new Set((it.hashtags ?? []).map((h) => h.name).filter(Boolean));

    // 모든 선택 해시태그를 포함해야 함 (AND)
    const hasAllHashtags = (it: PostListItem) => {
        if (!hashtagsSel.length) return true;
        const set = namesOf(it);
        return hashtagsSel.every((n) => set.has(n));
    };

    // 업종(OR, CASE에서만 의미)
    const matchesIndustries = (it: PostListItem) => {
        if (category !== "CASE") return true;
        if (!industriesSel.length) return true;
        const set = namesOf(it);
        return industriesSel.some((n) => set.has(n));
    };

    // 글유형(OR, FREE에서만 의미)
    const matchesFreeType = (it: PostListItem) => {
        if (category !== "FREE") return true;
        if (!freeTypesSel.length) return true;
        return freeTypesSel.includes(it.freeType as FreeType);
    };

    return (it: PostListItem) => {
        const catOk = category ? it.category === category : true;
        return catOk && matchesFreeType(it) && matchesIndustries(it) && hasAllHashtags(it);
    };
}

/* ─────────────────────── Page ─────────────────────── */
export default function SearchResults() {
    const [sp, setSp] = useSearchParams();
    const [items, setItems] = useState<PostListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [open, setOpen] = useState(false);
    const [initialized, setInitialized] = useState(false); // 첫 조회 완료 여부
    const size = 5;

    // 직전 요청 식별자(경합 방지)
    const loadingRef = useRef(false);
    const reqIdRef = useRef(0);

    // ── 검색 파라미터 ──────────────────────────────────────────
    const q = sp.get("q") || "";
    const sort = (sp.get("sort") || "LATEST") as PostSort;
    const category = (sp.get("category") || undefined) as PostCategory | undefined;
    const freeTypeParam = sp.get("freeType") || "";

    // 표시용(칩)
    const industriesParam = sp.get("industries") || "";
    const hashtagsParam = sp.get("hashtags") || "";

    // 실제 검색용(ID CSV)
    const hashtagIdsParam = sp.get("hashtagIds") || "";

    // ✅ 여러 파라미터를 한 번에 갱신 (덮어쓰기 방지)
    const setParams = (mutate: (next: URLSearchParams) => void) => {
        const next = new URLSearchParams(sp);
        mutate(next);
        setSp(next);
    };

    // 필터 초기화(빈 결과에서 사용)
    const resetFilters = () => {
        setParams((next) => {
            ["category", "freeType", "industries", "hashtags", "hashtagIds"].forEach((k) =>
                next.delete(k)
            );
        });
    };

    // ── 해시태그 마스터(백엔드 로드) ────────────────────────────
    const [sectorTags, setSectorTags] = useState<HashtagDto[]>([]);
    const [genericTags, setGenericTags] = useState<HashtagDto[]>([]);
    const [postTypeTags, setPostTypeTags] = useState<HashtagDto[]>([]);

    const nameToId = useMemo(() => {
        const m = new Map<string, number>();
        [...sectorTags, ...genericTags, ...postTypeTags].forEach((h) => {
            if (typeof h.id === "number") m.set(h.name, h.id);
        });
        return m;
    }, [sectorTags, genericTags, postTypeTags]);

    useEffect(() => {
        api
            .get("/community/hashtags/all", { params: { activeOnly: true } })
            .then((res) => {
                const d = res?.data?.data as {
                    sector: HashtagDto[];
                    postTypes: HashtagDto[];
                    generic: HashtagDto[];
                };
                setSectorTags(d?.sector ?? []);
                setPostTypeTags(d?.postTypes ?? []);
                setGenericTags(d?.generic ?? []);
            })
            .catch(() => {});
    }, []);

    // ── 데이터 로더 ─────────────────────────────────────────────
    const tryApi = async (pageToLoad: number) => {
        const res = await api.get("/community/posts/search", {
            params: {
                keyword: q || undefined,
                page: pageToLoad,
                size,
                sort,
                category,
                freeType: freeTypeParam || undefined,
                hashtagIds: hashtagIdsParam || undefined, // 서버는 ID 기준
            },
        });
        const data: Paged<PostListItem> | undefined = res?.data?.data;
        if (!data || !Array.isArray(data.items)) throw new Error("no data");
        return data;
    };

    const loadMore = async (explicitPage?: number) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        const nextReqId = ++reqIdRef.current;
        const pageToLoad = explicitPage ?? page;

        try {
            const data = await tryApi(pageToLoad);
            if (nextReqId !== reqIdRef.current) return;

            const next = data.items.map((it) => ({ ...it, excerpt: makeExcerpt(it) }));

            // ✅ AND FILTER 보정
            const matches = buildLocalMatcher({
                category,
                freeTypeParam,
                industriesParam,
                hashtagsParam,
            });
            const filtered = next.filter(matches);

            setItems((prev) => (pageToLoad === 1 ? filtered : [...prev, ...filtered]));
            setTotal(data.total); // 서버 total 사용
            setPage(pageToLoad + 1);
        } catch (e) {
            console.warn("[SearchResults] fetch failed:", e);
            // ✅ 목업/대체 데이터 사용 금지: 실제 결과 없으면 빈 상태로 둔다
            if (pageToLoad === 1) {
                setItems([]);
                setTotal(0);
            }
            setPage(pageToLoad + 1);
        } finally {
            loadingRef.current = false;
            if (pageToLoad === 1) setInitialized(true);
        }
    };

    // 파라미터 바뀌면 1페이지부터 즉시 재조회
    useEffect(() => {
        setItems([]);
        setTotal(0);
        setPage(1);
        setInitialized(false);
        loadMore(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, sort, category, freeTypeParam, hashtagIdsParam]);

    const hasMore = items.length < total;
    const { sentinelRef } = useInfiniteScroll(loadMore, hasMore, [
        q,
        sort,
        category,
        freeTypeParam,
        hashtagIdsParam,
        page,
        items.length,
        total,
    ]);

    /** 상단 칩(표시용 텍스트로만 구성) */
    const headerChips = useMemo(() => {
        const chips: string[] = [];
        const catLabel =
            category === "CASE" ? "승인사례" : category === "FREE" ? "자유게시판" : "전체";
        chips.push(catLabel);
        if (industriesParam) chips.push(...industriesParam.split(",").map((s) => `#${s}`));
        if (freeTypeParam) {
            const map: { [k in FreeType]: string } = {
                TIP: "마케팅팁",
                QUESTION: "질문",
                PROMO: "홍보",
                OTHER: "기타",
            };
            chips.push(...freeTypeParam.split(",").map((t) => `#${map[t as FreeType] || t}`));
        }
        if (hashtagsParam) chips.push(...hashtagsParam.split(",").map((s) => `#${s}`));
        if (q) chips.push(`“${q}”`);
        return Array.from(new Set(chips));
    }, [q, category, industriesParam, freeTypeParam, hashtagsParam]);

    const showEmpty = initialized && items.length === 0;

    return (
        <div className="container-mobile py-6 space-y-4">
            {/* 상단: 선택 칩(스와이프) + 필터 */}
            <div className="flex items-center gap-2">
                <div className="flex-1 overflow-x-auto no-scrollbar pr-2">
                    <div className="flex items-center gap-2 min-h-[28px]">
                        {headerChips.length ? (
                            headerChips.map((t, idx) => (
                                <span key={idx} className="chip-selected whitespace-nowrap">
                  {t}
                </span>
                            ))
                        ) : (
                            <h1 className="text-lg font-bold whitespace-nowrap">검색 결과</h1>
                        )}
                    </div>
                </div>
                <button
                    className="btn-ghost shrink-0"
                    onClick={() => setOpen(true)}
                    aria-label="필터 열기"
                >
                    <SlidersHorizontal className="w-6 h-6" />
                </button>
            </div>

            {/* 결과 리스트 또는 빈 상태 */}
            {showEmpty ? (
                <EmptyState onOpenFilter={() => setOpen(true)} onResetFilters={resetFilters} q={q} />
            ) : (
                <div className="grid gap-3">{items.map((p) => <PostCard key={p.id} item={p} />)}</div>
            )}

            {/* infinite sentinel */}
            {!showEmpty && <div ref={sentinelRef} className="h-10" />}

            {/* 필터 바텀시트 */}
            {open && (
                <FilterSheet
                    catalog={{
                        sectors: sectorTags.map((h) => h.name),
                        generics: genericTags.map((h) => h.name),
                    }}
                    initial={{
                        category,
                        freeType: freeTypeParam ? (freeTypeParam.split(",") as FreeType[]) : [],
                        industries: industriesParam ? industriesParam.split(",") : [],
                        sort,
                        hashtags: hashtagsParam ? hashtagsParam.split(",") : [],
                    }}
                    onClose={() => setOpen(false)}
                    onApply={({ category: c, freeType, industries, sort: s, hashtags }) => {
                        console.groupCollapsed("%c[FilterApply] selections", "color:#0EA5E9;font-weight:600");
                        console.log("category:", c);
                        console.log("freeType:", freeType);
                        console.log("industries:", industries);
                        console.log("hashtags(selected):", hashtags);
                        console.groupEnd();

                        // 검색용 hashtagIds 계산(카테고리에 맞는 값만)
                        const effectiveIndustries = c === "CASE" ? industries : [];
                        const effectiveHashtags = hashtags;
                        const toIds = (names: string[]) =>
                            names
                                .map((n) => nameToId.get(n))
                                .filter((v): v is number => typeof v === "number");
                        const ids = Array.from(
                            new Set([...toIds(effectiveIndustries), ...toIds(effectiveHashtags)])
                        );

                        console.groupCollapsed("%c[FilterApply] computed params", "color:#10B981;font-weight:600");
                        console.log("effectiveIndustries:", effectiveIndustries);
                        console.log("effectiveHashtags:", effectiveHashtags);
                        console.log("→ hashtagIds (for API):", ids);
                        console.groupEnd();

                        // ✅ 모아서 한 번에 URL 갱신
                        setParams((next) => {
                            // category
                            if (c) next.set("category", c);
                            else next.delete("category");

                            // sort
                            next.set("sort", s);

                            // FREE / CASE 별 보조 필터
                            if (c === "FREE") {
                                next.delete("industries");
                                if (freeType.length) next.set("freeType", freeType.join(","));
                                else next.delete("freeType");
                            } else if (c === "CASE") {
                                next.delete("freeType");
                                if (industries.length) next.set("industries", industries.join(","));
                                else next.delete("industries");
                            } else {
                                next.delete("freeType");
                                next.delete("industries");
                            }

                            // 표시용 hashtags
                            if (hashtags.length) next.set("hashtags", hashtags.join(","));
                            else next.delete("hashtags");

                            // 검색용 hashtagIds
                            if (ids.length) next.set("hashtagIds", ids.join(","));
                            else next.delete("hashtagIds");
                        });

                        setOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                />
            )}
        </div>
    );
}

/* ── 빈 결과 UI ────────────────────────────────────────── */
function EmptyState({
                        onOpenFilter,
                        onResetFilters,
                        q,
                    }: {
    onOpenFilter: () => void;
    onResetFilters: () => void;
    q?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div
                className="w-16 h-16 rounded-full grid place-items-center shadow-inner"
                style={{ background: "var(--brand-surface,#DDE9FF)" }}
            >
        <span className="text-2xl" aria-hidden>
          🔍
        </span>
            </div>
            <div className="space-y-1">
                <div className="text-base font-semibold">조건에 맞는 글이 없어요</div>
                <div className="text-sm text-gray-500">
                    {q?.trim()
                        ? `‘${q.trim()}’ 검색어와 선택한 필터를 조금만 바꿔보세요.`
                        : "선택한 필터를 조정해서 다시 시도해보세요."}
                </div>
            </div>
            <div className="flex gap-2">
                <button className="btn btn-ghost" onClick={onResetFilters}>
                    필터 초기화
                </button>
                <button className="btn btn-primary" onClick={onOpenFilter}>
                    필터 수정하기
                </button>
            </div>
        </div>
    );
}

/* ── 필터 시트 (포털로 body에 마운트) ── */
function FilterSheet({
                         initial,
                         onClose,
                         onApply,
                         catalog,
                     }: {
    initial: {
        category?: PostCategory;
        freeType: FreeType[];
        industries: string[];
        sort: PostSort;
        hashtags: string[];
    };
    onClose: () => void;
    onApply: (v: {
        category?: PostCategory;
        freeType: FreeType[];
        industries: string[];
        sort: PostSort;
        hashtags: string[];
    }) => void;
    catalog: { sectors: string[]; generics: string[] };
}) {
    const [category, setCategory] = useState<PostCategory | undefined>(initial.category);
    const [freeType, setFreeType] = useState<FreeType[]>(initial.freeType);
    const [industries, setIndustries] = useState<string[]>(initial.industries);
    const [sort, setSort] = useState<PostSort>(initial.sort);
    const [hashtags, setHashtags] = useState<string[]>(initial.hashtags);

    const INDUSTRY_POOL = catalog.sectors ?? [];
    const FREETYPE_POOL: Array<["TIP" | "QUESTION" | "PROMO" | "OTHER", string]> = [
        ["TIP", "마케팅팁"],
        ["QUESTION", "질문"],
        ["PROMO", "홍보"],
        ["OTHER", "기타"],
    ];
    const TAG_POOL = catalog.generics ?? [];

    const toggle = (arr: string[], setter: (v: string[]) => void, name: string) => {
        const has = arr.includes(name);
        setter(has ? arr.filter((x) => x !== name) : [...arr, name]);
    };
    const toggleFree = (code: FreeType) =>
        setFreeType((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]));

    // 카테고리 바뀌면 반대측 필터 정리
    useEffect(() => {
        if (category === "FREE") setIndustries([]);
        else if (category === "CASE") setFreeType([]);
    }, [category]);

    // 바디 스크롤 잠금
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    return createPortal(
        <div className="community">
            <div
                className="fixed left-0 top-0 w-screen h-dvh bg-black/40 backdrop-blur-[1px] z-[10000]"
                onClick={onClose}
            />
            <div className="fixed inset-x-0 bottom-0 z-[10010] bg-white rounded-t-2xl p-4 space-y-4 shadow-[0_-8px_24px_rgba(0,0,0,0.15)]">
                <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-1" />
                <h2 className="text-base font-semibold">필터</h2>

                {/* 카테고리 */}
                <div className="space-y-2">
                    <div className="label">카테고리</div>
                    <div className="flex flex-wrap gap-2">
                        <Chip active={category === undefined} onClick={() => setCategory(undefined)}>
                            전체
                        </Chip>
                        <Chip active={category === "CASE"} onClick={() => setCategory("CASE")}>
                            승인사례
                        </Chip>
                        <Chip active={category === "FREE"} onClick={() => setCategory("FREE")}>
                            자유게시판
                        </Chip>
                    </div>
                </div>

                {/* 정렬 */}
                <div className="space-y-2">
                    <div className="label">정렬</div>
                    <div className="flex flex-wrap gap-2">
                        {(["LATEST", "POPULAR", "VIEWS", "BOOKMARKS", "LIKES"] as PostSort[]).map((s) => (
                            <Chip key={s} active={sort === s} onClick={() => setSort(s)}>
                                {s === "LATEST"
                                    ? "최신"
                                    : s === "POPULAR"
                                        ? "인기"
                                        : s === "VIEWS"
                                            ? "조회"
                                            : s === "BOOKMARKS"
                                                ? "북마크"
                                                : "좋아요"}
                            </Chip>
                        ))}
                    </div>
                </div>

                {category === "CASE" && (
                    <div className="space-y-2">
                        <div className="label">업종</div>
                        <div className="flex flex-wrap gap-2">
                            {INDUSTRY_POOL.map((n) => (
                                <button
                                    key={n}
                                    className={`chip-toggle ${industries.includes(n) ? "chip-toggle-active" : ""}`}
                                    onClick={() => toggle(industries, setIndustries, n)}
                                >
                                    #{n}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {category === "FREE" && (
                    <div className="space-y-2">
                        <div className="label">글 유형</div>
                        <div className="flex flex-wrap gap-2">
                            {FREETYPE_POOL.map(([code, label]) => (
                                <button
                                    key={code}
                                    className={`chip-toggle ${freeType.includes(code) ? "chip-toggle-active" : ""}`}
                                    onClick={() => toggleFree(code)}
                                >
                                    #{label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 해시태그(항상) */}
                <div className="space-y-2">
                    <div className="label">해시태그</div>
                    <div className="flex flex-wrap gap-2">
                        {TAG_POOL.map((t) => {
                            const active = hashtags.includes(t);
                            return (
                                <button
                                    key={t}
                                    className={`chip-toggle ${active ? "chip-toggle-active" : ""}`}
                                    onClick={() => toggle(hashtags, setHashtags, t)}
                                >
                                    #{t}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button className="btn btn-ghost flex-1" onClick={onClose}>
                        취소
                    </button>
                    <button
                        className="btn btn-primary flex-1"
                        onClick={() => {
                            console.groupCollapsed("%c[FilterSheet] apply clicked", "color:#6366F1;font-weight:600");
                            console.log("selected.hashtags:", hashtags);
                            console.log("selected.industries:", industries);
                            console.log("selected.freeType:", freeType);
                            console.log("selected.category:", category, "selected.sort:", sort);
                            console.groupEnd();

                            onApply({ category, freeType, industries, sort, hashtags });
                        }}
                    >
                        적용하기
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

function Chip({
                  active,
                  children,
                  onClick,
              }: {
    active?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <button onClick={onClick} className={`chip-toggle ${active ? "chip-toggle-active" : ""}`}>
            {children}
        </button>
    );
}
