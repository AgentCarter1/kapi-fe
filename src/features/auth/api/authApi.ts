import { api } from '../../../api/apiClient';
import type {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  SignUpResponse,
  VerifyAccountRequest,
  VerifyAccountResponse,
  ApiResponse,
} from '../../../types';

/**
 * Auth API Service
 * Handles all authentication-related API calls
 */

/**
 * Login user
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
  return response.data.data!;
};

/**
 * Sign up new user
 */
export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  const response = await api.post<ApiResponse<SignUpResponse>>('/auth/sign-up', data);
  return response.data.data!;
};

/**
 * Verify account with OTP
 */
export const verifyAccount = async (
  token: string,
  data: VerifyAccountRequest
): Promise<VerifyAccountResponse> => {
  const response = await api.post<ApiResponse<VerifyAccountResponse>>(
    '/auth/account/verify',
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data!;
};

