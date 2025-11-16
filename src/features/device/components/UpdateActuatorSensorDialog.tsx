import { useEffect, useState, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import type { UpdateActuatorSensorRequest, ActuatorSensor } from '../../../api/endpoints/actuatorSensors';
import { useZones, flattenZones, type FlatZone } from '../../zone/api/zoneApi';
import { useAppSelector } from '../../../store/hooks';

interface UpdateActuatorSensorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateActuatorSensorRequest) => Promise<void>;
  actuatorSensor: ActuatorSensor;
  isPending: boolean;
}

export const UpdateActuatorSensorDialog = ({
  isOpen,
  onClose,
  onSubmit,
  actuatorSensor,
  isPending,
}: UpdateActuatorSensorDialogProps) => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const [name, setName] = useState('');
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);
  const zoneButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Fetch zones
  const { data: zonesTree = [], isLoading: isLoadingZones } = useZones(currentWorkspace?.workspaceId || '');
  const flatZones: FlatZone[] = flattenZones(zonesTree);

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
    
    setName(actuatorSensor.name);
    setZoneId(actuatorSensor.zoneId || null);
    setIsActive(actuatorSensor.isActive);
    setIsZoneDropdownOpen(false);
  }, [isOpen, actuatorSensor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: UpdateActuatorSensorRequest = {
      name,
      zoneId: zoneId || null,
      isActive,
    };

    await onSubmit(updateData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Update Actuator Sensor
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update actuator sensor "{actuatorSensor.name}"
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isPending}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Actuator sensor name"
                required
              />
            </div>

            {/* Zone Selection (Optional) */}
            <div className="relative">
              <label 
                htmlFor="actuatorSensorZone" 
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
                          setZoneId(null);
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
                Select the physical location where this actuator sensor is installed
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Is Active
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

