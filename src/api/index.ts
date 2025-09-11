import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { AUTH_REQUIRED_EVENT } from '@/community/utils/api'; // 🔸 커뮤니티에서 쓰던 이벤트 상수 재사용

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

// ===== 헬퍼 =====
function isAuthEndpoint(url?: string) {
  return !!url && url.includes('/api/auth/');
}
function isAccessTokenExpiredPayload(data: any) {
  return (
      data === 'ACCESS_TOKEN_EXPIRED' ||
      (typeof data === 'object' && data?.code === 'ACCESS_TOKEN_EXPIRED')
  );
}

// ===== 요청 인터셉터 =====
instance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error),
);

// ===== 응답 인터셉터 =====
instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const status = response.status;

      // 🔸 비로그인/권한없음 → 모달 이벤트 (재발급 케이스는 제외)
      if ((status === 401 || status === 403) && !isAuthEndpoint(response.config?.url)) {
        const data = response.data;
        const isExpired = status === 401 && isAccessTokenExpiredPayload(data);
        if (!isExpired) {
          window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
        }
      }

      // 404 → 커스텀 에러
      if (status === 404) {
        return Promise.reject({
          status: 404,
          message: '404: 페이지 없음',
          config: response.config,
          response,
        });
      }

      // 4xx/5xx → 통일된 형태로 리젝트
      if (status >= 400) {
        return Promise.reject({
          status,
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

      const url = (originalRequest as any)?.url as string | undefined;
      const data = error?.response?.data;

      const isExpired =
          status === 401 && isAccessTokenExpiredPayload(data);

      // 🔸 비로그인/권한없음 안전망 (재발급 케이스는 제외, /api/auth/* 제외)
      if ((status === 401 || status === 403) && !isExpired && !isAuthEndpoint(url)) {
        window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
      }

      // Access Token 만료 + 아직 재시도 안 함 → 재발급 처리
      if (isExpired && !originalRequest._retry) {
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
            // 🔸 재발급 실패 시 로그인 화면으로 이동 (여기서는 하드 리다이렉트 유지)
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
