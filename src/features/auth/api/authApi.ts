import { api } from '../../../api/apiClient';
import type {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  SignUpResponse,
  VerifyAccountRequest,
  VerifyAccountResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyForgotPasswordOtpRequest,
  VerifyForgotPasswordOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  AdminLoginRequest,
  AdminLoginResponse,
  ApiResponse,
} from '../../../types';

/**
 * Auth API Service
 * Handles all authentication-related API calls
 */

/**
 * Admin login
 */
export const adminLogin = async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const response = await api.post<ApiResponse<AdminLoginResponse>>('/admin/auth/login', credentials);
  return response.data.data!;
};

/**
 * Login user
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<ApiResponse<LoginResponse>>('/web/auth/login', credentials);
  return response.data.data!;
};

/**
 * Sign up new user
 */
export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  const response = await api.post<ApiResponse<SignUpResponse>>('/web/auth/sign-up', data);
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
    '/web/auth/account/verify',
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data!;
};

/**
 * Logout user - invalidates access and refresh tokens
 */
export const logout = async (): Promise<void> => {
  await api.post('/web/auth/logout');
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (token: string): Promise<LoginResponse> => {
  const response = await api.post<ApiResponse<LoginResponse>>(
    '/web/auth/refresh-token',
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data!;
};

/**
 * Request password reset - sends OTP to email
 */
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  const response = await api.post<ApiResponse<ForgotPasswordResponse>>('/web/auth/forgot-password', data);
  return response.data.data!;
};

/**
 * Verify forgot password OTP and get reset token
 */
export const verifyForgotPasswordOtp = async (
  data: VerifyForgotPasswordOtpRequest
): Promise<VerifyForgotPasswordOtpResponse> => {
  const response = await api.post<ApiResponse<VerifyForgotPasswordOtpResponse>>(
    '/web/auth/forgot-password/verify-otp',
    data
  );
  return response.data.data!;
};

/**
 * Reset password using forgot password token
 */
export const resetPassword = async (
  token: string,
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const response = await api.post<ApiResponse<ResetPasswordResponse>>(
    '/web/auth/reset-password',
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data!;
};

