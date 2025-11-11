import { api } from '../apiClient';

export interface AccessKeyData {
  accessKeyType: string;
  data: string;
  expireAt?: string;
  remainingUsages?: number;
}

export interface CreateInviteRequest {
  email: string;
  roles?: object;
  permissions?: object;
  expireAt: string;
  tempBeginAt?: string;
  tempEndAt?: string;
  accessKeys?: AccessKeyData[];
  isActive?: boolean;
}

export interface CreateInviteResponse {
  id: string;
  email: string;
  zoneId: string;
  token: string;
  status: string;
  expireAt: string;
  createdAt: string;
}

type CreateInviteApiResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: CreateInviteResponse;
};

export interface WorkspaceInvite {
  id: string;
  email: string;
  status: string;
  roles: object | null;
  permissions: object | null;
  isActive: boolean;
  expireAt: string;
  tempBeginAt: string | null;
  tempEndAt: string | null;
  createdAt: string;
  acceptedAt: string | null;
}

type GetWorkspaceInvitesResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: WorkspaceInvite[];
};

export interface GetWorkspaceInvitesParams {
  status?: string;
}

export const createAccountInvite = async (
  workspaceId: string,
  data: CreateInviteRequest,
): Promise<CreateInviteResponse> => {
  const response = await api.post<CreateInviteApiResponse>(
    '/workspace/invitations/account',
    data,
    {
      headers: {
        'workspace-id': workspaceId,
      },
    },
  );
  return response.data.data;
};

export const getWorkspaceInvites = async (
  workspaceId: string,
  params?: GetWorkspaceInvitesParams,
): Promise<WorkspaceInvite[]> => {
  const response = await api.get<GetWorkspaceInvitesResponse>('/workspace/invitations', {
    params,
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data;
};

export const cancelInvitation = async (
  workspaceId: string,
  invitationId: string,
): Promise<void> => {
  await api.patch(
    `/workspace/invitations/${invitationId}/cancel`,
    {},
    {
      headers: {
        'workspace-id': workspaceId,
      },
    },
  );
};

