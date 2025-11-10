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

/**
 * Phone Response
 */
export interface PhoneResponse {
  id: string;
  name: string | null;
  countryCode: string;
  dialCode: string;
  phoneNumber: string;
  isDefault: boolean;
  fullNumber: string;
}

/**
 * Address Response
 */
export interface AddressResponse {
  id: string;
  name: string | null;
  line1: string | null;
  line2: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  countryCode: string | null;
  zipCode: string | null;
  isInvoice: boolean | null;
  isDefault: boolean | null;
  identificationNumber: string | null;
  taxId: string | null;
  taxOffice: string | null;
}

/**
 * Account Self Response
 * User profile with flattened parameters
 */
export interface AccountSelfResponse {
  id: string;
  email: string;
  deviceAccountId: string;
  defaultWorkspaceId: string | null;
  verifiedAt: Date | null;
  isActive: boolean | null;
  parameters: {
    firstName?: string;
    lastName?: string;
    signUpStatus?: string;
    [key: string]: any; // Other dynamic parameters
  };
  phones: PhoneResponse[];
  addresses: AddressResponse[];
  lastLoginAt: Date | null;
  lastActivityAt: Date | null;
}
