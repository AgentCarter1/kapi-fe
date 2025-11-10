import { api } from '../../../api/apiClient';
import type { PhoneResponse, ApiResponse } from '../../../types';

/**
 * Phone API Service
 */

export interface CreatePhoneRequest {
  name?: string;
  countryCode: string;
  dialCode: string;
  phoneNumber: string;
  isDefault?: boolean;
}

export interface UpdatePhoneRequest {
  name?: string;
  countryCode?: string;
  dialCode?: string;
  phoneNumber?: string;
  isDefault?: boolean;
}

/**
 * Get all phones for current user
 */
export const getPhones = async (): Promise<PhoneResponse[]> => {
  const response = await api.get<ApiResponse<PhoneResponse[]>>('/account/phones');
  return response.data.data!;
};

/**
 * Create new phone
 */
export const createPhone = async (data: CreatePhoneRequest): Promise<PhoneResponse> => {
  const response = await api.post<ApiResponse<PhoneResponse>>('/account/phones', data);
  return response.data.data!;
};

/**
 * Update phone
 */
export const updatePhone = async (id: string, data: UpdatePhoneRequest): Promise<void> => {
  await api.put(`/account/phones/${id}`, data);
};

/**
 * Delete phone
 */
export const deletePhone = async (id: string): Promise<void> => {
  await api.delete(`/account/phones/${id}`);
};

