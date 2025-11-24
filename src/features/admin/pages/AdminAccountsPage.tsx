import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAdminAccounts, useAdminEmails, useAdminWorkspacesList } from '../api/adminApi';
import { MultiSelectDropdown } from '../components/MultiSelectDropdown';
import type { GetAdminAccountsFilters, AdminAccount } from '../../../api/endpoints/admin';

// Account Types Enum
enum AccountType {
  REGULAR = '1',
  CREDENTIAL_CODE = '2',
}

const ACCOUNT_TYPE_NAMES: Record<string, string> = {
  '1': 'Regular',
  '2': 'Credential Code',
};

export const AdminAccountsPage = () => {
  const [filters, setFilters] = useState<GetAdminAccountsFilters>({
    page: 1,
    limit: 10,
  });

  // Email and workspace search states
  const [emailSearch, setEmailSearch] = useState('');
  const [workspaceSearch, setWorkspaceSearch] = useState('');

  const { data, isLoading } = useAdminAccounts(filters);
  const { data: emailsData, isLoading: emailsLoading } = useAdminEmails(emailSearch);
  const { data: workspacesListData, isLoading: workspacesListLoading } = useAdminWorkspacesList(workspaceSearch);

  // Parse selected emails and workspaces from comma-separated strings
  const selectedEmails = useMemo(() => {
    return filters.email ? filters.email.split(',').map((e) => e.trim()).filter((e) => e) : [];
  }, [filters.email]);

  const selectedWorkspaceIds = useMemo(() => {
    return filters.workspaceId ? filters.workspaceId.split(',').map((w) => w.trim()).filter((w) => w) : [];
  }, [filters.workspaceId]);

  // Prepare options for multi-select
  const emailOptions = useMemo(() => {
    return (emailsData || []).map((email) => ({ value: email, label: email }));
  }, [emailsData]);

  const workspaceOptions = useMemo(() => {
    return (workspacesListData?.workspaces || []).map((workspace) => ({
      value: workspace.id,
      label: workspace.name,
    }));
  }, [workspacesListData]);

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleEmailChange = (emails: string[]) => {
    setFilters((prev) => ({
      ...prev,
      email: emails.length > 0 ? emails.join(',') : undefined,
      page: 1,
    }));
  };

  const handleAccountTypeChange = (accountTypeId: string) => {
    setFilters((prev) => ({ ...prev, accountTypeId: accountTypeId || undefined, page: 1 }));
  };

  const handleStatusChange = (isActive: string) => {
    setFilters((prev) => ({
      ...prev,
      isActive: isActive === 'all' ? undefined : isActive === 'active',
      page: 1,
    }));
  };

  const handleSuperAdminChange = (isSuperAdmin: string) => {
    setFilters((prev) => ({
      ...prev,
      isSuperAdmin: isSuperAdmin === 'all' ? undefined : isSuperAdmin === 'true',
      page: 1,
    }));
  };

  const handleWorkspaceChange = (workspaceIds: string[]) => {
    setFilters((prev) => ({
      ...prev,
      workspaceId: workspaceIds.length > 0 ? workspaceIds.join(',') : undefined,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10 });
    setEmailSearch('');
    setWorkspaceSearch('');
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      filters.email ||
      filters.accountTypeId ||
      filters.isActive !== undefined ||
      filters.isSuperAdmin !== undefined ||
      filters.workspaceId
    );
  }, [filters]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Accounts</h2>
        <p className="text-gray-600 mt-1">Manage all user accounts</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Email Search (String Input) */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Search</label>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email..."
                value={filters.search || ''}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Email (Multi-Select) */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Multi-Select)</label>
            <MultiSelectDropdown
              options={emailOptions}
              selectedValues={selectedEmails}
              onChange={handleEmailChange}
              placeholder="Select emails..."
              searchable
              onSearchChange={setEmailSearch}
              searchValue={emailSearch}
              isLoading={emailsLoading}
            />
          </div>

          {/* Account Type */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select
              value={filters.accountTypeId || ''}
              onChange={(e) => handleAccountTypeChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              {Object.entries(AccountType).map(([key, value]) => (
                <option key={value} value={value}>
                  {ACCOUNT_TYPE_NAMES[value] || key}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={
                filters.isActive === undefined
                  ? 'all'
                  : filters.isActive
                  ? 'active'
                  : 'inactive'
              }
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Super Admin */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Super Admin</label>
            <select
              value={
                filters.isSuperAdmin === undefined
                  ? 'all'
                  : filters.isSuperAdmin
                  ? 'true'
                  : 'false'
              }
              onChange={(e) => handleSuperAdminChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Workspace (Multi-Select) */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Workspace (Multi-Select)</label>
            <MultiSelectDropdown
              options={workspaceOptions}
              selectedValues={selectedWorkspaceIds}
              onChange={handleWorkspaceChange}
              placeholder="Select workspaces..."
              searchable
              onSearchChange={setWorkspaceSearch}
              searchValue={workspaceSearch}
              isLoading={workspacesListLoading}
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Super Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workspaces
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No accounts found
                    </td>
                  </tr>
                ) : (
                  data?.items.map((account: AdminAccount) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {account.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.accountTypeName || ACCOUNT_TYPE_NAMES[account.accountTypeId] || account.accountTypeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            account.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {account.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.isSuperAdmin ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {account.workspaces.length === 0 ? (
                          <span className="text-gray-400 italic">No workspaces</span>
                        ) : (
                          <div className="flex flex-wrap gap-2 max-w-md">
                            {account.workspaces.slice(0, 3).map((ws, idx) => (
                              <div
                                key={ws.workspaceId || idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200"
                                title={`${ws.workspaceName || ws.workspaceId} (${ws.accountType || 'N/A'})`}
                              >
                                <span className="truncate max-w-[120px]">
                                  {ws.workspaceName || ws.workspaceId.substring(0, 8) + '...'}
                                </span>
                                {ws.accountType && (
                                  <span className="px-1 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-semibold">
                                    {ws.accountType}
                                  </span>
                                )}
                              </div>
                            ))}
                            {account.workspaces.length > 3 && (
                              <div className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium border border-gray-300">
                                +{account.workspaces.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.lastLoginAt
                          ? new Date(account.lastLoginAt).toLocaleDateString()
                          : 'Never'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {data?.meta && data.meta.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={filters.page === data.meta.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(data.meta.page - 1) * data.meta.limit + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(data.meta.page * data.meta.limit, data.meta.total)}
                      </span>{' '}
                      of <span className="font-medium">{data.meta.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(filters.page! - 1)}
                        disabled={filters.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        Page {data.meta.page} of {data.meta.totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(filters.page! + 1)}
                        disabled={filters.page === data.meta.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
