import { useState } from 'react';
import toast from 'react-hot-toast';
import { Shield, Plus, Pencil, Trash2, Loader2, MapPin, ChevronLeft, ChevronRight, ArrowUp, Lock } from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';
import { useNavigate } from 'react-router-dom';
import {
  useAntiPassbackTypes,
  useAntiPassbacks,
  useCreateAntiPassback,
  useUpdateAntiPassback,
  useDeleteAntiPassback,
} from '../api/antiPassbackApi';
import type {
  AntiPassback,
  AntiPassbackTypeDefinition,
  CreateAntiPassbackPayload,
  UpdateAntiPassbackPayload,
} from '../../../api/endpoints/antiPassbacks';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { AntiPassbackWizard } from './wizard/AntiPassbackWizard';
import { AssignZonesDialog } from './AssignZonesDialog';
import { useWorkspaceLicenseStatus } from '../../workspace/api/workspaceLicenseApi';

const formatBoolean = (value: any) => (value ? 'Yes' : 'No');

export const WorkspaceAntiPassbacks = () => {
  const navigate = useNavigate();
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAntiPassback, setEditingAntiPassback] = useState<AntiPassback | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    antiPassback: AntiPassback | null;
  }>({
    isOpen: false,
    antiPassback: null,
  });
  const [assignZonesDialog, setAssignZonesDialog] = useState<{
    isOpen: boolean;
    antiPassback: AntiPassback | null;
  }>({
    isOpen: false,
    antiPassback: null,
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const {
    data: antiPassbackTypes,
    isLoading: isLoadingTypes,
    error: typesError,
  } = useAntiPassbackTypes();

  const {
    data: antiPassbacks,
    isLoading: isLoadingAntiPassbacks,
    error: antiPassbacksError,
  } = useAntiPassbacks(currentWorkspace?.workspaceId || '', { page, limit });

  const createMutation = useCreateAntiPassback(currentWorkspace?.workspaceId || '');
  const updateMutation = useUpdateAntiPassback(currentWorkspace?.workspaceId || '');
  const deleteMutation = useDeleteAntiPassback(currentWorkspace?.workspaceId || '');
  const { data: licenseStatus, isLoading: isLoadingLicenseStatus } = useWorkspaceLicenseStatus(currentWorkspace?.workspaceId || null);

  // Check if anti-passback feature is enabled
  // Button is disabled while loading or if feature is not enabled
  const isAntiPassbackEnabled = licenseStatus?.antiPassback.enabled ?? false;
  const isButtonDisabled = isLoadingLicenseStatus || !isAntiPassbackEnabled;
  const antiPassbackFeatureMessage = !isAntiPassbackEnabled
    ? isLoadingLicenseStatus
      ? 'Loading license status...'
      : 'Anti-passback feature is not enabled in your license. Please upgrade your license to use this feature.'
    : '';

  const handleCreate = async (payload: CreateAntiPassbackPayload) => {
    const toastId = toast.loading('Creating anti-passback rule...');
    try {
      await createMutation.mutateAsync(payload);
      toast.success('Anti-passback rule created successfully', { id: toastId });
      setIsCreateOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Creation failed';
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  const handleUpdate = async (antiPassbackId: string, payload: UpdateAntiPassbackPayload) => {
    const toastId = toast.loading('Updating anti-passback rule...');
    try {
      await updateMutation.mutateAsync({
        antiPassbackId,
        data: payload,
      });
      toast.success('Anti-passback rule updated successfully', { id: toastId });
      setEditingAntiPassback(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Update failed';
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.antiPassback) return;

    const toastId = toast.loading('Deleting anti-passback rule...');
    try {
      await deleteMutation.mutateAsync(deleteConfirm.antiPassback.id);
      toast.success('Anti-passback rule deleted successfully', { id: toastId });
      setDeleteConfirm({ isOpen: false, antiPassback: null });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Deletion failed';
      toast.error(errorMessage, { id: toastId });
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
        <p className="text-warning-800 dark:text-warning-400">
          Please select a workspace to manage anti-passback rules.
        </p>
      </div>
    );
  }

  if (isLoadingTypes || isLoadingAntiPassbacks) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading anti-passback data...
      </div>
    );
  }

  if (typesError) {
    return (
      <div className="bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-4">
        <p className="text-error-800 dark:text-error-400">
          Failed to load anti-passback types. Please try again later.
        </p>
      </div>
    );
  }

  if (antiPassbacksError) {
    return (
      <div className="bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-4">
        <p className="text-error-800 dark:text-error-400">
          Failed to load anti-passback rules. Please try again later.
        </p>
      </div>
    );
  }

  const types = antiPassbackTypes || [];
  const items = antiPassbacks?.items || [];
  const meta = antiPassbacks?.meta;

  // Show license upgrade warning banner if feature is not enabled (but still show data)
  // Note: We still show data even if license is loading, but disable all actions
  const showUpgradeBanner = !isLoadingLicenseStatus && !isAntiPassbackEnabled;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const renderParameterSummary = (antiPassback: AntiPassback) => {
    const entries = Object.entries(antiPassback.parameters || {});
    if (entries.length === 0) {
      return <span className="text-sm text-gray-400 italic">No parameters configured</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {entries.map(([key, value]) => (
          <span
            key={key}
            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700"
          >
            {key}: {typeof value === 'boolean' ? formatBoolean(value) : value ?? '—'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* License Upgrade Banner */}
      {showUpgradeBanner && (
        <div className="bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-warning-600 dark:text-warning-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-warning-800 dark:text-warning-300 mb-1">
                Anti-passback Feature Not Available
              </h3>
              <p className="text-sm text-warning-700 dark:text-warning-400 mb-3">
                The anti-passback feature is not enabled in your current license plan. You can view existing rules but cannot create, edit, or delete them. Please upgrade your license to manage anti-passback rules.
              </p>
              <button
                onClick={() => navigate('/workspace/license')}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-warning-600 hover:bg-warning-700 dark:bg-warning-600 dark:hover:bg-warning-700 rounded-lg transition-colors"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Upgrade License
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Anti-passback Rules
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isAntiPassbackEnabled
              ? `Configure access restrictions for ${currentWorkspace.workspaceName}`
              : `View existing access restrictions for ${currentWorkspace.workspaceName}`}
          </p>
        </div>
        <div className="relative group">
          <button
            onClick={() => setIsCreateOpen(true)}
            disabled={isButtonDisabled}
            className={`inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-theme-xs ${
              isButtonDisabled
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700'
            }`}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Anti-passback
          </button>
          {isButtonDisabled && antiPassbackFeatureMessage && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 max-w-xs">
              {antiPassbackFeatureMessage}
              <div className="absolute top-full right-4 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
          <Shield className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
            No anti-passback rules configured
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Create an anti-passback rule to enforce entry/exit policies across your workspace.
          </p>
          <div className="relative group inline-block">
            <button
              onClick={() => setIsCreateOpen(true)}
              disabled={isButtonDisabled}
              className={`inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-theme-xs ${
                isButtonDisabled
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700'
              }`}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Anti-passback
            </button>
            {isButtonDisabled && antiPassbackFeatureMessage && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 max-w-xs">
                {antiPassbackFeatureMessage}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-theme-xs">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Assigned to workspace
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Parameters
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((antiPassback) => (
                <tr key={antiPassback.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                    {antiPassback.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {antiPassback.antiPassbackTypeName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {formatBoolean(antiPassback.isAssignedWorkspace)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {renderParameterSummary(antiPassback)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        antiPassback.isActive
                          ? 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {antiPassback.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() =>
                          setAssignZonesDialog({ isOpen: true, antiPassback: antiPassback })
                        }
                        disabled={isButtonDisabled}
                        className={`p-2 text-sm rounded-md transition-colors ${
                          isButtonDisabled
                            ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                            : 'text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-300 dark:hover:bg-brand-900/60'
                        }`}
                        title={isButtonDisabled ? 'Feature not available - upgrade license' : 'Assign Zones'}
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingAntiPassback(antiPassback)}
                        disabled={isButtonDisabled}
                        className={`p-2 text-sm rounded-md transition-colors ${
                          isButtonDisabled
                            ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                            : 'text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                        title={isButtonDisabled ? 'Feature not available - upgrade license' : 'Edit'}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ isOpen: true, antiPassback: antiPassback })
                        }
                        disabled={isButtonDisabled}
                        className={`p-2 text-sm rounded-md transition-colors ${
                          isButtonDisabled
                            ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                            : 'text-error-600 bg-error-50 hover:bg-error-100 dark:bg-error-900/40 dark:text-error-300 dark:hover:bg-error-900/60'
                        }`}
                        title={isButtonDisabled ? 'Feature not available - upgrade license' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {meta && meta.totalPages > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of{' '}
                <span className="font-medium">{meta.total}</span> anti-passback rules
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page === 1}
                  className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page === meta.totalPages}
                  className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Wizard */}
      {isCreateOpen && types.length > 0 && (
        <AntiPassbackWizard
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreate}
          types={types}
          isSubmitting={createMutation.isPending}
        />
      )}

      {/* Edit Wizard */}
      {editingAntiPassback && types.length > 0 && (
        <AntiPassbackWizard
          isOpen={!!editingAntiPassback}
          onClose={() => setEditingAntiPassback(null)}
          onSubmit={(payload) =>
            handleUpdate(editingAntiPassback.id, payload as UpdateAntiPassbackPayload)
          }
          types={types}
          isSubmitting={updateMutation.isPending}
          initialData={editingAntiPassback}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, antiPassback: null })}
        onConfirm={handleDelete}
        title="Delete Anti-passback"
        message={`Are you sure you want to delete "${deleteConfirm.antiPassback?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Assign Zones Dialog */}
      {assignZonesDialog.antiPassback && (
        <AssignZonesDialog
          isOpen={assignZonesDialog.isOpen}
          onClose={() => setAssignZonesDialog({ isOpen: false, antiPassback: null })}
          antiPassbackId={assignZonesDialog.antiPassback.id}
          antiPassbackName={assignZonesDialog.antiPassback.name}
        />
      )}
    </div>
  );
};


