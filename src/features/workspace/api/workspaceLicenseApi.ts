import { useQuery } from '@tanstack/react-query';
import { 
  getWorkspaceLicense, 
  getWorkspaceAccessHistory,
} from '../../../api/endpoints/workspaceLicense';

// Query Keys
export const workspaceLicenseKeys = {
  all: ['workspace-license'] as const,
  license: (workspaceId: string) => [...workspaceLicenseKeys.all, 'license', workspaceId] as const,
  history: (workspaceId: string, page: number, limit: number) => 
    [...workspaceLicenseKeys.all, 'history', workspaceId, page, limit] as const,
};

/**
 * Get workspace license query
 */
export const useWorkspaceLicense = (workspaceId: string) => {
  return useQuery({
    queryKey: workspaceLicenseKeys.license(workspaceId),
    queryFn: () => getWorkspaceLicense(workspaceId),
    enabled: !!workspaceId,
  });
};

/**
 * Get workspace access history query
 */
export const useWorkspaceAccessHistory = (
  workspaceId: string,
  page: number = 1,
  limit: number = 20,
) => {
  return useQuery({
    queryKey: workspaceLicenseKeys.history(workspaceId, page, limit),
    queryFn: () => getWorkspaceAccessHistory(workspaceId, page, limit),
    enabled: !!workspaceId,
  });
};

