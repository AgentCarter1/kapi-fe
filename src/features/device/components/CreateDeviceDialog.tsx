import { useEffect, useState, useRef } from 'react';
import { X, ChevronDown, Cpu, AlertCircle } from 'lucide-react';
import type { CreateDeviceRequest } from '../../../api/endpoints/devices';
import { useZones, flattenZones, type FlatZone } from '../../zone/api/zoneApi';
import { useAppSelector } from '../../../store/hooks';
import { useWorkspaceLicenseStatus } from '../../workspace/api/workspaceLicenseApi';

interface CreateDeviceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDeviceRequest) => Promise<void>;
  isPending: boolean;
}

export const CreateDeviceDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: CreateDeviceDialogProps) => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const [uuid, setUuid] = useState('');
  const [name, setName] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);
  const zoneButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Fetch zones
  const { data: zonesTree = [], isLoading: isLoadingZones, error: zonesError } = useZones(currentWorkspace?.workspaceId || '');
  const flatZones: FlatZone[] = flattenZones(zonesTree);
  const { data: licenseStatus, isLoading: isLoadingLicense } = useWorkspaceLicenseStatus(currentWorkspace?.workspaceId || null);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isZoneDropdownOpen && zoneButtonRef.current) {
      const rect = zoneButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isZoneDropdownOpen]);

  // Initialize form
  useEffect(() => {
    if (!isOpen) return;
    
    setUuid('');
    setName('');
    setZoneId('');
    setIsZoneDropdownOpen(false);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const createData: CreateDeviceRequest = {
      device: {
        uuid,
        name,
        zoneId: zoneId || undefined,
      },
    };

    await onSubmit(createData);
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
                Create Device
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Add a new device to your workspace
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
            {/* License Info Banner */}
            {licenseStatus?.device && (
              <div className={`rounded-lg border p-4 ${
                licenseStatus.device.isLimitReached
                  ? 'bg-error-50 dark:bg-error-950 border-error-200 dark:border-error-800'
                  : licenseStatus.device.remaining !== null && licenseStatus.device.remaining <= 3
                  ? 'bg-warning-50 dark:bg-warning-950 border-warning-200 dark:border-warning-800'
                  : 'bg-brand-50 dark:bg-brand-950 border-brand-200 dark:border-brand-800'
              }`}>
                <div className="flex items-start gap-3">
                  <Cpu className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    licenseStatus.device.isLimitReached
                      ? 'text-error-600 dark:text-error-400'
                      : licenseStatus.device.remaining !== null && licenseStatus.device.remaining <= 3
                      ? 'text-warning-600 dark:text-warning-400'
                      : 'text-brand-600 dark:text-brand-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        Device License Limit
                      </h3>
                      {licenseStatus.device.max !== null ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          licenseStatus.device.isLimitReached
                            ? 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300'
                            : licenseStatus.device.remaining !== null && licenseStatus.device.remaining <= 3
                            ? 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300'
                            : 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                        }`}>
                          {licenseStatus.device.current} / {licenseStatus.device.max}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Unlimited
                        </span>
                      )}
                    </div>
                    {licenseStatus.device.max !== null && (
                      <>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              licenseStatus.device.isLimitReached
                                ? 'bg-error-500 dark:bg-error-600'
                                : licenseStatus.device.remaining !== null && licenseStatus.device.remaining <= 3
                                ? 'bg-warning-500 dark:bg-warning-600'
                                : 'bg-brand-500 dark:bg-brand-600'
                            }`}
                            style={{
                              width: `${Math.min((licenseStatus.device.current / licenseStatus.device.max) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            {licenseStatus.device.remaining !== null ? (
                              <>
                                {licenseStatus.device.remaining === 0 ? (
                                  <span className="text-error-600 dark:text-error-400 font-medium flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Limit reached
                                  </span>
                                ) : (
                                  <>
                                    <span className="font-medium text-gray-800 dark:text-white/90">
                                      {licenseStatus.device.remaining}
                                    </span>
                                    {' '}slot{licenseStatus.device.remaining !== 1 ? 's' : ''} remaining
                                  </>
                                )}
                              </>
                            ) : (
                              'No limit'
                            )}
                          </span>
                          <span className="text-gray-500 dark:text-gray-500">
                            {((licenseStatus.device.current / licenseStatus.device.max) * 100).toFixed(0)}% used
                          </span>
                        </div>
                      </>
                    )}
                    {licenseStatus.device.isLimitReached && (
                      <p className="text-xs text-error-700 dark:text-error-400 mt-2">
                        You have reached your device limit. Please upgrade your license to add more devices.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Device Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-200 dark:border-gray-800">
                Device Information
              </h3>

              {/* UUID */}
              <div>
                <label 
                  htmlFor="deviceUuid" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Device UUID <span className="text-error-500">*</span>
                </label>
                <input
                  id="deviceUuid"
                  type="text"
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  required
                  placeholder="Enter device UUID (e.g., 1234567890)"
                  disabled={isPending}
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">
                  💡 Device type is automatically determined from the first 4 characters of UUID
                </p>
              </div>

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
              <div className="relative">
                <label 
                  htmlFor="deviceZone" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Zone (Optional)
                </label>
                <div>
                  <button
                    ref={zoneButtonRef}
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
                          : `No zone assigned (${flatZones.length} available)`
                      }
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isZoneDropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-[100]" 
                        onClick={() => setIsZoneDropdownOpen(false)}
                      />
                      
                      {/* Options */}
                      <div 
                        className="fixed z-[110] max-h-60 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
                        style={{
                          top: `${dropdownPosition.top + 4}px`,
                          left: `${dropdownPosition.left}px`,
                          width: `${dropdownPosition.width}px`,
                        }}
                      >
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

                        {isLoadingZones ? (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            Loading zones...
                          </div>
                        ) : flatZones.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            <div>No zones available</div>
                            <div className="text-xs mt-1">Workspace: {currentWorkspace?.workspaceId || 'Not set'}</div>
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
                  Select the physical location where this device will be installed
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
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
              onClick={handleSubmit}
              disabled={isPending || !uuid || !name}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 dark:bg-brand-600 rounded-lg hover:bg-brand-600 dark:hover:bg-brand-700 transition-colors shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creating...' : 'Create Device'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

