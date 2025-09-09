// src/community/pages/PostCreate.tsx
import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Card from "../components/ui/Card";
import ImageUploader from "../components/ImageUploader";
import HashtagPicker from "../components/HashtagPicker";
import SectorSelector from "../components/SectorSelector";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";
import type { PostCategory, FreeType, HashtagDto, HashtagType } from "../types/models";

// 🔐 추가
import AuthModal from "../components/auth/AuthModal";
import { AUTH_REQUIRED_EVENT } from "../utils/api";

type CreatePostPayload = {
    category: PostCategory;
    title: string;
    content: string;
    thumbnailUrl?: string;
    imageUrls?: string[];
    freeType?: FreeType;
    hashtagIds?: number[];
    hashtagNames?: string[];
};

export default function PostCreate() {
    const [category, setCategory] = useState<PostCategory>("CASE");
    const [freeType, setFreeType] = useState<FreeType | undefined>(undefined);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [sectorTags, setSectorTags] = useState<HashtagDto[]>([]);
    const [etcTags, setEtcTags] = useState<HashtagDto[]>([]);
    const nav = useNavigate();

    // 🔐 진입 시 인증 체크: 실패(401)면 AuthModal 오픈 이벤트 발행
    useEffect(() => {
        (async () => {
            try {
                // 👉 사용 중인 백엔드에 맞춰 엔드포인트만 필요시 바꿔줘
                // 예: /auth/me, /users/me, /community/auth/check 등
                await api.get("/auth/me");
            } catch (err: any) {
                const status = err?.response?.status;
                if (status === 401) {
                    window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
                }
            }
        })();
    }, []);

    const submit = async () => {
        try {
            // 해시태그 ID/이름 분리
            const ids = [...sectorTags, ...etcTags]
                .filter((t) => (t.id ?? 0) > 0)
                .map((t) => t.id as number);
            const names = [...sectorTags, ...etcTags]
                .filter((t) => (t.id ?? 0) <= 0)
                .map((t) => t.name);

            const payload: CreatePostPayload = {
                category,
                title,
                content,
                imageUrls: images.length ? images : undefined,
                thumbnailUrl: images[0], // 첫 이미지로 썸네일 자동 지정
            };
            if (category === "FREE") payload.freeType = freeType || "OTHER";
            if (ids.length) payload.hashtagIds = ids;
            if (names.length) payload.hashtagNames = names;

            const res = await api.post("/community/posts", payload);
            const id = res.data?.data?.postId;
            nav(`/community/posts/${id}`);
        } catch (err: any) {
            const status = err?.response?.status;
            // 🔐 작성 시 인증 만료/비로그인(401)도 모달 오픈
            if (status === 401) {
                window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
                return;
            }
            // 다른 에러는 콘솔로 확인
            console.error("[PostCreate] submit failed:", err);
            alert("등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    };

    const allowedEtc: HashtagType[] = category === "CASE" ? ["GENERIC"] : ["POST_TYPE", "GENERIC"];

    return (
        <>
            {/* AuthModal은 포털로 body에 붙으므로 페이지 어디서 렌더해도 전역 표시됨 */}
            <AuthModal />

            <div className="space-y-4">
                <Card className="p-4 space-y-4">
                    {/* 카테고리 선택 */}
                    <div>
                        <div className="label mb-1">카테고리</div>
                        <select
                            className="input"
                            value={category}
                            onChange={(e) => {
                                const v = e.target.value as PostCategory;
                                setCategory(v);
                                if (v === "CASE") {
                                    setFreeType(undefined);
                                } else {
                                    setSectorTags([]);
                                }
                            }}
                        >
                            <option value="CASE">동일업종 승인 사례</option>
                            <option value="FREE">자유게시판</option>
                        </select>
                    </div>

                    {/* 자유게시판 종류 */}
                    {category === "FREE" && (
                        <div className="flex gap-2">
                            {(["QUESTION", "PROMO", "TIP", "OTHER"] as FreeType[]).map((t) => (
                                <Button
                                    key={t}
                                    variant={freeType === t ? "secondary" : "outline"}
                                    onClick={() => setFreeType(t)}
                                >
                                    {t === "QUESTION" ? "질문" : t === "PROMO" ? "홍보" : t === "TIP" ? "마케팅 팁" : "기타"}
                                </Button>
                            ))}
                        </div>
                    )}

                    <div>
                        <div className="label mb-1">글 제목</div>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" />
                    </div>

                    <div>
                        <div className="label mb-1">내용</div>
                        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" />
                    </div>

                    <div>
                        <div className="label mb-1">사진 첨부</div>
                        <ImageUploader onUploaded={(urls) => setImages((prev) => [...prev, ...urls])} />
                        {images.length > 0 && (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                                {images.map((src, i) => (
                                    <img key={i} src={src} className="rounded-xl border object-cover w-full h-24" />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 승인 사례일 때 업종 칩 노출 */}
                    {category === "CASE" && <SectorSelector selected={sectorTags} onChange={setSectorTags} />}

                    {/* 공통 해시태그(자동완성) */}
                    <HashtagPicker value={etcTags} onChange={setEtcTags} allowed={allowedEtc} />

                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => history.back()}>
                            취소
                        </Button>
                        <Button onClick={submit}>등록하기</Button>
                    </div>
                </Card>
            </div>
        </>
    );
}
