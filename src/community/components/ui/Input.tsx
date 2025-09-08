import type {InputHTMLAttributes} from "react";
export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={`input ${props.className||""}`} />;
}
