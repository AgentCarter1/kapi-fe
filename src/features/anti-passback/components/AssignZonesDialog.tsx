import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ZoneTreeSelector } from './ZoneTreeSelector';
import { useZones } from '../../zone/api/zoneApi';
import { useZonesByAntiPassback, useAssignZonesToAntiPassback, useRemoveZonesFromAntiPassback } from '../api/antiPassbackApi';
import { useAppSelector } from '../../../store/hooks';
import type { Zone } from '../../../api/endpoints/antiPassbacks';
import toast from 'react-hot-toast';

interface AssignZonesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  antiPassbackId: string;
  antiPassbackName: string;
}

export const AssignZonesDialog = ({
  isOpen,
  onClose,
  antiPassbackId,
  antiPassbackName,
}: AssignZonesDialogProps) => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);

  // Get all zones for workspace
  const { data: allZones, isLoading: isLoadingZones } = useZones(
    currentWorkspace?.workspaceId || '',
  );

  // Get currently assigned zones
  const { data: assignedZones, isLoading: isLoadingAssigned } = useZonesByAntiPassback(
    antiPassbackId,
  );

  // Mutations
  const assignMutation = useAssignZonesToAntiPassback(
    currentWorkspace?.workspaceId || '',
    antiPassbackId,
  );
  const removeMutation = useRemoveZonesFromAntiPassback(
    currentWorkspace?.workspaceId || '',
    antiPassbackId,
  );

  // Initialize selected zones when assigned zones are loaded
  useEffect(() => {
    if (assignedZones) {
      const assignedIds = assignedZones.map((zone) => zone.id);
      setSelectedZoneIds(assignedIds);
    }
  }, [assignedZones]);

  const handleSave = async () => {
    if (!assignedZones) return;

    const currentlyAssignedIds = assignedZones.map((zone) => zone.id);
    const toAdd = selectedZoneIds.filter((id) => !currentlyAssignedIds.includes(id));
    const toRemove = currentlyAssignedIds.filter((id) => !selectedZoneIds.includes(id));

    const toastId = toast.loading('Updating zone assignments...');

    try {
      // Add new assignments
      if (toAdd.length > 0) {
        await assignMutation.mutateAsync(toAdd);
      }

      // Remove assignments
      if (toRemove.length > 0) {
        await removeMutation.mutateAsync(toRemove);
      }

      toast.success('Zones updated successfully ✨', { id: toastId });
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Update failed';
      toast.error(`Failed to update zones: ${errorMessage}`, { id: toastId });
    }
  };

  const isLoading = isLoadingZones || isLoadingAssigned;
  const isSaving = assignMutation.isPending || removeMutation.isPending;

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
          className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 pointer-events-auto flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Assign Zones to {antiPassbackName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={isSaving}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <ZoneTreeSelector
                  zones={allZones || []}
                  selectedZoneIds={selectedZoneIds}
                  onSelectionChange={setSelectedZoneIds}
                />
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {selectedZoneIds.length} zone(s) selected
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-brand-600 dark:hover:bg-brand-700 inline-flex items-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

