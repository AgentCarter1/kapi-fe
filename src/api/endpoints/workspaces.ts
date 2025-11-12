import { api } from '../apiClient';

export type Workspace = {
  id: string;
  workspaceId: string;
  workspaceName: string;
  accountType: string;
  status: string;
  isDefault: boolean;
};

type WorkspacesResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: Workspace[];
};

export const getWorkspaces = async (): Promise<Workspace[]> => {
  const response = await api.get<WorkspacesResponse>('/account/workspaces');
  return response.data.data;
};

// Alias for consistency
export const getAccountWorkspaces = getWorkspaces;

export const leaveWorkspace = async (workspaceId: string): Promise<void> => {
  await api.patch(`/account/workspaces/${workspaceId}/leave`);
};

export const setDefaultWorkspace = async (workspaceId: string): Promise<void> => {
  await api.patch(`/account/workspaces/${workspaceId}/set-default`);
};

