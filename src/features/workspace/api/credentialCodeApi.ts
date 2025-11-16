import { api } from '../../../api/apiClient';

export type CredentialCode = {
  id: string;
  code: string;
  accountId: string;
  workspaceId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: {
    id: string;
    name: string | null;
    countryCode: string;
    dialCode: string;
    phoneNumber: string;
    isDefault: boolean;
    fullNumber: string;
  } | null;
  createdAt: string;
  usedAt: string | null;
  cancelledAt: string | null;
};

type CredentialCodesMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type CredentialCodesListResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: {
    items: CredentialCode[];
    meta: CredentialCodesMeta;
  };
};

type CreateCredentialCodeResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: CredentialCode;
};

type CancelCredentialCodeResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: {
    message: string;
  };
};

export type GetCredentialCodesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type CredentialCodesList = {
  items: CredentialCode[];
  meta: CredentialCodesMeta;
};

export const getCredentialCodes = async (
  workspaceId: string,
  params?: GetCredentialCodesParams,
): Promise<CredentialCodesList> => {
  const response = await api.get<CredentialCodesListResponse>('/web/workspace/credential-codes', {
    params,
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data;
};

export const createCredentialCode = async (
  workspaceId: string,
  data?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: {
      name?: string;
      countryCode: string;
      dialCode: string;
      phoneNumber: string;
      isDefault?: boolean;
    };
  },
): Promise<CredentialCode> => {
  const response = await api.post<CreateCredentialCodeResponse>(
    '/web/workspace/credential-codes',
    data || {},
    {
      headers: {
        'workspace-id': workspaceId,
      },
    }
  );
  return response.data.data;
};

type CreateBulkCredentialCodeResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: {
    items: CredentialCode[];
    totalCreated: number;
  };
};

export const createBulkCredentialCode = async (
  workspaceId: string,
  data: { count: number },
): Promise<{ items: CredentialCode[]; totalCreated: number }> => {
  const response = await api.post<CreateBulkCredentialCodeResponse>(
    '/web/workspace/credential-codes/bulk',
    data,
    {
      headers: {
        'workspace-id': workspaceId,
      },
    }
  );
  return response.data.data;
};

export const cancelCredentialCode = async (
  workspaceId: string,
  credentialCodeId: string,
): Promise<void> => {
  await api.patch<CancelCredentialCodeResponse>(
    `/web/workspace/credential-codes/${credentialCodeId}/cancel`,
    {},
    {
      headers: {
        'workspace-id': workspaceId,
      },
    }
  );
};

