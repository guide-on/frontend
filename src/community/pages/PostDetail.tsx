import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import type { PostDetail, CommentItem } from '../types/models';
import {
  Eye,
  Heart,
  Bookmark,
  MessageSquare,
  MoreVertical,
} from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/** 서버 토글 응답 타입 */
type ToggleLikeRes = { postId: number; liked: boolean };
type ToggleBookmarkRes = { postId: number; bookmarked: boolean };

/** 상대 시간 간단 포맷 */
function fromNow(iso?: string | number | Date) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s 전`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return d.toISOString().slice(0, 10);
}

/** 외부 클릭/Escape로 닫는 훅 */
function useOutsideClose<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  return ref;
}

/** 공통 확인 모달 */
function ConfirmModal(props: {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const {
    open,
    title = '삭제 확인',
    message = '정말로 이 게시글을 삭제하시겠습니까?',
    confirmText = '삭제',
    cancelText = '취소',
    onConfirm,
    onClose,
  } = props;
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-80 rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-lg bg-gray-200 px-3 py-2 hover:bg-gray-300"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [data, setData] = useState<PostDetail | null>(null);
  const [comment, setComment] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState<'like' | 'bookmark' | null>(null);

  // 서버가 liked/bookmarked 초기값을 주지 않으므로 로컬 상태로만 관리
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const cardRef = useOutsideClose<HTMLDivElement>(() => setMenuOpen(false));

  const load = async () => {
    try {
      const r = await api.get(`/community/posts/${id}`);
      const body: PostDetail = r.data.data;
      setData(body);
      // 서버에서 초기 liked/bookmarked를 주지 않는 모델이므로 기본 false 유지
    } catch (e) {
      // eslint-disable-next-line no-console
      console.debug('🔻 load detail failed:', e);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const onLikeToggle = async () => {
    if (!data || busy) return;
    try {
      setBusy('like');
      const r = await api.post(`/community/posts/${id}/like/toggle`);
      const next = (r.data?.data as ToggleLikeRes | undefined)?.liked ?? !liked;

      setLiked(next);
      setData((prev) => {
        if (!prev) return prev;
        const diff = next ? 1 : -1;
        return {
          ...prev,
          likeCount: Math.max(0, (prev.likeCount ?? 0) + diff),
        };
      });
    } catch (e) {
      console.debug('🔻 like toggle failed:', e);
    } finally {
      setBusy(null);
    }
  };

  const onBookmarkToggle = async () => {
    if (!data || busy) return;
    try {
      setBusy('bookmark');
      const r = await api.post(`/community/posts/${id}/bookmark/toggle`);
      const next =
        (r.data?.data as ToggleBookmarkRes | undefined)?.bookmarked ??
        !bookmarked;

      setBookmarked(next);
      setData((prev) => {
        if (!prev) return prev;
        const diff = next ? 1 : -1;
        return {
          ...prev,
          bookmarkCount: Math.max(0, (prev.bookmarkCount ?? 0) + diff),
        };
      });
    } catch (e) {
      console.debug('🔻 bookmark toggle failed:', e);
    } finally {
      setBusy(null);
    }
  };

  const onDelete = async () => {
    try {
      await api.delete(`/community/posts/${id}`);
      nav('/community');
    } catch (e) {
      console.debug('🔻 delete failed:', e);
    }
  };

  const createComment = async () => {
    if (!comment.trim()) return;
    try {
      await api.post(`/community/posts/${id}/comments`, { content: comment });
      setComment('');
      await load(); // 댓글 작성 후 재조회
    } catch (e) {
      console.debug('🔻 create comment failed:', e);
    }
  };

  if (!data)
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner type="dots" color="#25437B" />
      </div>
    );

  const dateText = new Date(data.createdAt).toISOString().slice(0, 10);
  const images = data.images ?? [];
  const isFree = data.category === 'FREE';

  const counterCls = 'flex items-center gap-1 select-none';
  const activeCls = 'text-[color:var(--brand-primary)]';
  const iconSize = 'w-4 h-4';

  return (
    <div className="space-y-4 pb-4 pt-4">
      <div className="card relative p-4" ref={cardRef}>
        {/* 상단 헤더 : 좌측 카테고리칩 / 우측 닉네임 · 날짜 · 메뉴 */}
        <div className="flex items-center justify-between">
          <span className="chip chip-blue">
            {isFree ? data.freeType || '자유' : '승인 사례'}
          </span>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            {/* 글 작성자 닉네임 (백엔드: PostDetailResponse.nickname) */}
            <span className="max-w-[140px] truncate font-medium text-gray-700">
              {data.nickname || '익명'}
            </span>
            <span>· {dateText}</span>
            <button
              className="btn-ghost -m-1 p-1"
              aria-label="더보기"
              onClick={() => setMenuOpen((s) => !s)}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 드롭다운(날짜를 가리지 않도록 아래로) */}
        {menuOpen && (
          <div className="absolute right-2 top-12 z-10 w-28 overflow-hidden rounded-xl border bg-white shadow-lg">
            <Link
              to={`/community/posts/${data.id}/edit`}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              수정
            </Link>
            <button
              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
              onClick={() => {
                setMenuOpen(false);
                setDeleteOpen(true);
              }}
            >
              삭제
            </button>
          </div>
        )}

        {/* 제목 */}
        <h1 className="mt-2 text-lg font-bold">{data.title}</h1>

        {/* 해시태그 */}
        <div className="mt-2 flex flex-wrap gap-2">
          {data.hashtags.map((h) => (
            <span key={h.id} className="chip chip-gray">
              #{h.name}
            </span>
          ))}
        </div>

        {/* 이미지 그리드 */}
        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                className="h-36 w-full rounded-xl border object-cover"
              />
            ))}
          </div>
        )}

        {/* 본문 */}
        <div className="mt-4 whitespace-pre-wrap text-[15px] leading-6">
          {data.content}
        </div>

        {/* 하단 카운터/토글 줄 - 우측 정렬 */}
        <div className="mt-4 flex items-center justify-end gap-4 text-[12px] text-gray-500">
          <span className={counterCls} title="조회수">
            <Eye className={iconSize} />
            {data.viewCount}
          </span>
          <span className={counterCls} title="댓글">
            <MessageSquare className={iconSize} />
            {data.commentCount}
          </span>

          {isFree ? (
            <button
              className={`${counterCls} ${liked ? activeCls : ''} disabled:opacity-60`}
              onClick={onLikeToggle}
              disabled={busy === 'like'}
              aria-label={liked ? '좋아요 취소' : '좋아요'}
              title={liked ? '좋아요 취소' : '좋아요'}
            >
              <Heart
                className={iconSize}
                fill={liked ? 'currentColor' : 'none'}
              />
              {data.likeCount}
            </button>
          ) : (
            <button
              className={`${counterCls} ${bookmarked ? activeCls : ''} disabled:opacity-60`}
              onClick={onBookmarkToggle}
              disabled={busy === 'bookmark'}
              aria-label={bookmarked ? '북마크 취소' : '북마크'}
              title={bookmarked ? '북마크 취소' : '북마크'}
            >
              <Bookmark
                className={iconSize}
                fill={bookmarked ? 'currentColor' : 'none'}
              />
              {data.bookmarkCount}
            </button>
          )}
        </div>
      </div>

      {/* 댓글 */}
      <div className="card p-4">
        <h3 className="mb-2 text-base font-semibold">댓글</h3>
        <div className="space-y-3">
          {data.comments?.map((c) => (
            <CommentItemView
              key={c.id}
              c={c}
              postId={data.id}
              postAuthorId={data.memberId}
              reload={load}
            />
          ))}
        </div>

        {/* 입력 */}
        <div className="mt-3 flex gap-2">
          <input
            className="input"
            placeholder="댓글을 입력하세요"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button onClick={createComment}>등록</Button>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDelete}
      />
    </div>
  );
}

function CommentItemView(props: {
  c: CommentItem;
  postId: number;
  postAuthorId: number;
  reload: () => Promise<void>;
}) {
  const { c, postId, postAuthorId, reload } = props;
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(c.content);
  const children = c.children ?? [];

  const nickname = c.nickname || '익명';
  const isAuthor = c.memberId === postAuthorId;

  const save = async () => {
    try {
      await api.put(`/community/comments/${c.id}`, { content: val });
      setEditing(false);
      await reload();
    } catch (e) {
      console.debug('🔻 update comment failed:', e);
    }
  };

  const remove = async () => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      await api.delete(`/community/comments/${c.id}`);
      await reload();
    } catch (e) {
      console.debug('🔻 delete comment failed:', e);
    }
  };

  const reply = async () => {
    const text = prompt('대댓글');
    if (!text) return;
    try {
      await api.post(`/community/posts/${postId}/comments`, {
        parentCommentId: c.id,
        content: text,
      });
      await reload();
    } catch (e) {
      console.debug('🔻 reply failed:', e);
    }
  };

  return (
    <div className="rounded-xl border p-3">
      {/* 헤더: 닉네임 · 시간 · (작성자 배지) */}
      <div className="mb-1 flex items-center gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-200" aria-hidden />{' '}
          {/* 아바타 자리 */}
          <span className="font-medium">{nickname}</span>
          {isAuthor && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
              작성자
            </span>
          )}
        </div>
        <span className="ml-1 text-xs text-gray-500">
          · {fromNow(c.createdAt)}
        </span>
      </div>

      {/* 본문 / 편집 */}
      {editing ? (
        <div className="space-y-2">
          <textarea
            className="textarea"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={save}>저장</Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              취소
            </Button>
          </div>
        </div>
      ) : (
        <div className="whitespace-pre-wrap text-[15px] leading-6">
          {c.content}
        </div>
      )}

      {/* 액션 줄: 수정 · 삭제 · 답글 */}
      <div className="mt-2 flex gap-4 text-sm text-gray-600">
        {!editing && <button onClick={() => setEditing(true)}>수정</button>}
        <button onClick={remove}>삭제</button>
        <button onClick={reply}>답글</button>
      </div>

      {/* 대댓글 */}
      {children.length > 0 && (
        <div className="mt-3 space-y-3 border-l pl-3">
          {children.map((ch) => (
            <CommentItemView
              key={ch.id}
              c={ch}
              postId={postId}
              postAuthorId={postAuthorId}
              reload={props.reload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
