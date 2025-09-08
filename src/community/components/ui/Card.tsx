import type {PropsWithChildren} from "react";
export default function Card({children, className=""}: PropsWithChildren<{className?:string}>) {
    return <div className={`card ${className}`}>{children}</div>;
}
