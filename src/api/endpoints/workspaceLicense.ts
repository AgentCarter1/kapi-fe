import { api } from '../apiClient';

export type WorkspaceLicense = {
  id: string;
  licenseTypeId: string;
  licenseTypeName: string;
  isActive: boolean;
  expireAt: Date | null;
  parameters: Record<string, any>;
  createdAt: Date;
};

export type AccessHistoryItem = {
  id: string;
  accountId: string;
  accountEmail: string;
  zoneId: string | null;
  zoneName: string | null;
  actuatorSensorId: string;
  actuatorSensorName: string;
  accessKeyId: string;
  isEntry: boolean;
  createdAt: Date;
};

export type AccessHistoryResponse = {
  items: AccessHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type LicenseResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: WorkspaceLicense | null;
};

type HistoryResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: AccessHistoryResponse;
};

/**
 * Get workspace license information
 */
export const getWorkspaceLicense = async (workspaceId: string): Promise<WorkspaceLicense | null> => {
  const response = await api.get<LicenseResponse>('/workspace/license', {
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data;
};

/**
 * Get workspace access history (entry/exit logs)
 */
export const getWorkspaceAccessHistory = async (
  workspaceId: string,
  page: number = 1,
  limit: number = 20,
): Promise<AccessHistoryResponse> => {
  const response = await api.get<HistoryResponse>('/workspace/access-history', {
    params: { page, limit },
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data;
};

