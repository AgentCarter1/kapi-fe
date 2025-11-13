import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  type GetDevicesFilters,
  type CreateDeviceRequest,
  type UpdateDeviceRequest,
  type Device,
} from '../../../api/endpoints/devices';

// Query Keys
export const deviceKeys = {
  all: ['devices'] as const,
  workspace: (workspaceId: string) => [...deviceKeys.all, workspaceId] as const,
  list: (workspaceId: string, filters?: GetDevicesFilters) =>
    [...deviceKeys.workspace(workspaceId), 'list', filters] as const,
};

/**
 * Get devices list query
 */
export const useDevices = (workspaceId: string, filters?: GetDevicesFilters) => {
  return useQuery({
    queryKey: deviceKeys.list(workspaceId, filters),
    queryFn: () => getDevices(workspaceId, filters),
    enabled: !!workspaceId,
  });
};

/**
 * Create device mutation
 * Device type is automatically determined from UUID first 4 characters
 */
export const useCreateDevice = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeviceRequest) => createDevice(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.workspace(workspaceId) });
    },
  });
};

/**
 * Update device mutation
 */
export const useUpdateDevice = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deviceId, data }: { deviceId: string; data: UpdateDeviceRequest }) =>
      updateDevice(workspaceId, deviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.workspace(workspaceId) });
    },
  });
};

/**
 * Delete device mutation
 */
export const useDeleteDevice = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => deleteDevice(workspaceId, deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.workspace(workspaceId) });
    },
  });
};

