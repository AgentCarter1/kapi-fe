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

