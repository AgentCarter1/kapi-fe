import { useEffect, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import type { Device, UpdateDeviceRequest } from '../../../api/endpoints/devices';
import { useZones, flattenZones, type FlatZone } from '../../zone/api/zoneApi';
import { useAppSelector } from '../../../store/hooks';

interface UpdateDeviceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateDeviceRequest) => Promise<void>;
  device: Device;
  isPending: boolean;
}

export const UpdateDeviceDialog = ({
  isOpen,
  onClose,
  onSubmit,
  device,
  isPending,
}: UpdateDeviceDialogProps) => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const [name, setName] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);

  // Fetch zones
  const { data: zonesTree = [], isLoading: isLoadingZones } = useZones(currentWorkspace?.workspaceId || '');
  const flatZones: FlatZone[] = flattenZones(zonesTree);

  // Initialize form
  useEffect(() => {
    if (!isOpen || !device) return;

    setName(device.name);
    setZoneId(device.zoneId || '');
    setIsActive(device.isActive);
    setIsZoneDropdownOpen(false);
  }, [isOpen, device]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: any = {};

    // Only include changed fields
    if (name !== device.name) {
      updateData.name = name;
    }

    if (zoneId !== (device.zoneId || '')) {
      updateData.zoneId = zoneId || undefined;
    }

    if (isActive !== device.isActive) {
      updateData.isActive = isActive;
    }

    await onSubmit(updateData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Dialog Content */}
        <div
          className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Update Device
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                UUID: {device.uuid}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={isPending}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Device Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-200 dark:border-gray-800">
                Device Information
              </h3>

              {/* Name */}
              <div>
                <label
                  htmlFor="deviceName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Device Name <span className="text-error-500">*</span>
                </label>
                <input
                  id="deviceName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isPending}
                  placeholder="Enter device name"
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Zone Selection (Optional) */}
              <div>
                <label 
                  htmlFor="deviceZone" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Zone (Optional)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsZoneDropdownOpen(!isZoneDropdownOpen)}
                    disabled={isPending || isLoadingZones}
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                  >
                    <span className={!zoneId ? 'text-gray-400 dark:text-white/30' : ''}>
                      {isLoadingZones 
                        ? 'Loading zones...' 
                        : zoneId 
                          ? flatZones.find(z => z.id === zoneId)?.fullPath || 'Select zone'
                          : 'No zone assigned'
                      }
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isZoneDropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsZoneDropdownOpen(false)}
                      />
                      
                      {/* Options */}
                      <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                        {/* Clear Selection Option */}
                        <button
                          type="button"
                          onClick={() => {
                            setZoneId('');
                            setIsZoneDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 italic"
                        >
                          No zone (clear selection)
                        </button>

                        {flatZones.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            No zones available
                          </div>
                        ) : (
                          flatZones
                            .filter(zone => zone.isActive)
                            .map((zone) => (
                              <button
                                key={zone.id}
                                type="button"
                                onClick={() => {
                                  setZoneId(zone.id);
                                  setIsZoneDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                  zoneId === zone.id
                                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                                style={{ paddingLeft: `${zone.depth * 1.5 + 1}rem` }}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs opacity-60">{zone.zoneTypeName}</span>
                                  <span className="font-medium">{zone.name}</span>
                                </div>
                              </button>
                            ))
                        )}
                      </div>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select the physical location where this device is installed
                </p>
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isPending}
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-brand-600 dark:checked:border-transparent"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Device is active
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 border border-transparent rounded-lg shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus:ring-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Updating...' : 'Update Device'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

