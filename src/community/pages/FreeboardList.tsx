import { useEffect, useRef, useState } from 'react';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import type { FreeType, PostListItem, Paged, PostSort } from '../types/models';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function makeExcerpt(item: PostListItem, max = 80) {
  const raw = item.excerpt ?? item.contentPreview ?? '';
  if (!raw) return undefined;
  const t = raw.replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

export default function FreeboardList() {
  const [items, setItems] = useState<PostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<PostSort>('LATEST');
  const [freeType, setFreeType] = useState<FreeType | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const size = 10;
  const loadingRef = useRef(false);
  const bootstrappedRef = useRef(false);

  const hasMore = items.length < total;

  const loadMore = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setError(undefined);
    try {
      const res = await api.get('/community/posts', {
        params: { category: 'FREE', freeType, page, size, sort },
      });
      const data: Paged<PostListItem> = res.data.data;
      const next = data.items.map((it) => ({
        ...it,
        excerpt: makeExcerpt(it),
      }));
      setItems((p) => [...p, ...next]);
      setTotal(data.total);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.debug('🔻 FREE list load failed:', e);
      setError('목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setPage((p) => p + 1);
      loadingRef.current = false;
    }
  };

  // 정렬/필터 변경 시 초기화
  useEffect(() => {
    setItems([]);
    setTotal(0);
    setPage(1);
    setError(undefined);
    bootstrappedRef.current = false;
  }, [sort, freeType]);

  // ✅ 진입/필터 변경 시 1페이지 부트스트랩 로드
  useEffect(() => {
    if (!bootstrappedRef.current && page === 1 && items.length === 0) {
      bootstrappedRef.current = true;
      void loadMore();
    }
  }, [page, items.length]);

  const { sentinelRef } = useInfiniteScroll(loadMore, hasMore, [
    sort,
    freeType,
    page,
    items.length,
    total,
  ]);

  return (
    <div className="space-y-3 pt-4">
      {/*<h1 className="text-lg font-bold text-center my-2">자유게시판</h1>*/}

      <div className="card p-3 flex flex-wrap gap-2">
        {(
          ['LATEST', 'POPULAR', 'VIEWS', 'BOOKMARKS', 'LIKES'] as PostSort[]
        ).map((s) => (
          <button
            key={s}
            className={`chip ${sort === s ? 'chip-blue' : 'chip-gray'}`}
            onClick={() => setSort(s)}
          >
            {s === 'LATEST'
              ? '최신'
              : s === 'POPULAR'
                ? '인기'
                : s === 'VIEWS'
                  ? '조회'
                  : s === 'BOOKMARKS'
                    ? '북마크'
                    : '좋아요'}
          </button>
        ))}
        <div className="w-full h-0" />
        {(['QUESTION', 'PROMO', 'TIP', 'OTHER'] as FreeType[]).map((t) => (
          <button
            key={t}
            className={`chip ${freeType === t ? 'chip-blue' : 'chip-gray'}`}
            onClick={() => setFreeType(freeType === t ? undefined : t)}
          >
            {t === 'QUESTION'
              ? '질문'
              : t === 'PROMO'
                ? '홍보'
                : t === 'TIP'
                  ? '마케팅팁'
                  : '기타'}
          </button>
        ))}
      </div>

      {error && <div className="card p-4 text-sm text-red-600">{error}</div>}
      {!error && items.length === 0 && total === 0 && (
        <div className="card p-4 text-sm text-gray-500">게시글이 없습니다.</div>
      )}

      <div className="grid gap-3">
        {items.map((p) => (
          <PostCard key={p.id} item={p} />
        ))}
      </div>

      {/* 무한 스크롤 로딩 표시 */}
      {hasMore && items.length > 0 && (
        <div className="py-4 flex justify-center">
          <LoadingSpinner type="dots" size="sm" color="#6b7280" />
        </div>
      )}

      <div ref={sentinelRef} className="h-10" />
    </div>
  );
}
