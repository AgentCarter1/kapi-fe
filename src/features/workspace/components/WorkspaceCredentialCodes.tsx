import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';
import {
  getCredentialCodes,
  cancelCredentialCode,
  type CredentialCode,
} from '../api/credentialCodeApi';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { CreateCredentialCodeDialog } from './CreateCredentialCodeDialog';

export const WorkspaceCredentialCodes = () => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    credentialCodeId: string;
    code: string;
  }>({
    isOpen: false,
    credentialCodeId: '',
    code: '',
  });

  const { data: credentialCodes, isLoading, error } = useQuery({
    queryKey: ['credential-codes', currentWorkspace?.workspaceId],
    queryFn: () => getCredentialCodes(currentWorkspace!.workspaceId),
    enabled: !!currentWorkspace?.workspaceId,
  });

  const cancelMutation = useMutation({
    mutationFn: (credentialCodeId: string) =>
      cancelCredentialCode(currentWorkspace!.workspaceId, credentialCodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credential-codes'] });
      toast.success('Credential code cancelled successfully 🗑️');
      setDeleteConfirm({ isOpen: false, credentialCodeId: '', code: '' });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel credential code';
      toast.error(errorMessage);
    },
  });

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const handleCancel = (credentialCodeId: string, code: string) => {
    setDeleteConfirm({ isOpen: true, credentialCodeId, code });
  };

  const handleConfirmCancel = async () => {
    if (!currentWorkspace?.workspaceId) return;
    await cancelMutation.mutateAsync(deleteConfirm.credentialCodeId);
  };

  const getStatusBadge = (code: CredentialCode) => {
    // Priority: cancelled_at > used_at > active
    if (code.cancelledAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700">
          Cancelled
        </span>
      );
    }
    if (code.usedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-warning-100 text-warning-800 dark:bg-warning-950 dark:text-warning-400 border-warning-200 dark:border-warning-900">
          Used
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-success-100 text-success-800 dark:bg-success-950 dark:text-success-400 border-success-200 dark:border-success-900">
        Active
      </span>
    );
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
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Credential Codes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generate 8-character codes for workspace access
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors shadow-theme-xs dark:bg-brand-600 dark:hover:bg-brand-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Code
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-4">
          <p className="text-error-800 dark:text-error-400 font-medium">Failed to load credential codes.</p>
          <p className="text-error-600 dark:text-error-500 text-sm mt-1">
            {(error as Error).message}
          </p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <>
          {!credentialCodes || credentialCodes.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-12 text-center border border-gray-200 dark:border-gray-800">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg
                    className="h-10 w-10 text-gray-400 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">
                No credential codes found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Create your first credential code to get started.
              </p>
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center justify-center px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors shadow-theme-xs dark:bg-brand-600 dark:hover:bg-brand-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Code
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Used At
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Cancelled At
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {credentialCodes.map((code) => (
                      <tr
                        key={code.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono font-semibold text-gray-800 dark:text-white/90 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700">
                              {code.code}
                            </code>
                            <button
                              onClick={() => handleCopy(code.code)}
                              className="text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                              title="Copy code"
                            >
                              {copiedCode === code.code ? (
                                <Check className="h-4 w-4 text-success-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-800 dark:text-white/90">
                            {code.firstName || code.lastName ? (
                              <span>
                                {code.firstName || ''} {code.lastName || ''}
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {code.email ? (
                              <span className="truncate max-w-[200px] block" title={code.email}>
                                {code.email}
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {code.phone ? (
                              <span>{code.phone.fullNumber}</span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(code)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(code.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {code.usedAt ? (
                            new Date(code.usedAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {code.cancelledAt ? (
                            new Date(code.cancelledAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!code.cancelledAt && !code.usedAt && (
                            <button
                              onClick={() => handleCancel(code.id, code.code)}
                              disabled={cancelMutation.isPending}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-error-700 dark:text-error-400 bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-900 rounded-lg hover:bg-error-100 dark:hover:bg-error-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Dialog */}
      {currentWorkspace && (
        <CreateCredentialCodeDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          workspaceId={currentWorkspace.workspaceId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['credential-codes'] });
          }}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, credentialCodeId: '', code: '' })}
        onConfirm={handleConfirmCancel}
        title="Cancel Credential Code"
        message={`Are you sure you want to cancel credential code "${deleteConfirm.code}"? This action cannot be undone. The code will be marked as cancelled but will remain in the system.`}
        confirmText="Cancel Code"
        cancelText="Keep Code"
        variant="danger"
      />
    </>
  );
};

