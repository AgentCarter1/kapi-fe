import { api } from '../apiClient';

export type DeviceInfo = {
  uuid: string;
  name: string;
  zoneId?: string;
};

export type CreateDeviceRequest = {
  device: DeviceInfo;
  parameters?: Record<string, any>;
};

export type UpdateDeviceRequest = {
  name?: string;
  zoneId?: string;
  isActive?: boolean;
  parameters?: Record<string, any>;
};

export type Device = {
  id: string;
  uuid: string;
  name: string;
  deviceTypeId: string;
  deviceTypeName?: string;
  zoneId?: string;
  zoneName?: string;
  workspaceId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parameters?: Record<string, any>;
};

type DeviceResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: Device;
};

export interface GetDevicesFilters {
  page?: number;
  limit?: number;
  search?: string;
  deviceTypeId?: string;
  zoneId?: string;
}

type DevicesResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: {
    items: Device[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

/**
 * Get paginated list of devices
 */
export const getDevices = async (
  workspaceId: string,
  filters?: GetDevicesFilters,
): Promise<DevicesResponse['data']> => {
  // Filter out empty string values
  const cleanParams: Record<string, any> = {};
  if (filters) {
    if (filters.page) cleanParams.page = filters.page;
    if (filters.limit) cleanParams.limit = filters.limit;
    if (filters.search && filters.search.trim()) cleanParams.search = filters.search;
    if (filters.deviceTypeId && filters.deviceTypeId.trim()) cleanParams.deviceTypeId = filters.deviceTypeId;
    if (filters.zoneId && filters.zoneId.trim()) cleanParams.zoneId = filters.zoneId;
  }

  const response = await api.get<DevicesResponse>('/workspace/device', {
    params: cleanParams,
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data;
};

/**
 * Create a new device
 * Device type is automatically determined from the first 4 characters of the UUID
 */
export const createDevice = async (
  workspaceId: string,
  data: CreateDeviceRequest,
): Promise<Device> => {
  const response = await api.post<DeviceResponse>(
    `/workspace/device`,
    data,
    {
      headers: {
        'workspace-id': workspaceId,
      },
    },
  );
  return response.data.data;
};

/**
 * Update an existing device
 */
export const updateDevice = async (
  workspaceId: string,
  deviceId: string,
  data: UpdateDeviceRequest,
): Promise<{ message: string }> => {
  const response = await api.put<{ success: boolean; data: { message: string } }>(
    `/workspace/device/${deviceId}`,
    data,
    {
      headers: {
        'workspace-id': workspaceId,
      },
    },
  );
  return response.data.data;
};

/**
 * Delete a device
 */
export const deleteDevice = async (workspaceId: string, deviceId: string): Promise<{ message: string }> => {
  const response = await api.delete<{ success: boolean; data: { message: string } }>(
    `/workspace/device/${deviceId}`,
    {
      headers: {
        'workspace-id': workspaceId,
      },
    },
  );
  return response.data.data;
};

