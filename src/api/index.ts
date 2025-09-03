import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

// axios config에 _retry 커스텀 플래그를 쓰기 위한 타입 보강
declare module 'axios' {
  export interface InternalAxiosRequestConfig<D = any> {
    _retry?: boolean;
  }
}

// 환경 변수 (Vite/CRA 모두 대응)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  withCredentials: true, // HttpOnly 쿠키 자동 포함
});

// axios가 상태코드만으로 바로 throw하지 않도록 처리 (호출부에서 일관 처리)
instance.defaults.validateStatus = () => true;

// ===== 토큰 재발급 동시성 제어 =====
let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

const subscribeTokenRefresh = (cb: () => void) => {
  refreshSubscribers.push(cb);
};
const onRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

// ===== 요청 인터셉터 =====
instance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// ===== 응답 인터셉터 =====
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 404 → 커스텀 에러
    if (response.status === 404) {
      return Promise.reject({
        status: 404,
        message: '404: 페이지 없음',
        config: response.config,
        response,
      });
    }
    // 4xx/5xx → 통일된 형태로 리젝트
    if (response.status >= 400) {
      return Promise.reject({
        status: response.status,
        message: response.statusText,
        config: response.config,
        response,
      });
    }
    return response;
  },
  async (error: AxiosError & { status?: number }) => {
    const originalRequest = error.config!;
    const { logout } = useAuthStore.getState();

    const status =
      (error as any)?.status ??
      error?.response?.status ??
      (originalRequest as any)?.status;

    const data = error?.response?.data;
    const isAccessTokenExpired =
      status === 401 &&
      (data === 'ACCESS_TOKEN_EXPIRED' ||
        (typeof data === 'object' &&
          (data as any)?.code === 'ACCESS_TOKEN_EXPIRED'));

    // Access Token 만료 + 아직 재시도 안 함
    if (isAccessTokenExpired && !originalRequest._retry) {
      if (isRefreshing) {
        // 재발급 완료까지 대기 → 완료되면 원 요청 재시도
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(instance(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 전역 axios로 순수 POST (순환참조 방지)
        await axios.post('/api/auth/reissue', null, {
          baseURL: BASE_URL,
          withCredentials: true,
        });

        isRefreshing = false;
        onRefreshed();
        return instance(originalRequest);
      } catch (reissueError) {
        isRefreshing = false;
        try {
          await logout();
        } finally {
          // 훅 사용 불가한 컨텍스트 → 하드 리다이렉트
          window.location.assign('/auth/login');
        }
        return Promise.reject(reissueError);
      }
    }

    // 그 외 에러는 그대로 전달
    return Promise.reject(error);
  },
);

export default instance;
