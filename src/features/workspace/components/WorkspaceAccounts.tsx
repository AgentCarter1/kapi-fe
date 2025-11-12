import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Trash2, History } from 'lucide-react';
import { getWorkspaceAccounts } from '../../../api/endpoints/workspaceAccounts';
import type { WorkspaceAccountsFilters } from '../../../api/endpoints/workspaceAccounts';
import { useAppSelector } from '../../../store/hooks';
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

  const handleRemoveAccount = async (accountId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from this workspace?`)) {
      return;
    }

    try {
      await removeMutation.mutateAsync(accountId);
      alert('🗑️ Member removed successfully');
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('❌ Failed to remove member');
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
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please select a workspace first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Invite Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workspace Members</h1>
        <button
          onClick={() => setIsInviteDialogOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
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

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
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
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PASSIVE">Passive</option>
                <option value="OUTDATED">Outdated</option>
                <option value="LEFT">Left</option>
                <option value="REMOVED">Removed</option>
              </select>
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
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="primaryOwner">Primary Owner</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Failed to load workspace members.</p>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && !error && data && (
            <>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedAccounts.map((account) => (
                      <tr 
                        key={account.id} 
                        className={`hover:bg-gray-50 ${
                          account.email === currentUser?.email ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                {account.firstName?.[0] || account.email[0].toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {account.firstName || account.lastName
                                  ? `${account.firstName || ''} ${account.lastName || ''}`.trim()
                                  : 'No name'}
                                {account.email === currentUser?.email && (
                                  <span className="ml-2 text-xs text-blue-600 font-semibold">(You)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{account.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {account.accountType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              account.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {account.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(account.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            {/* History Button - Available for all members */}
                            <button
                              onClick={() =>
                                handleViewHistory(
                                  account.accountId,
                                  account.firstName,
                                  account.lastName,
                                  account.email
                                )
                              }
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                              title="View membership history"
                            >
                              <History className="h-3 w-3 mr-1" />
                              History
                            </button>

                            {/* Remove Button - Only for active members (not yourself) */}
                            {account.status === 'ACTIVE' && account.email !== currentUser?.email && (
                              <button
                                onClick={() => handleRemoveAccount(account.accountId, account.email)}
                                disabled={removeMutation.isPending}
                                className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Empty State */}
                {data.items.length === 0 && (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {data.meta.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(data.meta.page - 1)}
                      disabled={!data.meta.hasPreviousPage}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(data.meta.page + 1)}
                      disabled={!data.meta.hasNextPage}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">
                          {(data.meta.page - 1) * data.meta.limit + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(data.meta.page * data.meta.limit, data.meta.total)}
                        </span>{' '}
                        of <span className="font-medium">{data.meta.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(data.meta.page - 1)}
                          disabled={!data.meta.hasPreviousPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ←
                        </button>
                        {[...Array(data.meta.totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              data.meta.page === i + 1
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(data.meta.page + 1)}
                          disabled={!data.meta.hasNextPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

