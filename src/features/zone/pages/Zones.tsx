import { useState, useMemo, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ZoneTree } from '../components/ZoneTree';
import { ZoneDialog } from '../components/ZoneDialog';
import { ZoneUnitsList } from '../components/ZoneUnitsList';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { useZones, useCreateZone, useCreateZoneTemplate, useUpdateZone, useDeleteZone } from '../api/zoneApi';
import { useAppSelector } from '../../../store/hooks';
import type { Zone, CreateZoneRequest, CreateZoneTemplateRequest, UpdateZoneRequest } from '../../../api/endpoints/zones';
import { ZoneType } from '../../../api/endpoints/zones';

export const Zones = () => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    parentZone?: Zone;
    editZone?: Zone;
    forceUnit?: boolean; // Force zone type to Unit
  }>({
    isOpen: false,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    zone: Zone | null;
  }>({
    isOpen: false,
    zone: null,
  });

  // Queries
  const {
    data: zones,
    isLoading,
    error,
  } = useZones(currentWorkspace?.workspaceId);

  // Mutations
  const createMutation = useCreateZone(currentWorkspace?.workspaceId || '');
  const createTemplateMutation = useCreateZoneTemplate(currentWorkspace?.workspaceId || '');
  const updateMutation = useUpdateZone(currentWorkspace?.workspaceId || '');
  const deleteMutation = useDeleteZone(currentWorkspace?.workspaceId || '');

  // Update selectedZone when zones data changes (after mutations)
  useEffect(() => {
    if (!selectedZone || !zones) return;
    
    // Find the updated zone in the new data
    const findZone = (zoneList: Zone[], targetId: string): Zone | null => {
      for (const zone of zoneList) {
        if (zone.id === targetId) return zone;
        if (zone.children) {
          const found = findZone(zone.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    
    const updatedZone = findZone(zones, selectedZone.id);
    if (updatedZone) {
      setSelectedZone(updatedZone); // Update with fresh data
    }
  }, [zones]); // Re-run when zones data changes

  // Get units from selected zone (only direct children, not recursive)
  const selectedZoneUnits = useMemo(() => {
    if (!selectedZone || !selectedZone.children) return [];
    
    // Only get direct children that are Units
    return selectedZone.children.filter(
      (child) => parseInt(child.zoneTypeId) === ZoneType.UNIT
    );
  }, [selectedZone]);

  // Handlers
  const handleSelectZone = (zone: Zone) => {
    setSelectedZone(zone);
  };

  const handleAddRoot = () => {
    setDialog({ isOpen: true });
  };

  const handleAddChild = (parentZone: Zone) => {
    setDialog({ isOpen: true, parentZone });
  };

  const handleAddUnit = (parentZone: Zone) => {
    setDialog({ isOpen: true, parentZone, forceUnit: true });
  };

  const handleEdit = (zone: Zone) => {
    setDialog({ isOpen: true, editZone: zone });
  };

  const handleDelete = (zone: Zone) => {
    setDeleteConfirm({ isOpen: true, zone });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.zone) return;

    const toastId = toast.loading('Deleting zone...');
    
    try {
      await deleteMutation.mutateAsync(deleteConfirm.zone.id);
      toast.success(`Zone "${deleteConfirm.zone.name}" deleted successfully`, { id: toastId });
      
      // If deleted zone was selected, clear selection
      if (selectedZone?.id === deleteConfirm.zone.id) {
        setSelectedZone(null);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete zone';
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleDialogSubmit = async (data: CreateZoneRequest | UpdateZoneRequest) => {
    const toastId = toast.loading(dialog.editZone ? 'Updating zone...' : 'Creating zone...');
    
    try {
      if (dialog.editZone) {
        // Update
        await updateMutation.mutateAsync({
          zoneId: dialog.editZone.id,
          data: data as UpdateZoneRequest,
        });
        toast.success('Zone updated successfully', { id: toastId });
      } else {
        // Create
        await createMutation.mutateAsync(data as CreateZoneRequest);
        toast.success('Zone created successfully', { id: toastId });
      }
      setDialog({ isOpen: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Operation failed';
      toast.error(errorMessage, { id: toastId });
      throw error; // Re-throw to keep dialog open
    }
  };

  const handleTemplateSubmit = async (data: CreateZoneTemplateRequest) => {
    const toastId = toast.loading('Creating zone template...');
    
    try {
      await createTemplateMutation.mutateAsync(data);
      toast.success('Zone template created successfully ✨', { id: toastId });
      setDialog({ isOpen: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Operation failed';
      toast.error(errorMessage, { id: toastId });
      throw error; // Re-throw to keep dialog open
    }
  };

  const handleDialogClose = () => {
    if (!createMutation.isPending && !createTemplateMutation.isPending && !updateMutation.isPending) {
      setDialog({ isOpen: false });
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
            <Building2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">Zones</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage zones for{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {currentWorkspace.workspaceName}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Split Layout: 40% Zones Tree | 60% Units List */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Zone Tree (40% = 2 columns) */}
        <div className="lg:col-span-2">
          <ZoneTree
            zones={zones || []}
            isLoading={isLoading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
            onAddRoot={handleAddRoot}
            onSelect={handleSelectZone}
            selectedZoneId={selectedZone?.id || null}
            hideUnits={true}
          />
        </div>

        {/* Right: Units List (60% = 3 columns) */}
        <div className="lg:col-span-3">
          <ZoneUnitsList
            parentZone={selectedZone}
            units={selectedZoneUnits}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddUnit={handleAddUnit}
          />
        </div>
      </div>

      {/* Zone Dialog */}
      <ZoneDialog
        isOpen={dialog.isOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        onSubmitTemplate={handleTemplateSubmit}
        parentZone={dialog.parentZone}
        editZone={dialog.editZone}
        isPending={createMutation.isPending || createTemplateMutation.isPending || updateMutation.isPending}
        forceZoneType={dialog.forceUnit ? ZoneType.UNIT : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, zone: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Zone"
        message={`Are you sure you want to delete "${deleteConfirm.zone?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

