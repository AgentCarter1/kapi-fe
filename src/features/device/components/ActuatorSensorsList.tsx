import { useState, useMemo } from 'react';
import { Loader2, Edit, Activity, Filter, X as XIcon } from 'lucide-react';
import { useActuatorSensorsByWorkspace, useUpdateActuatorSensor } from '../api/actuatorSensorApi';
import { useZones, flattenZones, type FlatZone } from '../../zone/api/zoneApi';
import { useDevices } from '../api/deviceApi';
import type { ActuatorSensor, UpdateActuatorSensorRequest, GetActuatorSensorsFilters } from '../../../api/endpoints/actuatorSensors';
import { UpdateActuatorSensorDialog } from './UpdateActuatorSensorDialog';
import { useAppSelector } from '../../../store/hooks';
import toast from 'react-hot-toast';

export const ActuatorSensorsList = () => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [selectedActuatorSensor, setSelectedActuatorSensor] = useState<ActuatorSensor | null>(null);
  const [filters, setFilters] = useState<GetActuatorSensorsFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Fetch zones for filter dropdown
  const { data: zonesTree = [] } = useZones(currentWorkspace?.workspaceId || '');
  const flatZones: FlatZone[] = flattenZones(zonesTree);

  // Fetch devices for filter dropdown
  const { data: devicesData } = useDevices(currentWorkspace?.workspaceId || '', { page: 1, limit: 1000 });

  // Fetch actuator sensors with filters
  const { data: allActuatorSensors, isLoading: isLoadingAll } = useActuatorSensorsByWorkspace(
    currentWorkspace?.workspaceId || null,
  );

  // Get unique devices and types from all actuator sensors
  const uniqueDevices = useMemo(() => {
    if (!allActuatorSensors) return [];
    const deviceMap = new Map<string, { id: string; name: string; uuid?: number }>();
    allActuatorSensors.forEach((sensor) => {
      if (sensor.deviceId && sensor.deviceName) {
        deviceMap.set(sensor.deviceId, {
          id: sensor.deviceId,
          name: sensor.deviceName,
          uuid: sensor.deviceUuid,
        });
      }
    });
    return Array.from(deviceMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allActuatorSensors]);

  const uniqueTypes = useMemo(() => {
    if (!allActuatorSensors) return [];
    const typeMap = new Map<string, { id: string; name: string }>();
    allActuatorSensors.forEach((sensor) => {
      if (sensor.actuatorSensorTypeId && sensor.actuatorSensorTypeName) {
        typeMap.set(sensor.actuatorSensorTypeId, {
          id: sensor.actuatorSensorTypeId,
          name: sensor.actuatorSensorTypeName,
        });
      }
    });
    return Array.from(typeMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allActuatorSensors]);

  // Apply filters to actuator sensors
  const actuatorSensors = useMemo(() => {
    if (!allActuatorSensors) return [];
    return allActuatorSensors.filter((sensor) => {
      if (filters.zoneId && sensor.zoneId !== filters.zoneId) return false;
      if (filters.deviceId && sensor.deviceId !== filters.deviceId) return false;
      if (filters.actuatorSensorTypeId && sensor.actuatorSensorTypeId !== filters.actuatorSensorTypeId) return false;
      if (filters.isActive !== undefined && sensor.isActive !== filters.isActive) return false;
      return true;
    });
  }, [allActuatorSensors, filters]);

  const isLoading = isLoadingAll;
  const updateMutation = useUpdateActuatorSensor(
    currentWorkspace?.workspaceId || '',
  );

  const handleEdit = (actuatorSensor: ActuatorSensor) => {
    setSelectedActuatorSensor(actuatorSensor);
    setUpdateDialog(true);
  };

  const handleUpdateSubmit = async (data: UpdateActuatorSensorRequest) => {
    if (!selectedActuatorSensor) return;

    const toastId = toast.loading('Updating actuator sensor...');

    try {
      await updateMutation.mutateAsync({
        actuatorSensorId: selectedActuatorSensor.id,
        data,
      });
      toast.success('Actuator sensor updated successfully', { id: toastId });
      setUpdateDialog(false);
      setSelectedActuatorSensor(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update actuator sensor';
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading actuator sensors...</span>
      </div>
    );
  }

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof GetActuatorSensorsFilters];
    return value !== undefined && value !== null && value !== '';
  });

  const clearFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading actuator sensors...</span>
      </div>
    );
  }

  if (!allActuatorSensors || allActuatorSensors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Actuator Sensors</h3>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          This workspace does not have any actuator sensors yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-theme-xs p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-brand-500 text-white rounded-full">
                  {Object.keys(filters).filter((key) => {
                    const value = filters[key as keyof GetActuatorSensorsFilters];
                    return value !== undefined && value !== null && value !== '';
                  }).length}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <XIcon className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Zone Filter */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Zone
                </label>
                <select
                  value={filters.zoneId || ''}
                  onChange={(e) => setFilters({ ...filters, zoneId: e.target.value || undefined })}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="">All Zones</option>
                  {flatZones
                    .filter((zone) => zone.isActive)
                    .map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.fullPath}
                      </option>
                    ))}
                </select>
              </div>

              {/* Device Filter */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Device
                </label>
                <select
                  value={filters.deviceId || ''}
                  onChange={(e) => setFilters({ ...filters, deviceId: e.target.value || undefined })}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="">All Devices</option>
                  {uniqueDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} {device.uuid && `(${device.uuid})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Sensor Type
                </label>
                <select
                  value={filters.actuatorSensorTypeId || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, actuatorSensorTypeId: e.target.value || undefined })
                  }
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="">All Types</option>
                  {uniqueTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Status Filter */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Status
                </label>
                <select
                  value={
                    filters.isActive === undefined
                      ? ''
                      : filters.isActive
                      ? 'true'
                      : 'false'
                  }
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                    })
                  }
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        {hasActiveFilters && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {actuatorSensors.length} of {allActuatorSensors.length} actuator sensors
          </div>
        )}

        {/* Actuator Sensors List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-theme-xs overflow-hidden">
          {actuatorSensors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Actuator Sensors Found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results.'
                  : 'This workspace does not have any actuator sensors yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {actuatorSensors.map((sensor) => (
              <div
                key={sensor.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {sensor.name}
                      </h3>
                      {!sensor.isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      {sensor.actuatorSensorTypeName && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Type:</span>
                          <span>{sensor.actuatorSensorTypeName}</span>
                        </div>
                      )}
                      {sensor.zoneName && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Zone:</span>
                          <span>{sensor.zoneName}</span>
                        </div>
                      )}
                      {sensor.deviceName && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Device:</span>
                          <span>{sensor.deviceName}</span>
                          {sensor.deviceUuid && (
                            <span className="text-gray-400 dark:text-gray-500 ml-1">({sensor.deviceUuid})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(sensor)}
                    className="ml-4 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 transition-colors"
                    title="Edit actuator sensor"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedActuatorSensor && (
        <UpdateActuatorSensorDialog
          isOpen={updateDialog}
          onClose={() => !updateMutation.isPending && setUpdateDialog(false)}
          onSubmit={handleUpdateSubmit}
          actuatorSensor={selectedActuatorSensor}
          isPending={updateMutation.isPending}
        />
      )}
    </>
  );
};

