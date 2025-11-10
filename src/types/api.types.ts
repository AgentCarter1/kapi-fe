/**
 * Backend API Response Structure
 * Backend wraps all responses in this format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  customCode: number;
  message: string;
  data?: T;
  errorData?: Record<string, any>;
}

/**
 * Auth Related Types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  account: {
    email: string;
    password: string;
  };
  parameters: {
    firstName: string;
    lastName: string;
  };
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignUpResponse {
  verifyAccountToken: string;
}

export interface VerifyAccountRequest {
  otpCode: string;
}

export interface VerifyAccountResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * User Related Types
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  verifiedAt: Date | null;
}

