import { useEffect, useState } from "react";
import type { HashtagDto, HashtagType } from "../types/models";

import { api } from "../utils/api";
import { X } from "lucide-react";

type Props = {
    value: HashtagDto[];
    onChange: (tags: HashtagDto[]) => void;
    allowed?: HashtagType[]; // CASE: ["SECTOR","GENERIC"], FREE: ["POST_TYPE","GENERIC"]
};

export default function HashtagPicker({value, onChange, allowed}: Props) {
    const [q, setQ] = useState("");
    const [list, setList] = useState<HashtagDto[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const t = setTimeout(async () => {
            if (!q.trim()) { setList([]); return; }
            // 예상 백엔드: GET /api/community/hashtags?q=키워드
            try {
                const res = await api.get("/community/hashtags", { params:{ q } });
                let arr: HashtagDto[] = res.data?.data || [];
                if (allowed && allowed.length) arr = arr.filter(h => allowed.includes(h.tagType));
                // 이미 선택된 건 제거
                const ids = new Set(value.map(v=>v.id));
                setList(arr.filter(a=>!ids.has(a.id)).slice(0,20));
            } catch { /* 미구현시 조용히 무시 */ }
        }, 200); // 디바운스
        return () => clearTimeout(t);
    }, [q, allowed, value]);

    const add = (h: HashtagDto) => {
        onChange([...value, h]); setQ(""); setOpen(false);
    };
    const remove = (id: number) => onChange(value.filter(v=>v.id!==id));

    return (
        <div>
            <div className="label mb-1">해시태그</div>
            <div className="card p-3">
                <div className="flex flex-wrap gap-2 mb-2">
                    {value.map(v => (
                        <span key={v.id} className="chip">
              {v.name}
                            <button className="ml-1 text-gray-500" onClick={()=>remove(v.id)}><X className="w-4 h-4"/></button>
            </span>
                    ))}
                </div>
                <input
                    className="input"
                    value={q}
                    onChange={e=>{ setQ(e.target.value); setOpen(true); }}
                    placeholder="해시태그 검색 (예: 카페, 마케팅팁...)"
                />
                {open && list.length>0 && (
                    <div className="mt-2 border rounded-xl overflow-hidden bg-white max-h-64 overflow-y-auto">
                        {list.map(h => (
                            <button key={h.id} onClick={()=>add(h)} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex justify-between">
                                <span>{h.name}</span>
                                <span className="text-xs text-gray-500">{h.tagType}</span>
                            </button>
                        ))}
                    </div>
                )}
                {!list.length && q && <div className="mt-2 text-xs text-gray-500">검색 결과가 없습니다.</div>}
            </div>
        </div>
    );
}
