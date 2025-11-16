import { api } from "../apiClient";

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

export type ActuatorSensorsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type ActuatorSensorsList = {
  items: ActuatorSensor[];
  meta: ActuatorSensorsMeta;
};

/**
 * Get all actuator sensors for a workspace (paginated)
 */
export const getActuatorSensorsByWorkspace = async (
  workspaceId: string,
  filters?: GetActuatorSensorsFilters,
  page: number = 1,
  limit: number = 10
): Promise<ActuatorSensorsList> => {
  // Filter out empty values
  const params: Record<string, any> = { page, limit };
  if (filters) {
    if (filters.zoneId && filters.zoneId.trim()) params.zoneId = filters.zoneId;
    if (filters.deviceId && filters.deviceId.trim())
      params.deviceId = filters.deviceId;
    if (filters.actuatorSensorTypeId && filters.actuatorSensorTypeId.trim())
      params.actuatorSensorTypeId = filters.actuatorSensorTypeId;
    if (filters.isActive !== undefined)
      params.isActive = filters.isActive.toString();
  }

  const response = await api.get("/web/workspace/actuator-sensors", {
    params,
    headers: {
      "workspace-id": workspaceId,
    },
  });
  return response.data.data as ActuatorSensorsList;
};

/**
 * Get actuator sensors for a device (legacy endpoint)
 */
export const getActuatorSensors = async (
  workspaceId: string,
  deviceId: string
): Promise<ActuatorSensor[]> => {
  const response = await api.get(
    `/web/workspace/device/${deviceId}/actuator-sensors`,
    {
      headers: {
        "workspace-id": workspaceId,
      },
    }
  );
  return response.data.data as ActuatorSensor[];
};

/**
 * Update actuator sensor
 */
export const updateActuatorSensor = async (
  workspaceId: string,
  actuatorSensorId: string,
  data: UpdateActuatorSensorRequest
): Promise<void> => {
  await api.put(`/web/workspace/actuator-sensors/${actuatorSensorId}`, data, {
    headers: {
      "workspace-id": workspaceId,
    },
  });
};
