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

type CredentialCodesResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: CredentialCode[];
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

export const getCredentialCodes = async (workspaceId: string): Promise<CredentialCode[]> => {
  const response = await api.get<CredentialCodesResponse>('/workspace/credential-codes', {
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
    '/workspace/credential-codes',
    data || {},
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
    `/workspace/credential-codes/${credentialCodeId}/cancel`,
    {},
    {
      headers: {
        'workspace-id': workspaceId,
      },
    }
  );
};

