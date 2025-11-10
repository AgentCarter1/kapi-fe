import { api } from '../../../api/apiClient';
import type { AccountSelfResponse, ApiResponse } from '../../../types';

/**
 * Account API Service
 * Handles all account-related API calls
 */

/**
 * Get current user's account information
 */
export const getAccountSelf = async (): Promise<AccountSelfResponse> => {
  const response = await api.get<ApiResponse<AccountSelfResponse>>('/account/self');
  return response.data.data!;
};

