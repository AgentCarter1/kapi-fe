import { useState } from 'react';
import toast from 'react-hot-toast';
import { Shield, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';
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

const formatBoolean = (value: any) => (value ? 'Yes' : 'No');

export const WorkspaceAntiPassbacks = () => {
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

  const {
    data: antiPassbackTypes,
    isLoading: isLoadingTypes,
    error: typesError,
  } = useAntiPassbackTypes();

  const {
    data: antiPassbacks,
    isLoading: isLoadingAntiPassbacks,
    error: antiPassbacksError,
  } = useAntiPassbacks(currentWorkspace?.workspaceId || '');

  const createMutation = useCreateAntiPassback(currentWorkspace?.workspaceId || '');
  const updateMutation = useUpdateAntiPassback(currentWorkspace?.workspaceId || '');
  const deleteMutation = useDeleteAntiPassback(currentWorkspace?.workspaceId || '');

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Anti-passback Rules
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure access restrictions for{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {currentWorkspace.workspaceName}
            </span>
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors shadow-theme-xs dark:bg-brand-600 dark:hover:bg-brand-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Anti-passback
        </button>
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
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors shadow-theme-xs dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Anti-passback
          </button>
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
                        onClick={() => setEditingAntiPassback(antiPassback)}
                        className="p-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ isOpen: true, antiPassback: antiPassback })
                        }
                        className="p-2 text-sm text-error-600 bg-error-50 rounded-md hover:bg-error-100 transition-colors dark:bg-error-900/40 dark:text-error-300 dark:hover:bg-error-900/60"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
};


