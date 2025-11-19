import { api } from '../apiClient';

export type Workspace = {
  id: string;
  workspaceId: string;
  workspaceName: string;
  accountType: string;
  status: string;
  isDefault: boolean;
  accessStartDate: string | null;
  accessEndDate: string | null;
};

type WorkspacesResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: Workspace[];
};

export const getWorkspaces = async (): Promise<Workspace[]> => {
  const response = await api.get<WorkspacesResponse>('/web/account/workspaces');
  return response.data.data;
};

// Alias for consistency
export const getAccountWorkspaces = getWorkspaces;

export const leaveWorkspace = async (workspaceId: string): Promise<void> => {
  await api.patch(`/web/account/workspaces/${workspaceId}/leave`);
};

export const setDefaultWorkspace = async (workspaceId: string): Promise<void> => {
  await api.patch(`/web/account/workspaces/${workspaceId}/set-default`);
};

export type CreateWorkspaceRequest = {
  name: string;
  description?: string;
};

type CreateWorkspaceResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: Workspace & { message: string };
};

export const createWorkspace = async (data: CreateWorkspaceRequest): Promise<Workspace> => {
  const response = await api.post<CreateWorkspaceResponse>('/web/account/workspaces', data);
  return response.data.data;
};

export type LicenseLimitStatus = {
  current: number;
  max: number | null;
  isLimitReached: boolean;
  remaining: number | null;
};

export type LicenseFeatureStatus = {
  enabled: boolean;
};

export type WorkspaceLicenseStatus = {
  device: LicenseLimitStatus;
  user: LicenseLimitStatus;
  credentialCode: LicenseLimitStatus;
  antiPassback: LicenseFeatureStatus;
  loginWeb: LicenseFeatureStatus;
};

type WorkspaceLicenseStatusResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: WorkspaceLicenseStatus;
};

export const getWorkspaceLicenseStatus = async (workspaceId: string): Promise<WorkspaceLicenseStatus> => {
  const response = await api.get<WorkspaceLicenseStatusResponse>('/web/workspace/license-status', {
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data;
};

