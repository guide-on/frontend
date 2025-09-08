export type PostCategory = "CASE" | "FREE";
export type FreeType = "QUESTION" | "PROMO" | "TIP" | "OTHER";
export type HashtagType = "SECTOR" | "POST_TYPE" | "GENERIC";
export type PostSort = "LATEST" | "POPULAR" | "VIEWS" | "BOOKMARKS" | "LIKES";

export interface HashtagDto {
    id: number;
    name: string;
    tagType: HashtagType;
    code?: string | null;
}

/** 서버 목록 항목과 1:1 대응. excerpt는 프런트에서 보조 생성 */
export interface PostListItem {
    id: number;
    category: PostCategory;
    freeType?: FreeType | null;
    title: string;
    /** 목록 응답 전용 미리보기 본문 */
    contentPreview?: string;      // ← 백엔드 목록 응답 필드명
    createdAt: string;
    hashtags: HashtagDto[];
    authorEmail?: string;
    sectorName?: string;
    thumbnailUrl?: string | null;
    /** 프런트가 contentPreview로 생성하는 짧은 요약 */
    excerpt?: string;
    viewCount: number;
    likeCount?: number;
    bookmarkCount?: number;
    commentCount: number;
}

export interface CommentItem {
    id: number;
    postId: number;
    memberId: number;
    parentCommentId?: number | null;
    content: string;
    depth: number;
    createdAt: string;
    nickname: string;
    children?: CommentItem[];
}

export interface PostDetail {
    id: number;
    memberId: number;
    category: PostCategory;
    freeType?: FreeType | null;
    title: string;
    nickname: string;
    content: string;
    images?: string[];
    thumbnailUrl?: string | null;
    hashtags: HashtagDto[];
    createdAt: string;
    viewCount: number;
    likeCount: number;
    bookmarkCount: number;
    commentCount: number;
    comments?: CommentItem[];
}


export interface Paged<T> {
    items: T[];
    page: number;
    size: number;
    total: number;
}
