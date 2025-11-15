import React, { useState, useEffect } from 'react';
import { X, Building2, Loader2 } from 'lucide-react';
import { useCreateWorkspace } from '../api/workspaceApi';
import toast from 'react-hot-toast';

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createMutation = useCreateWorkspace();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    const toastId = toast.loading('Creating workspace...');

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success('Workspace created successfully! ✨', { id: toastId });
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create workspace';
      toast.error(errorMessage, { id: toastId });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-500 dark:bg-brand-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white/90">
                Create New Workspace
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Create a new workspace for your team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={createMutation.isPending}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Input */}
          <div>
            <label
              htmlFor="workspace-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Workspace Name <span className="text-error-500">*</span>
            </label>
            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workspace name"
              disabled={createMutation.isPending}
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label
              htmlFor="workspace-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <textarea
              id="workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter workspace description"
              disabled={createMutation.isPending}
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 dark:bg-brand-600 rounded-lg hover:bg-brand-600 dark:hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

