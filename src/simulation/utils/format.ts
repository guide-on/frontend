export const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString();

export const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
