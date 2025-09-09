import type {PropsWithChildren} from "react";
import { X } from "lucide-react";

type Props = PropsWithChildren<{ open: boolean; title?: string; onClose: ()=>void; }>;
export default function Modal({open, title, onClose, children}: Props) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="card w-full max-w-[360px] relative">
                    <button onClick={onClose} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                    {title && <div className="px-5 pt-5 text-base font-semibold">{title}</div>}
                    <div className="p-5 pt-4">{children}</div>
                </div>
            </div>
        </div>
    );
}
