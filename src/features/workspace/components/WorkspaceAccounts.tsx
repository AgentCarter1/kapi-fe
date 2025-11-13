import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { UserPlus, Trash2, History } from 'lucide-react';
import { getWorkspaceAccounts } from '../../../api/endpoints/workspaceAccounts';
import type { WorkspaceAccountsFilters } from '../../../api/endpoints/workspaceAccounts';
import { useAppSelector } from '../../../store/hooks';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { InviteMemberDialog } from './InviteMemberDialog';
import MemberHistoryDialog from './MemberHistoryDialog';
import { useRemoveAccount } from '../api/accountApi';

export const WorkspaceAccounts = () => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const currentUser = useAppSelector((state) => state.auth.user);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean;
    accountId: string;
    accountName: string;
    accountEmail: string;
  }>({
    isOpen: false,
    accountId: '',
    accountName: '',
    accountEmail: '',
  });
  const [removeConfirm, setRemoveConfirm] = useState<{
    isOpen: boolean;
    accountId: string;
    email: string;
  }>({
    isOpen: false,
    accountId: '',
    email: '',
  });

  const removeMutation = useRemoveAccount(currentWorkspace?.workspaceId || '');

  const [filters, setFilters] = useState<WorkspaceAccountsFilters>({
    page: 1,
    limit: 10,
    status: 'ACTIVE',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['workspace-accounts', currentWorkspace?.workspaceId, filters],
    queryFn: () => getWorkspaceAccounts(currentWorkspace!.workspaceId, filters),
    enabled: !!currentWorkspace?.workspaceId,
  });

  // Sort accounts: Current user first, then others
  const sortedAccounts = useMemo(() => {
    if (!data?.items || !currentUser?.email) return data?.items || [];
    
    const currentUserAccount = data.items.find((acc) => acc.email === currentUser.email);
    const otherAccounts = data.items.filter((acc) => acc.email !== currentUser.email);
    
    return currentUserAccount 
      ? [currentUserAccount, ...otherAccounts]
      : data.items;
  }, [data?.items, currentUser?.email]);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (search: string) => {
    const newFilters: WorkspaceAccountsFilters = { ...filters, page: 1 };
    
    if (search.trim()) {
      newFilters.search = search;
    } else {
      delete newFilters.search;
    }
    
    setFilters(newFilters);
  };

  const handleRemoveAccount = (accountId: string, email: string) => {
    setRemoveConfirm({ isOpen: true, accountId, email });
  };

  const handleConfirmRemove = async () => {
    const { accountId, email } = removeConfirm;
    if (!accountId) return;

    const toastId = toast.loading('Removing member...');

    try {
      await removeMutation.mutateAsync(accountId);
      toast.success(`Member ${email} removed successfully`, { id: toastId });
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove member';
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleViewHistory = (
    accountId: string,
    firstName: string | undefined,
    lastName: string | undefined,
    email: string
  ) => {
    const accountName =
      firstName || lastName
        ? `${firstName || ''} ${lastName || ''}`.trim()
        : 'No name';
    
    setHistoryDialog({
      isOpen: true,
      accountId,
      accountName,
      accountEmail: email,
    });
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
      {/* Header with Invite Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Workspace Members
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage members of <span className="font-semibold text-gray-700 dark:text-gray-300">{currentWorkspace.workspaceName}</span>
          </p>
        </div>
        <button
          onClick={() => setIsInviteDialogOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors shadow-theme-xs dark:bg-brand-600 dark:hover:bg-brand-700"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Invite Member
        </button>
      </div>

      {/* Invite Dialog */}
      {currentWorkspace && (
        <InviteMemberDialog
          isOpen={isInviteDialogOpen}
          onClose={() => setIsInviteDialogOpen(false)}
          workspaceId={currentWorkspace.workspaceId}
        />
      )}

      {/* History Dialog */}
      <MemberHistoryDialog
        isOpen={historyDialog.isOpen}
        onClose={() =>
          setHistoryDialog({
            isOpen: false,
            accountId: '',
            accountName: '',
            accountEmail: '',
          })
        }
        workspaceId={currentWorkspace?.workspaceId || ''}
        accountId={historyDialog.accountId}
        accountName={historyDialog.accountName}
        accountEmail={historyDialog.accountEmail}
      />

      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-5 mb-6 border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by email or name..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => {
                const newFilters: WorkspaceAccountsFilters = { ...filters, page: 1 };
                if (e.target.value) {
                  newFilters.status = e.target.value;
                } else {
                  delete newFilters.status;
                }
                setFilters(newFilters);
              }}
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PASSIVE">Passive</option>
              <option value="OUTDATED">Outdated</option>
              <option value="LEFT">Left</option>
              <option value="REMOVED">Removed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={filters.accountType || ''}
              onChange={(e) => {
                const newFilters: WorkspaceAccountsFilters = { ...filters, page: 1 };
                if (e.target.value) {
                  newFilters.accountType = e.target.value;
                } else {
                  delete newFilters.accountType;
                }
                setFilters(newFilters);
              }}
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="">All Types</option>
              <option value="primaryOwner">Primary Owner</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </div>
        </div>
        {data && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {data.items.length} of {data.meta.total} members
            </p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-4">
          <p className="text-error-800 dark:text-error-400 font-medium">Failed to load workspace members.</p>
          <p className="text-error-600 dark:text-error-500 text-sm mt-1">{error.message}</p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && data && (
        <>
          {data.items.length === 0 ? (
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">
                No members found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {sortedAccounts.map((account) => {
                      const isCurrentUser = account.email === currentUser?.email;
                      const getRoleBadgeColor = (role: string) => {
                        if (role === 'primaryOwner') return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-900';
                        if (role === 'owner') return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-900';
                        if (role === 'admin') return 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-400 border-brand-200 dark:border-brand-900';
                        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
                      };

                      return (
                        <tr 
                          key={account.id} 
                          className={`transition-colors ${
                            isCurrentUser 
                              ? 'bg-brand-50/50 dark:bg-brand-950/20 hover:bg-brand-50 dark:hover:bg-brand-950/30' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-600 dark:to-brand-700 flex items-center justify-center text-white font-semibold text-sm shadow-theme-xs">
                                  {account.firstName?.[0]?.toUpperCase() || account.email[0].toUpperCase()}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                                  {account.firstName || account.lastName
                                    ? `${account.firstName || ''} ${account.lastName || ''}`.trim()
                                    : 'No name'}
                                  {isCurrentUser && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">{account.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(account.accountType)}`}>
                              {account.accountType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                account.status === 'ACTIVE'
                                  ? 'bg-success-100 text-success-800 dark:bg-success-950 dark:text-success-400 border-success-200 dark:border-success-900'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              {account.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(account.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {/* History Button */}
                              <button
                                onClick={() =>
                                  handleViewHistory(
                                    account.accountId,
                                    account.firstName,
                                    account.lastName,
                                    account.email
                                  )
                                }
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-900 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
                                title="View membership history"
                              >
                                <History className="h-3.5 w-3.5 mr-1" />
                                History
                              </button>

                              {/* Remove Button */}
                              {account.status === 'ACTIVE' && !isCurrentUser && (
                                <button
                                  onClick={() => handleRemoveAccount(account.accountId, account.email)}
                                  disabled={removeMutation.isPending}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-error-700 dark:text-error-400 bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-900 rounded-lg hover:bg-error-100 dark:hover:bg-error-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                                  Remove
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {data.meta.totalPages > 1 && (
            <div className="bg-white dark:bg-gray-900 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 dark:border-gray-800 mt-4 rounded-lg shadow-theme-xs">
              {/* Mobile Pagination */}
              <div className="flex justify-between sm:hidden mb-4 sm:mb-0">
                <button
                  onClick={() => handlePageChange(data.meta.page - 1)}
                  disabled={!data.meta.hasPreviousPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(data.meta.page + 1)}
                  disabled={!data.meta.hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>

              {/* Desktop Pagination */}
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing{' '}
                    <span className="font-semibold">
                      {(data.meta.page - 1) * data.meta.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-semibold">
                      {Math.min(data.meta.page * data.meta.limit, data.meta.total)}
                    </span>{' '}
                    of <span className="font-semibold">{data.meta.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm gap-1">
                    <button
                      onClick={() => handlePageChange(data.meta.page - 1)}
                      disabled={!data.meta.hasPreviousPage}
                      className="relative inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ←
                    </button>
                    {[...Array(Math.min(data.meta.totalPages, 5))].map((_, i) => {
                      let pageNum;
                      if (data.meta.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (data.meta.page <= 3) {
                        pageNum = i + 1;
                      } else if (data.meta.page >= data.meta.totalPages - 2) {
                        pageNum = data.meta.totalPages - 4 + i;
                      } else {
                        pageNum = data.meta.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
                            data.meta.page === pageNum
                              ? 'z-10 bg-brand-50 dark:bg-brand-950 border-brand-500 dark:border-brand-700 text-brand-600 dark:text-brand-400'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(data.meta.page + 1)}
                      disabled={!data.meta.hasNextPage}
                      className="relative inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={removeConfirm.isOpen}
        onClose={() => setRemoveConfirm({ isOpen: false, accountId: '', email: '' })}
        onConfirm={handleConfirmRemove}
        title="Remove Member"
        message={`Are you sure you want to remove ${removeConfirm.email} from this workspace?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

