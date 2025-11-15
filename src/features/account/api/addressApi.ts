import { api } from '../../../api/apiClient';
import type { AddressResponse, ApiResponse } from '../../../types';

/**
 * Address API Service
 */

export interface CreateAddressRequest {
  name?: string;
  line1: string;
  line2?: string;
  district?: string;
  state?: string;
  country: string;
  countryCode?: string;
  zipCode?: string;
  isInvoice?: boolean;
  isDefault?: boolean;
  identificationNumber?: string;
  taxId?: string;
  taxOffice?: string;
}

export interface UpdateAddressRequest {
  name?: string;
  line1?: string;
  line2?: string;
  district?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  zipCode?: string;
  isInvoice?: boolean;
  isDefault?: boolean;
  identificationNumber?: string;
  taxId?: string;
  taxOffice?: string;
}

/**
 * Get all addresses for current user
 */
export const getAddresses = async (): Promise<AddressResponse[]> => {
  const response = await api.get<ApiResponse<AddressResponse[]>>('/web/account/addresses');
  return response.data.data!;
};

/**
 * Create new address
 */
export const createAddress = async (data: CreateAddressRequest): Promise<AddressResponse> => {
  const response = await api.post<ApiResponse<AddressResponse>>('/web/account/addresses', data);
  return response.data.data!;
};

/**
 * Update address
 */
export const updateAddress = async (id: string, data: UpdateAddressRequest): Promise<void> => {
  await api.put(`/web/account/addresses/${id}`, data);
};

/**
 * Delete address
 */
export const deleteAddress = async (id: string): Promise<void> => {
  await api.delete(`/web/account/addresses/${id}`);
};

