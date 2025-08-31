import api from '@/api';

const BASE_URL = '/api/verification';

/** 서버 응답 타입 (실제 스펙에 맞게 고도화 필요) */
export type VerificationResponse = {
  success: boolean;
  message: string;
  [key: string]: any; // 서버가 추가로 보내는 데이터
};

export const verificationApi = {
  /** 이메일 인증번호 전송 */
  async sendEmail(
    email: string,
    isSignup: boolean = false,
  ): Promise<VerificationResponse> {
    const { data } = await api.post<VerificationResponse>(`${BASE_URL}/send`, {
      target: email,
      isEmail: true,
      isSignup,
    });
    return data;
  },

  /** 전화번호 인증번호 전송 */
  async sendSms(phone: string): Promise<VerificationResponse> {
    const { data } = await api.post<VerificationResponse>(`${BASE_URL}/send`, {
      target: phone,
      isEmail: false,
    });
    return data;
  },

  /** 인증번호 검증 */
  async verify(
    target: string,
    code: string,
    isEmail: boolean,
  ): Promise<VerificationResponse> {
    const { data } = await api.post<VerificationResponse>(
      `${BASE_URL}/verify`,
      {
        target,
        code,
        isEmail,
      },
    );
    return data;
  },

  /** 비밀번호 재설정용 인증번호 전송 (이메일 기반) */
  async send(email: string, isEmail: boolean): Promise<VerificationResponse> {
    const { data } = await api.post<VerificationResponse>(
      `${BASE_URL}/code/reset-password`,
      {
        target: email,
        isEmail,
      },
    );
    return data;
  },

  /** 비밀번호 재설정용 인증번호 검증 (이메일 기반) */
  async verifyByEmail(
    email: string,
    code: string,
    isEmail: boolean,
  ): Promise<VerificationResponse> {
    const { data } = await api.post<VerificationResponse>(
      `${BASE_URL}/verify/reset-password`,
      {
        target: email,
        code,
        isEmail,
      },
    );
    return data;
  },
};

export default verificationApi;
