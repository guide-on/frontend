import type {TextareaHTMLAttributes} from "react";
export default function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea {...props} className={`textarea ${props.className||""}`} />;
}
