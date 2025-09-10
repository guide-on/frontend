import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Card from "../components/ui/Card";
import ImageUploader from "../components/ImageUploader";
import HashtagPicker from "../components/HashtagPicker";
import SectorSelector from "../components/SectorSelector";
import { api } from "../utils/api";
import { useNavigate, useParams } from "react-router-dom";
import type { PostDetail, FreeType, HashtagDto, HashtagType } from "../types/models";
import LoadingSpinner from "../../components/common/LoadingSpinner";

type UpdatePostPayload = {
    title: string;
    content: string;
    thumbnailUrl?: string;
    imageUrls?: string[];
    freeType?: FreeType;
    hashtagIds?: number[];
    hashtagNames?: string[];
};

export default function PostEdit(){
    const { id } = useParams();
    const [detail,setDetail]=useState<PostDetail|null>(null);
    const [title,setTitle]=useState(""); const [content,setContent]=useState("");
    const [thumbnailUrl,setThumbnailUrl]=useState(""); const [images,setImages]=useState<string[]>([]);
    const [freeType,setFreeType]=useState<FreeType|undefined>(undefined);
    const [sectorTags,setSectorTags]=useState<HashtagDto[]>([]);
    const [etcTags,setEtcTags]=useState<HashtagDto[]>([]);
    const nav = useNavigate();

    const load = async ()=>{
        const res = await api.get(`/community/posts/${id}`);
        const d: PostDetail = res.data.data;
        setDetail(d);
        setTitle(d.title);
        setContent(d.content);
        setThumbnailUrl(d.thumbnailUrl ?? "");
        setImages(d.images ?? []);
        setFreeType(d.freeType ?? undefined);
        setSectorTags(d.hashtags.filter(h=>h.tagType==='SECTOR'));
        setEtcTags(d.hashtags.filter(h=>h.tagType!=='SECTOR'));
    };

    useEffect(()=>{ load().catch(()=>{}); },[id]);

    const submit = async ()=>{
        const ids = [...sectorTags, ...etcTags].filter(t => (t.id ?? 0) > 0).map(t => t.id as number);
        const names = [...sectorTags, ...etcTags].filter(t => (t.id ?? 0) <= 0).map(t => t.name);

        const body: UpdatePostPayload = {
            title,
            content,
            imageUrls: images.length ? images : undefined,
            thumbnailUrl: thumbnailUrl || undefined,
        };
        if (detail?.category === 'FREE') body.freeType = freeType || 'OTHER';
        if (ids.length) body.hashtagIds = ids;
        if (names.length) body.hashtagNames = names;

        await api.put(`/community/posts/${id}`, body);
        nav(`/community/posts/${id}`);
    };

    if (!detail) return <div className="container-mobile py-8 flex justify-center"><LoadingSpinner type="dots" color="#25437B" /></div>;

    const allowedEtc:HashtagType[] = detail.category==='CASE' ? ["GENERIC"] : ["POST_TYPE","GENERIC"];

    return (
        <div className="space-y-4">
            {/*<h1 className="text-lg font-bold text-center mt-2">글 수정</h1>*/}
            <Card className="p-4 space-y-4">
                {detail.category==='FREE' && (
                    <div className="flex gap-2">
                        {(["QUESTION","PROMO","TIP","OTHER"] as FreeType[]).map(t=>(
                            <Button key={t} variant={freeType===t?'secondary':'outline'} onClick={()=>setFreeType(t)}>
                                {t==='QUESTION'?'질문':t==='PROMO'?'홍보':t==='TIP'?'마케팅 팁':'기타'}
                            </Button>
                        ))}
                    </div>
                )}
                <div><div className="label mb-1">글 제목</div><Input value={title} onChange={e=>setTitle(e.target.value)} /></div>
                <div><div className="label mb-1">내용</div><Textarea value={content} onChange={e=>setContent(e.target.value)} /></div>
                <div><div className="label mb-1">썸네일 URL</div><Input value={thumbnailUrl} onChange={e=>setThumbnailUrl(e.target.value)} /></div>
                <div>
                    <div className="label mb-1">사진 첨부</div>
                    <ImageUploader onUploaded={(urls)=>setImages(prev=>[...prev,...urls])}/>
                    {images.length>0 && <div className="mt-2 grid grid-cols-3 gap-2">{images.map((src,i)=>(<img key={i} src={src} className="rounded-xl border object-cover w-full h-24"/>))}</div>}
                </div>
                {detail.category==='CASE' && (<SectorSelector selected={sectorTags} onChange={setSectorTags}/>)}
                <HashtagPicker value={etcTags} onChange={setEtcTags} allowed={allowedEtc}/>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={()=>history.back()}>취소</Button>
                    <Button onClick={submit}>수정하기</Button>
                </div>
            </Card>
        </div>
    );
}
