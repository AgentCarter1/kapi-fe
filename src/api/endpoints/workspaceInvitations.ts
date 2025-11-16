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

export type WorkspaceInvitesMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type WorkspaceInvitesListResponse = {
  items: WorkspaceInvite[];
  meta: WorkspaceInvitesMeta;
};

type GetWorkspaceInvitesApiResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: WorkspaceInvitesListResponse;
};

export interface GetWorkspaceInvitesParams {
  status?: string;
  page?: number;
  limit?: number;
}

export const createAccountInvite = async (
  workspaceId: string,
  data: CreateInviteRequest,
): Promise<CreateInviteResponse> => {
  const response = await api.post<CreateInviteApiResponse>(
    '/web/workspace/invitations/account',
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
): Promise<WorkspaceInvitesListResponse> => {
  const response = await api.get<GetWorkspaceInvitesApiResponse>('/web/workspace/invitations', {
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
    `/web/workspace/invitations/${invitationId}/cancel`,
    {},
    {
      headers: {
        'workspace-id': workspaceId,
      },
    },
  );
};

export interface InvitationHistory {
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
  deletedAt: string; // Soft-deleted timestamp
}

type GetInvitationHistoryResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: InvitationHistory[];
};

export const getInvitationHistory = async (
  workspaceId: string,
  email: string,
): Promise<InvitationHistory[]> => {
  const response = await api.get<GetInvitationHistoryResponse>(
    `/web/workspace/invitations/history/${encodeURIComponent(email)}`,
    {
      headers: {
        'workspace-id': workspaceId,
      },
    },
  );
  return response.data.data;
};
