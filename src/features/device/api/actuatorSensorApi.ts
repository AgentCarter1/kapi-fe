import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getActuatorSensorsByWorkspace,
  updateActuatorSensor,
  type UpdateActuatorSensorRequest,
  type GetActuatorSensorsFilters,
} from '../../../api/endpoints/actuatorSensors';

// Query Keys
export const actuatorSensorKeys = {
  all: ['actuator-sensors'] as const,
  workspace: (workspaceId: string) => [...actuatorSensorKeys.all, 'workspace', workspaceId] as const,
  list: (workspaceId: string, filters?: GetActuatorSensorsFilters) =>
    [...actuatorSensorKeys.workspace(workspaceId), 'list', filters] as const,
};

/**
 * Get all actuator sensors for a workspace query
 */
export const useActuatorSensorsByWorkspace = (
  workspaceId: string | null,
  filters?: GetActuatorSensorsFilters,
) => {
  return useQuery({
    queryKey: actuatorSensorKeys.list(workspaceId || '', filters),
    queryFn: () => getActuatorSensorsByWorkspace(workspaceId!, filters),
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

