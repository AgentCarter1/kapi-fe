import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2, Copy, Check, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';
import {
  getCredentialCodes,
  cancelCredentialCode,
  type CredentialCode,
  type GetCredentialCodesParams,
} from '../api/credentialCodeApi';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { CreateCredentialCodeDialog } from './CreateCredentialCodeDialog';
import { useWorkspaceLicenseStatus } from '../api/workspaceLicenseApi';

export const WorkspaceCredentialCodes = () => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<GetCredentialCodesParams>({
    page: 1,
    limit: 10,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    credentialCodeId: string;
    code: string;
  }>({
    isOpen: false,
    credentialCodeId: '',
    code: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['credential-codes', currentWorkspace?.workspaceId, filters],
    queryFn: () => getCredentialCodes(currentWorkspace!.workspaceId, filters),
    enabled: !!currentWorkspace?.workspaceId,
  });

  const { data: licenseStatus, isLoading: isLoadingLicenseStatus } = useWorkspaceLicenseStatus(currentWorkspace?.workspaceId || null);

  // Check if credential code limit is reached
  // Button is disabled while loading or if limit is reached
  const isCredentialCodeLimitReached = licenseStatus?.credentialCode.isLimitReached ?? false;
  const isButtonDisabled = isLoadingLicenseStatus || isCredentialCodeLimitReached;
  const credentialCodeLimitMessage = licenseStatus?.credentialCode && licenseStatus.credentialCode.max !== null && licenseStatus.credentialCode.max !== undefined
    ? `Credential code limit reached (${licenseStatus.credentialCode.current}/${licenseStatus.credentialCode.max}). Please upgrade your license to create more codes.`
    : isLoadingLicenseStatus
    ? 'Loading license status...'
    : '';

  const credentialCodes = data?.items || [];
  const meta = data?.meta;

  const cancelMutation = useMutation({
    mutationFn: (credentialCodeId: string) =>
      cancelCredentialCode(currentWorkspace!.workspaceId, credentialCodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credential-codes'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-license', 'status', currentWorkspace?.workspaceId] });
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput || undefined, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Credential Codes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generate 8-character codes for workspace access
          </p>
        </div>
        <div className="relative group">
          <button
            onClick={handleCreateClick}
            disabled={isButtonDisabled}
            className={`inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-theme-xs ${
              isButtonDisabled
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700'
            }`}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Code
          </button>
          {isButtonDisabled && credentialCodeLimitMessage && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 max-w-xs">
              {credentialCodeLimitMessage}
              <div className="absolute top-full right-4 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by code, name, email, or phone..."
            className="w-full h-11 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors shadow-theme-xs dark:bg-brand-600 dark:hover:bg-brand-700"
        >
          Search
        </button>
      </form>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-12 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
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
              <div className="relative group inline-block">
                <button
                  onClick={handleCreateClick}
                  disabled={isButtonDisabled}
                  className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-theme-xs ${
                    isButtonDisabled
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700'
                  }`}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Code
                </button>
                {isButtonDisabled && credentialCodeLimitMessage && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 max-w-xs">
                    {credentialCodeLimitMessage}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                    </div>
                  </div>
                )}
              </div>
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

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of{' '}
                    <span className="font-medium">{meta.total}</span> codes
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(meta.page - 1)}
                      disabled={!meta.hasPreviousPage}
                      className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(meta.page + 1)}
                      disabled={!meta.hasNextPage}
                      className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
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
            queryClient.invalidateQueries({ queryKey: ['credential-codes', currentWorkspace?.workspaceId] });
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

