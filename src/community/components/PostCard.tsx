import { Eye, Heart, Bookmark, MessageSquare } from "lucide-react";
import type { HashtagDto, PostListItem } from "../types/models";
import { useNavigate } from "react-router-dom";

function getSectorFromTags(tags: HashtagDto[]): string | undefined {
    return tags?.find(t=>t.tagType==="SECTOR")?.name;
}
function buildNickname(item: PostListItem){
    const sector = item.sectorName || getSectorFromTags(item.hashtags) || "업종";
    const email = item.authorEmail || "user@example.com";
    const prefix = email.split("@")[0] || "user";
    return `${sector}-${prefix}`;
}

export default function PostCard({item}:{item:PostListItem}){
    const nav = useNavigate();
    const date = new Date(item.createdAt).toISOString().slice(0,10);
    const sector = item.sectorName || getSectorFromTags(item.hashtags);

    const topChip =
        item.category === "FREE"
            ? (item.freeType === "TIP" ? {label:"마케팅 팁", cls:"chip-posttype"}
                : item.freeType === "PROMO" ? {label:"홍보", cls:"chip-posttype"}
                    : item.freeType === "QUESTION" ? {label:"질문", cls:"chip-posttype"}
                        : {label:"기타", cls:"chip-posttype"})
            : {label:(sector ?? "대출 승인 사례"), cls: "chip-sector"};

    const nickname = buildNickname(item);

    return (
        <button
            className="card p-4 space-y-2 text-left w-full hover:shadow-[0_8px_22px_rgba(0,0,0,0.08)] transition-shadow"
            onClick={()=>nav(`/community/posts/${item.id}`)}
        >
            <div className="flex items-center justify-between">
                <span className={`chip ${topChip.cls}`}>{topChip.label}</span>
                <span className="text-xs text-gray-500">{date}</span>
            </div>

            <div className="grid grid-cols-[1fr_88px] gap-3 items-start">
                <div>
                    <div className="text-[16px] font-semibold leading-6 line-clamp-2">
                        {item.title}
                    </div>
                    {item.excerpt && (
                        <div className="mt-1 text-xs text-gray-600 leading-5 line-clamp-1" title={item.excerpt}>
                            {item.excerpt}
                        </div>
                    )}
                </div>
                {item.thumbnailUrl && (
                    <img
                        src={item.thumbnailUrl}
                        alt=""
                        className="w-[88px] h-[66px] object-cover rounded-lg border border-gray-100"
                        loading="lazy"
                    />
                )}
            </div>

            <div className="flex flex-wrap gap-1.5">
                {item.hashtags?.map(h=>(
                    <span
                        key={`${h.id}-${h.name}`}
                        className={
                            "chip " +
                            (h.tagType === "SECTOR" ? "chip-sector" :
                                h.tagType === "POST_TYPE" ? "chip-posttype" : "chip-generic")
                        }
                    >
            #{h.name}
          </span>
                ))}
            </div>

            <div className="mt-1 text-[12px] text-gray-600 flex items-center justify-between">
                <span className="font-medium text-gray-700">{nickname}</span>
                <div className="flex items-center gap-4">
                    {item.category==='CASE' ? (
                        <span className="inline-flex items-center gap-1"><Bookmark className="w-4 h-4"/>{item.bookmarkCount ?? 0}</span>
                    ) : (
                        <span className="inline-flex items-center gap-1"><Heart className="w-4 h-4"/>{item.likeCount ?? 0}</span>
                    )}
                    <span className="inline-flex items-center gap-1"><MessageSquare className="w-4 h-4"/>{item.commentCount ?? 0}</span>
                    <span className="inline-flex items-center gap-1"><Eye className="w-4 h-4"/>{item.viewCount ?? 0}</span>
                </div>
            </div>
        </button>
    );
}
