import { api } from "../apiClient";

export interface ExchangeGoogleCodeResponse {
  accessToken: string;
  refreshToken: string;
  accountId: string;
  email: string;
  isSuperAdmin: boolean;
}

export async function exchangeGoogleCode(
  code: string,
  codeVerifier?: string
): Promise<ExchangeGoogleCodeResponse> {
  const { data } = await api.post("/web/auth/social/google/exchange", {
    code,
    codeVerifier,
  });
  const payload = data?.data ?? data;
  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    accountId: payload.accountId,
    email: payload.email,
    isSuperAdmin: payload.isSuperAdmin,
  };
}
