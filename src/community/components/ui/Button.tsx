import type {ButtonHTMLAttributes} from "react";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary"|"outline" };
export default function Button({variant="primary", className="", ...props}: Props) {
    const v = variant==="primary" ? "btn btn-primary" : variant==="secondary" ? "btn btn-secondary" : "btn btn-outline";
    return <button {...props} className={`${v} ${className}`} />;
}
