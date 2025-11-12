import { api } from '../apiClient';

export type WorkspaceAccount = {
  id: string; // account_has_workspaces.id (bigint)
  accountId: string; // accounts.id (UUID) - Use this for operations!
  email: string;
  firstName?: string;
  lastName?: string;
  accountType: string;
  status: string;
  createdAt: string;
};

export type WorkspaceAccountsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type WorkspaceAccountsFilters = {
  page?: number;
  limit?: number;
  accountType?: string;
  status?: string;
  search?: string;
};

type WorkspaceAccountsResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: {
    items: WorkspaceAccount[];
    meta: WorkspaceAccountsMeta;
  };
};

export const getWorkspaceAccounts = async (
  workspaceId: string,
  filters?: WorkspaceAccountsFilters,
): Promise<{ items: WorkspaceAccount[]; meta: WorkspaceAccountsMeta }> => {
  const response = await api.get<WorkspaceAccountsResponse>('/workspace/accounts', {
    params: filters,
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data;
};

export const removeAccountFromWorkspace = async (
  workspaceId: string,
  accountId: string,
): Promise<void> => {
  await api.delete(`/workspace/accounts/${accountId}`, {
    headers: {
      'workspace-id': workspaceId,
    },
  });
};

export type AccountHistory = {
  id: string;
  accountId: string;
  workspaceId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  accountType: string;
  status: string;
  isActive: boolean;
  startAt?: string | null;
  endAt?: string | null;
  createdAt: string;
  deletedAt: string; // Soft-deleted timestamp
};

type AccountHistoryResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: AccountHistory[];
};

export const getAccountHistory = async (
  workspaceId: string,
  accountId: string,
): Promise<AccountHistory[]> => {
  const response = await api.get<AccountHistoryResponse>(
    `/workspace/accounts/${accountId}/history`,
    {
      headers: {
        'workspace-id': workspaceId,
      },
    },
  );
  return response.data.data;
};

