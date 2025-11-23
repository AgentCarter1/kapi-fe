import { useState, useMemo, useEffect } from 'react';
import { Building2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { Building3D } from '../components/Building3D';
import { ZoneTree } from '../../zone/components/ZoneTree';
import { ZoneDialog } from '../../zone/components/ZoneDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { useZones, useCreateZone, useCreateZoneTemplate, useUpdateZone, useDeleteZone } from '../../zone/api/zoneApi';
import { useAppSelector } from '../../../store/hooks';
import type { Zone, CreateZoneRequest, CreateZoneTemplateRequest, UpdateZoneRequest } from '../../../api/endpoints/zones';
import { ZoneType, ZONE_TYPE_LABELS } from '../../../api/endpoints/zones';

export const Building = () => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<Zone | null>(null);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    parentZone?: Zone;
    editZone?: Zone;
    forceUnit?: boolean;
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

  const { data: zones, isLoading, error } = useZones(currentWorkspace?.workspaceId || '');

  // Campus'ları bul (root level'daki CAMPUS tipindeki zone'lar)
  const campuses = useMemo(() => {
    if (!zones) return [];
    return zones.filter((zone) => parseInt(zone.zoneTypeId) === ZoneType.CAMPUS);
  }, [zones]);

  // Seçili campus'un children'larını al (building'ler) - zones güncellendiğinde de güncellenir
  // selectedCampus state'ini kullanmak yerine, doğrudan zones'den al (her zaman fresh data)
  const selectedCampusZones = useMemo(() => {
    if (!selectedCampus || !zones) return [];
    
    // Zones'den güncel campus'u bul (her zaman fresh data kullan)
    const currentCampus = zones.find((zone) => zone.id === selectedCampus.id);
    if (!currentCampus || !currentCampus.children) return [];
    
    console.log(`selectedCampusZones updated for campus "${currentCampus.name}":`, currentCampus.children.length, 'buildings');
    
    return currentCampus.children;
  }, [selectedCampus?.id, zones]);

  // İlk campus'u otomatik seç
  useEffect(() => {
    if (campuses.length > 0 && !selectedCampus) {
      setSelectedCampus(campuses[0]);
    }
  }, [campuses, selectedCampus]);

  // Mutations
  const createMutation = useCreateZone(currentWorkspace?.workspaceId || '');
  const createTemplateMutation = useCreateZoneTemplate(currentWorkspace?.workspaceId || '');
  const updateMutation = useUpdateZone(currentWorkspace?.workspaceId || '');
  const deleteMutation = useDeleteZone(currentWorkspace?.workspaceId || '');

  // Update selectedZone when zones data changes (after mutations)
  useEffect(() => {
    if (!selectedZone || !zones) return;
    
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
      setSelectedZone(updatedZone);
    }
  }, [zones]);

  // Handlers
  const handleSelectZone = (zone: Zone) => {
    setSelectedZone(zone);
  };

  const handleAddRoot = () => {
    // Eğer campus seçiliyse, o campus'un altına ekle
    if (selectedCampus) {
      setDialog({ isOpen: true, parentZone: selectedCampus });
    } else {
      setDialog({ isOpen: true });
    }
  };

  const handleAddChild = (parentZone: Zone) => {
    setDialog({ isOpen: true, parentZone });
  };

  const handleEdit = (zone: Zone) => {
    setDialog({ isOpen: true, editZone: zone });
  };

  const handleDelete = (zone: Zone) => {
    setDeleteConfirm({ isOpen: true, zone });
  };

  const handleDialogClose = () => {
    setDialog({ isOpen: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.zone) return;

    const toastId = toast.loading('Deleting zone...');
    
    try {
      await deleteMutation.mutateAsync(deleteConfirm.zone.id);
      toast.success(`Zone "${deleteConfirm.zone.name}" deleted successfully`, { id: toastId });
      
      if (selectedZone?.id === deleteConfirm.zone.id) {
        setSelectedZone(null);
      }
      setDeleteConfirm({ isOpen: false, zone: null });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete zone';
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleDialogSubmit = async (data: CreateZoneRequest | UpdateZoneRequest) => {
    const toastId = toast.loading(dialog.editZone ? 'Updating zone...' : 'Creating zone...');
    
    try {
      if (dialog.editZone) {
        await updateMutation.mutateAsync({
          zoneId: dialog.editZone.id,
          data: data as UpdateZoneRequest,
        });
        toast.success('Zone updated successfully', { id: toastId });
      } else {
        await createMutation.mutateAsync(data as CreateZoneRequest);
        toast.success('Zone created successfully', { id: toastId });
      }
      setDialog({ isOpen: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Operation failed';
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  const handleTemplateSubmit = async (data: CreateZoneTemplateRequest) => {
    const toastId = toast.loading('Creating zone template...');
    
    try {
      await createTemplateMutation.mutateAsync(data);
      toast.success('Zone template created successfully ✨', { id: toastId });
      setDialog({ isOpen: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create template';
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  // Zone istatistikleri
  const stats = useMemo(() => {
    if (!zones) return null;

    const countByType = (type: ZoneType): number => {
      const count = (zoneList: Zone[]): number => {
        return zoneList.reduce((acc, zone) => {
          let matches = parseInt(zone.zoneTypeId) === type ? 1 : 0;
          if (zone.children) {
            matches += count(zone.children);
          }
          return acc + matches;
        }, 0);
      };
      return count(zones);
    };

    return {
      buildings: countByType(ZoneType.BUILDING),
      floors: countByType(ZoneType.FLOOR),
      sections: countByType(ZoneType.SECTION),
      units: countByType(ZoneType.UNIT),
    };
  }, [zones]);

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">
          Please select a workspace first.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading zones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-2">Error loading zones</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-brand-100 dark:bg-brand-950 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">
              3D Building Visualization
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Interactive 3D view of your building structure
            </p>
          </div>
        </div>
      </div>

      {/* Campus Tabs */}
      {campuses.length > 0 && (
        <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <nav className="flex overflow-x-auto">
              {campuses.map((campus) => (
                <button
                  key={campus.id}
                  onClick={() => {
                    setSelectedCampus(campus);
                    setSelectedZone(null); // Reset selected zone when switching campus
                  }}
                  className={`flex-shrink-0 flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                    selectedCampus?.id === campus.id
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  {campus.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {stats.buildings}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {ZONE_TYPE_LABELS[ZoneType.BUILDING]}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {stats.floors}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {ZONE_TYPE_LABELS[ZoneType.FLOOR]}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {stats.sections}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {ZONE_TYPE_LABELS[ZoneType.SECTION]}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {stats.units}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {ZONE_TYPE_LABELS[ZoneType.UNIT]}
            </div>
          </div>
        </div>
      )}

      {/* Split Layout: 30% Zone Tree | 70% 3D Visualization */}
      {selectedCampus ? (
        <div className="grid grid-cols-10 gap-6">
          {/* Left: Zone Tree (30% = 3 columns) */}
          <div className="col-span-10 lg:col-span-3">
            <ZoneTree
              key={`zone-tree-${selectedCampus?.id}-${selectedCampusZones.length}`} // Force re-render when zones change
              zones={selectedCampusZones}
              isLoading={isLoading}
              error={error}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddChild={handleAddChild}
              onAddRoot={handleAddRoot}
              onSelect={handleSelectZone}
              selectedZoneId={selectedZone?.id || null}
              hideUnits={false} // Show units in tree
              defaultExpanded={true} // All nodes start expanded
            />
          </div>

          {/* Right: 3D Canvas (70% = 7 columns) */}
          <div className="col-span-10 lg:col-span-7">
            <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="h-[600px] w-full">
                <Building3D
                  zones={selectedCampusZones}
                  selectedZoneId={selectedZone?.id || null}
                  onZoneClick={setSelectedZone}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {campuses.length === 0 
              ? 'No campuses found. Create a campus zone to see 3D visualization.'
              : 'Please select a campus from the tabs above.'}
          </p>
        </div>
      )}

      {/* Selected Zone Info */}
      {selectedZone && (
        <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-brand-100 dark:bg-brand-950 rounded-lg flex items-center justify-center">
              <Info className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 dark:text-white/90 mb-1">
                {selectedZone.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {ZONE_TYPE_LABELS[parseInt(selectedZone.zoneTypeId) as ZoneType]}
              </p>
              {selectedZone.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedZone.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  Status: {selectedZone.isActive ? 'Active' : 'Inactive'}
                </span>
                {selectedZone.children && (
                  <span>
                    Children: {selectedZone.children.length}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Zone Dialog */}
      <ZoneDialog
        isOpen={dialog.isOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        onSubmitTemplate={handleTemplateSubmit}
        parentZone={dialog.parentZone}
        editZone={dialog.editZone}
        forceZoneType={dialog.forceUnit ? ZoneType.UNIT : undefined}
        isPending={createMutation.isPending || updateMutation.isPending || createTemplateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, zone: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Zone"
        message={
          deleteConfirm.zone
            ? `Are you sure you want to delete "${deleteConfirm.zone.name}"? This action cannot be undone and will also delete all child zones.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isPending={deleteMutation.isPending}
      />
    </div>
  );
};

