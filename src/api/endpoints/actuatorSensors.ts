import { api } from '../apiClient';

export type ActuatorSensor = {
  id: string;
  actuatorSensorTypeId: string;
  actuatorSensorTypeName?: string;
  zoneId?: string | null;
  zoneName?: string | null;
  deviceId: string;
  deviceName?: string;
  deviceUuid?: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateActuatorSensorRequest = {
  name?: string;
  zoneId?: string | null;
  isActive?: boolean;
};

export interface GetActuatorSensorsFilters {
  zoneId?: string;
  deviceId?: string;
  actuatorSensorTypeId?: string;
  isActive?: boolean;
}

/**
 * Get all actuator sensors for a workspace
 */
export const getActuatorSensorsByWorkspace = async (
  workspaceId: string,
  filters?: GetActuatorSensorsFilters,
): Promise<ActuatorSensor[]> => {
  // Filter out empty values
  const cleanParams: Record<string, any> = {};
  if (filters) {
    if (filters.zoneId && filters.zoneId.trim()) cleanParams.zoneId = filters.zoneId;
    if (filters.deviceId && filters.deviceId.trim()) cleanParams.deviceId = filters.deviceId;
    if (filters.actuatorSensorTypeId && filters.actuatorSensorTypeId.trim())
      cleanParams.actuatorSensorTypeId = filters.actuatorSensorTypeId;
    if (filters.isActive !== undefined) cleanParams.isActive = filters.isActive.toString();
  }

  const response = await api.get(`/web/workspace/actuator-sensors`, {
    params: cleanParams,
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data as ActuatorSensor[];
};

/**
 * Get actuator sensors for a device (legacy endpoint)
 */
export const getActuatorSensors = async (workspaceId: string, deviceId: string): Promise<ActuatorSensor[]> => {
  const response = await api.get(`/web/workspace/device/${deviceId}/actuator-sensors`, {
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data as ActuatorSensor[];
};

/**
 * Update actuator sensor
 */
export const updateActuatorSensor = async (
  workspaceId: string,
  actuatorSensorId: string,
  data: UpdateActuatorSensorRequest,
): Promise<void> => {
  await api.put(`/web/workspace/actuator-sensors/${actuatorSensorId}`, data, {
    headers: {
      'workspace-id': workspaceId,
    },
  });
};

