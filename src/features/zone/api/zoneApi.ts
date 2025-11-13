import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getZones,
  createZone,
  updateZone,
  deleteZone,
  type CreateZoneRequest,
  type UpdateZoneRequest,
  type Zone,
} from '../../../api/endpoints/zones';

// Query Keys
export const zoneKeys = {
  all: ['zones'] as const,
  workspace: (workspaceId: string) => [...zoneKeys.all, workspaceId] as const,
};

/**
 * Get zones tree for workspace
 */
export const useZones = (workspaceId: string | undefined) => {
  return useQuery({
    queryKey: zoneKeys.workspace(workspaceId!),
    queryFn: () => getZones(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Create zone mutation
 */
export const useCreateZone = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateZoneRequest) => createZone(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.workspace(workspaceId) });
    },
  });
};

/**
 * Update zone mutation
 */
export const useUpdateZone = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zoneId, data }: { zoneId: string; data: UpdateZoneRequest }) =>
      updateZone(workspaceId, zoneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.workspace(workspaceId) });
    },
  });
};

/**
 * Delete zone mutation
 */
export const useDeleteZone = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: string) => deleteZone(workspaceId, zoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.workspace(workspaceId) });
    },
  });
};

