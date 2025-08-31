import api from '@/api';

export type MemberCreatePayload = {
  email: string;
  password: string;
  name: string;
  phone: string;
  gender?: 'MALE' | 'FEMALE';
  birth: string; // yyyy-MM-dd
};

export type FindUserIdResponse = {
  email: string; // 예: "user@example.com"
  regDate: string; // 예: "2025-01-01"
  provider: 'LOCAL' | 'KAKAO' | string;
};

/** 소셜 로그인 공급자 */
export type OAuthProvider = 'kakao' | 'naver' | (string & {});

/** 서버 응답 타입(필요 시 실제 스키마에 맞게 교체) */
export type UsernameExistResponse =
  | boolean
  | { exists: boolean; message?: string };
export type CreateMemberResponse = unknown;
export type SocialLoginResponse = unknown;
export type ResetPasswordResponse = unknown;

/** 요청 페이로드 타입(백엔드 스키마에 맞게 확정되면 구체화하세요) */
export type FindUserIdPayload = Record<string, unknown>;
export type ResetPasswordPayload = Record<string, unknown>;

const BASE_URL = '/api/member';

export const memberApi = {
  /**
   * 아이디(이메일) 중복 체크
   * - 서버가 boolean을 주거나 { exists: boolean } 형태를 준다고 가정
   * - true: 중복(사용불가), false: 사용가능
   */
  async checkUsername(email: string): Promise<UsernameExistResponse> {
    const { data } = await api.get<UsernameExistResponse>(
      `${BASE_URL}/exist/email/${encodeURIComponent(email)}`,
    );
    return data;
  },

  /**
   * 회원 가입
   * - 파일 업로드가 포함될 수 있어 FormData 권장
   * - axios는 FormData를 넘기면 boundary 포함한 Content-Type을 자동 설정합니다.
   *   (직접 'multipart/form-data'를 지정하면 boundary 누락 문제 발생 가능)
   */
  async create(payload: MemberCreatePayload): Promise<CreateMemberResponse> {
    const { data } = await api.post<CreateMemberResponse>(BASE_URL, payload);
    return data;
  },

  /**
   * 소셜 로그인 (인가코드 교환)
   */
  async socialLogin(
    provider: OAuthProvider,
    code: string,
  ): Promise<SocialLoginResponse> {
    const { data } = await api.get<SocialLoginResponse>(
      `/api/oauth/${String(provider).toLowerCase()}/login`,
      { params: { code } },
    );
    return data;
  },

  /**
   * 아이디(이메일) 찾기
   */
  async findUserId(form: FindUserIdPayload): Promise<FindUserIdResponse> {
    const { data } = await api.post<FindUserIdResponse>(
      `${BASE_URL}/find/email`,
      form,
    );
    return data;
  },

  /**
   * 비밀번호 재설정
   */
  async resetPassword(
    form: ResetPasswordPayload,
  ): Promise<ResetPasswordResponse> {
    const { data } = await api.post<ResetPasswordResponse>(
      `${BASE_URL}/password/reset`,
      form,
    );
    return data;
  },
};

export default memberApi;
