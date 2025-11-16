import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getActuatorSensorsByWorkspace,
  updateActuatorSensor,
  type UpdateActuatorSensorRequest,
  type GetActuatorSensorsFilters,
  type ActuatorSensorsList,
} from '../../../api/endpoints/actuatorSensors';

// Query Keys
export const actuatorSensorKeys = {
  all: ['actuator-sensors'] as const,
  workspace: (workspaceId: string) => [...actuatorSensorKeys.all, 'workspace', workspaceId] as const,
  list: (workspaceId: string, filters?: GetActuatorSensorsFilters, page: number = 1, limit: number = 10) =>
    [...actuatorSensorKeys.workspace(workspaceId), 'list', filters, page, limit] as const,
};

/**
 * Get all actuator sensors for a workspace query (paginated)
 */
export const useActuatorSensorsByWorkspace = (
  workspaceId: string | null,
  filters?: GetActuatorSensorsFilters,
  page: number = 1,
  limit: number = 10,
) => {
  return useQuery<ActuatorSensorsList>({
    queryKey: actuatorSensorKeys.list(workspaceId || '', filters, page, limit),
    queryFn: () => getActuatorSensorsByWorkspace(workspaceId!, filters, page, limit),
    enabled: !!workspaceId,
  });
};

/**
 * Update actuator sensor mutation
 */
export const useUpdateActuatorSensor = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actuatorSensorId, data }: { actuatorSensorId: string; data: UpdateActuatorSensorRequest }) =>
      updateActuatorSensor(workspaceId, actuatorSensorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actuatorSensorKeys.workspace(workspaceId) });
    },
  });
};

