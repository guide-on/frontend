import axios, { AxiosError, type AxiosResponse } from 'axios';

/** snake_case → camelCase 변환 (깊은 순회) */
function toCamel<T = any>(input: any): T {
    if (Array.isArray(input)) return input.map(toCamel) as any;
    if (input && typeof input === 'object') {
        const out: any = {};
        Object.keys(input).forEach((k) => {
            const ck = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
            out[ck] = toCamel((input as any)[k]);
        });
        return out;
    }
    return input as T;
}

/** 401 알림용 커스텀 이벤트 */
export const AUTH_REQUIRED_EVENT = 'auth:required';
export function dispatchAuthRequired() {
    window.dispatchEvent(new CustomEvent(AUTH_REQUIRED_EVENT));
}

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    withCredentials: true,
});

// 응답 데이터 camelCase 변환
api.interceptors.response.use(
    (r: AxiosResponse) => {
        if (r?.data) r.data = toCamel(r.data);
        return r;
    },
    (err: AxiosError) => {
        const status = err.response?.status;
        if (status === 401) {
            dispatchAuthRequired();
            // 여기서 throw 유지: 호출부에서 필요하면 추가 처리 가능
        } else if (status === 403) {
            alert('권한이 없습니다.');
        }
        return Promise.reject(err);
    }
);
