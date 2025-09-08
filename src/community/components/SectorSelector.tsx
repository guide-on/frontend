import { useEffect, useState } from "react";
import type { HashtagDto } from "../types/models";
import { api } from "../utils/api";

const FALLBACK: HashtagDto[] = [
    { id:-1, name:"요식업", tagType:"SECTOR" },
    { id:-2, name:"미용",   tagType:"SECTOR" },
    { id:-3, name:"의류",   tagType:"SECTOR" },
    { id:-4, name:"소매업", tagType:"SECTOR" },
    { id:-5, name:"서비스업", tagType:"SECTOR" },
];

export default function SectorSelector({
                                           selected, onChange
                                       }:{ selected: HashtagDto[]; onChange:(tags:HashtagDto[])=>void; }){
    const [options, setOptions] = useState<HashtagDto[]>(FALLBACK);

    useEffect(()=>{
        // 백엔드가 있으면 /community/hashtags?type=SECTOR에서 받아오고, 실패 시 FALLBACK
        api.get("/community/hashtags",{params:{type:"SECTOR"}})
            .then(res=>{
                const arr: HashtagDto[] = res.data?.data;
                if (Array.isArray(arr) && arr.length) setOptions(arr);
            })
            .catch(()=>{ /* fallback 유지 */ });
    },[]);

    const toggle = (opt:HashtagDto)=>{
        const exists = selected.find(s=>s.name===opt.name || s.id===opt.id);
        if (exists) onChange(selected.filter(s=>(s.name!==opt.name && s.id!==opt.id)));
        else onChange([...selected, opt]);
    };

    return (
        <div>
            <div className="label mb-1">업종 선택</div>
            <div className="card p-3 flex flex-wrap gap-2">
                {options.map(o=>{
                    const active = !!selected.find(s=>s.name===o.name || s.id===o.id);
                    return (
                        <button
                            key={`${o.id}-${o.name}`}
                            type="button"
                            onClick={()=>toggle(o)}
                            className={`chip ${active?'chip-blue':'chip-gray'}`}
                        >
                            #{o.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
