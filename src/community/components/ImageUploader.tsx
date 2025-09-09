import { useRef, useState } from "react";
import Button from "./ui/Button";
import { ImagePlus, Loader2 } from "lucide-react";
import { api } from "../utils/api";

export default function ImageUploader({onUploaded}:{onUploaded:(urls:string[])=>void}) {
    const ref = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length===0) return;
        const form = new FormData();
        Array.from(files).forEach(f => form.append("files", f));
        setLoading(true);
        try {
            const res = await api.post("/community/uploads/images", form, { headers:{ "Content-Type":"multipart/form-data" }});
            const urls = res.data?.data?.urls || [];
            onUploaded(urls);
        } finally { setLoading(false); }
    };

    return (
        <div className="card p-3">
            <div className="flex items-center gap-2">
                <input type="file" accept="image/*" multiple hidden ref={ref} onChange={e=>handleFiles(e.target.files)} />
                <Button type="button" variant="outline" onClick={()=>ref.current?.click()}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <ImagePlus className="w-4 h-4 mr-2"/>}
                    이미지 업로드
                </Button>
                <div className="text-xs text-gray-500">여러 장 가능</div>
            </div>
        </div>
    );
}
