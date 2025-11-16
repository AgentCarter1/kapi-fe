import { useState } from 'react';
import { Cpu, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { CreateDeviceDialog } from '../components/CreateDeviceDialog';
import { UpdateDeviceDialog } from '../components/UpdateDeviceDialog';
import { DeviceList } from '../components/DeviceList';
import { ActuatorSensorsList } from '../components/ActuatorSensorsList';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { useDevices, useCreateDevice, useUpdateDevice, useDeleteDevice } from '../api/deviceApi';
import { useAppSelector } from '../../../store/hooks';
import { useWorkspaceLicenseStatus } from '../../workspace/api/workspaceLicenseApi';
import type { CreateDeviceRequest, UpdateDeviceRequest, Device, GetDevicesFilters } from '../../../api/endpoints/devices';

export const Devices = () => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  
  // Create dialog state
  const [createDialog, setCreateDialog] = useState(false);
  
  // Update dialog state
  const [updateDialog, setUpdateDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  
  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    device: Device | null;
  }>({
    isOpen: false,
    device: null,
  });

  // Filters state
  const [filters, setFilters] = useState<GetDevicesFilters>({
    page: 1,
    limit: 10,
  });

  // Tab state
  const [activeTab, setActiveTab] = useState<'devices' | 'actuator-sensors'>('devices');

  // Queries & Mutations
  const { data, isLoading } = useDevices(currentWorkspace?.workspaceId || '', filters);
  const createMutation = useCreateDevice(currentWorkspace?.workspaceId || '');
  const updateMutation = useUpdateDevice(currentWorkspace?.workspaceId || '');
  const deleteMutation = useDeleteDevice(currentWorkspace?.workspaceId || '');
  const { data: licenseStatus, isLoading: isLoadingLicenseStatus } = useWorkspaceLicenseStatus(currentWorkspace?.workspaceId || null);

  // Check if device limit is reached
  // Button is disabled while loading or if limit is reached
  const isDeviceLimitReached = licenseStatus?.device.isLimitReached ?? false;
  const isButtonDisabled = isLoadingLicenseStatus || isDeviceLimitReached;
  const deviceLimitMessage = licenseStatus?.device && licenseStatus.device.max !== null && licenseStatus.device.max !== undefined
    ? `Device limit reached (${licenseStatus.device.current}/${licenseStatus.device.max}). Please upgrade your license to add more devices.`
    : isLoadingLicenseStatus
    ? 'Loading license status...'
    : '';

  // Handlers
  const handleOpenCreateDialog = () => {
    setCreateDialog(true);
  };

  const handleCreateSubmit = async (data: CreateDeviceRequest) => {
    const toastId = toast.loading('Creating device...');

    try {
      await createMutation.mutateAsync(data);
      toast.success('Device created successfully with parameters and sensors', { 
        id: toastId,
        duration: 5000,
      });
      setCreateDialog(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create device';
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    setUpdateDialog(true);
  };

  const handleUpdateSubmit = async (data: UpdateDeviceRequest) => {
    if (!selectedDevice) return;

    const toastId = toast.loading('Updating device...');

    try {
      await updateMutation.mutateAsync({
        deviceId: selectedDevice.id,
        data,
      });
      toast.success('Device updated successfully', { id: toastId });
      setUpdateDialog(false);
      setSelectedDevice(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update device';
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  const handleDelete = (device: Device) => {
    setDeleteConfirm({ isOpen: true, device });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.device) return;

    const toastId = toast.loading('Deleting device...');

    try {
      await deleteMutation.mutateAsync(deleteConfirm.device.id);
      toast.success(`Device "${deleteConfirm.device.name}" deleted successfully`, { id: toastId });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete device';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setDeleteConfirm({ isOpen: false, device: null });
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
        <p className="text-warning-800 dark:text-warning-400">Please select a workspace first.</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-brand-100 dark:bg-brand-950 rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">Devices</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage devices for{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {currentWorkspace.workspaceName}
              </span>
            </p>
          </div>
        </div>

        {/* Create Device Button */}
        <div className="relative group">
          <button
            onClick={handleOpenCreateDialog}
            disabled={isButtonDisabled}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-theme-xs ${
              isButtonDisabled
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700'
            }`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Device
          </button>
          {isButtonDisabled && deviceLimitMessage && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 max-w-xs">
              {deviceLimitMessage}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('devices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'devices'
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Devices
            </button>
            <button
              onClick={() => setActiveTab('actuator-sensors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'actuator-sensors'
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Actuator Sensors
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'devices' && (
        <DeviceList
          devices={data?.items || []}
          meta={data?.meta || { page: 1, limit: 10, total: 0, totalPages: 0 }}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {activeTab === 'actuator-sensors' && <ActuatorSensorsList />}

      {/* Create Device Dialog */}
      <CreateDeviceDialog
        isOpen={createDialog}
        onClose={() => !createMutation.isPending && setCreateDialog(false)}
        onSubmit={handleCreateSubmit}
        isPending={createMutation.isPending}
      />

      {/* Update Device Dialog */}
      {selectedDevice && (
        <UpdateDeviceDialog
          isOpen={updateDialog}
          onClose={() => !updateMutation.isPending && setUpdateDialog(false)}
          onSubmit={handleUpdateSubmit}
          device={selectedDevice}
          isPending={updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, device: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Device"
        message={`Are you sure you want to delete "${deleteConfirm.device?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

