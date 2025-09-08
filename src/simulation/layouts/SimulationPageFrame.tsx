import type {ReactNode} from 'react';

export default function SimulationPageFrame({ children, title }: { children: ReactNode; title?: string }) {
    return (
        <div className="max-w-[420px] mx-auto p-4 pb-24">
            {title && <div className="text-lg font-bold mb-2">{title}</div>}
            {children}
        </div>
    );
}
