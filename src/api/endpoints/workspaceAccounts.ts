import { api } from '../apiClient';

export type WorkspaceAccount = {
  id: string;
  accountId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  accountType: string;
  status: string;
  isActive: boolean;
  startAt?: Date | null;
  endAt?: Date | null;
  createdAt: Date;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type WorkspaceAccountsResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: {
    items: WorkspaceAccount[];
    meta: PaginationMeta;
  };
};

export type WorkspaceAccountsFilters = {
  page?: number;
  limit?: number;
  accountType?: string;
  status?: string;
  search?: string;
};

export const getWorkspaceAccounts = async (
  workspaceId: string,
  filters?: WorkspaceAccountsFilters,
): Promise<WorkspaceAccountsResponse['data']> => {
  // Filter out empty string values
  const cleanParams: Record<string, any> = {};
  
  if (filters) {
    if (filters.page) cleanParams.page = filters.page;
    if (filters.limit) cleanParams.limit = filters.limit;
    if (filters.accountType && filters.accountType.trim()) cleanParams.accountType = filters.accountType;
    if (filters.status && filters.status.trim()) cleanParams.status = filters.status;
    if (filters.search && filters.search.trim()) cleanParams.search = filters.search;
  }

  const response = await api.get<WorkspaceAccountsResponse>('/workspaces/accounts', {
    params: cleanParams,
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data;
};

