import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAdminDevices, useAdminWorkspacesList, useAdminDeviceTypesList } from '../api/adminApi';
import { MultiSelectDropdown } from '../components/MultiSelectDropdown';
import type { GetAdminDevicesFilters, AdminDevice } from '../../../api/endpoints/admin';

export const AdminDevicesPage = () => {
  const [filters, setFilters] = useState<GetAdminDevicesFilters>({
    page: 1,
    limit: 10,
  });

  // Search states for dropdowns
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [deviceTypeSearch, setDeviceTypeSearch] = useState('');

  const { data, isLoading } = useAdminDevices(filters);
  const { data: workspacesListData } = useAdminWorkspacesList(workspaceSearch);
  const { data: deviceTypesListData } = useAdminDeviceTypesList({ search: deviceTypeSearch });

  // Parse selected values from comma-separated strings or arrays
  const selectedDeviceTypeIds = useMemo(() => {
    if (!filters.deviceTypeId) return [];
    return Array.isArray(filters.deviceTypeId) ? filters.deviceTypeId : filters.deviceTypeId.split(',').map((d) => d.trim()).filter((d) => d);
  }, [filters.deviceTypeId]);

  const selectedWorkspaceIds = useMemo(() => {
    if (!filters.workspaceId) return [];
    return Array.isArray(filters.workspaceId) ? filters.workspaceId : filters.workspaceId.split(',').map((w) => w.trim()).filter((w) => w);
  }, [filters.workspaceId]);

  // Prepare options for multi-select
  const workspaceOptions = useMemo(() => {
    return (workspacesListData?.workspaces || []).map((workspace) => ({
      value: workspace.id,
      label: workspace.name,
    }));
  }, [workspacesListData]);

  const deviceTypeOptions = useMemo(() => {
    return (deviceTypesListData?.deviceTypes || []).map((deviceType) => ({
      value: deviceType.id,
      label: deviceType.name,
    }));
  }, [deviceTypesListData]);

  const handleNameChange = (name: string) => {
    const trimmedName = name.trim();
    setFilters((prev) => ({ 
      ...prev, 
      name: trimmedName || undefined, 
      page: 1 
    }));
  };

  const handleUuidChange = (uuid: string) => {
    const trimmedUuid = uuid.trim();
    setFilters((prev) => ({ 
      ...prev, 
      uuid: trimmedUuid || undefined, 
      page: 1 
    }));
  };

  const handleDeviceTypeChange = (selectedTypeIds: string[]) => {
    setFilters((prev) => ({
      ...prev,
      deviceTypeId: selectedTypeIds.length > 0 ? selectedTypeIds : undefined,
      page: 1,
    }));
  };

  const handleWorkspaceChange = (selectedWorkspaceIds: string[]) => {
    setFilters((prev) => ({
      ...prev,
      workspaceId: selectedWorkspaceIds.length > 0 ? selectedWorkspaceIds : undefined,
      page: 1,
    }));
  };

  const handleStatusChange = (isActive: string) => {
    setFilters((prev) => ({
      ...prev,
      isActive: isActive === 'all' ? undefined : isActive === 'active' ? true : false,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10 });
    setWorkspaceSearch('');
    setDeviceTypeSearch('');
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.name ||
      filters.uuid ||
      filters.deviceTypeId ||
      filters.workspaceId ||
      filters.isActive !== undefined
    );
  }, [filters]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Devices</h2>
        <p className="text-gray-600 mt-1">Manage all devices across all workspaces</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Name Search */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.name || ''}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
          </div>

          {/* UUID Search */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">UUID</label>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by UUID..."
                value={filters.uuid || ''}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                onChange={(e) => handleUuidChange(e.target.value)}
              />
            </div>
          </div>

          {/* Device Type (Multi-select) */}
          <div className="w-full min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
            <MultiSelectDropdown
              options={deviceTypeOptions}
              selectedValues={selectedDeviceTypeIds}
              onChange={handleDeviceTypeChange}
              placeholder="Select device types..."
              searchable
              onSearchChange={setDeviceTypeSearch}
              searchValue={deviceTypeSearch}
            />
          </div>

          {/* Workspace (Multi-select) */}
          <div className="w-full min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Workspace</label>
            <MultiSelectDropdown
              options={workspaceOptions}
              selectedValues={selectedWorkspaceIds}
              onChange={handleWorkspaceChange}
              placeholder="Select workspaces..."
              searchable
              onSearchChange={setWorkspaceSearch}
              searchValue={workspaceSearch}
            />
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
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UUID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workspace
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No devices found
                    </td>
                  </tr>
                ) : (
                  data?.items.map((device: AdminDevice) => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {device.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {device.uuid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {device.deviceTypeName || device.deviceTypeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {device.workspaceName || device.workspaceId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {device.zoneName || device.zoneId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            device.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {device.isActive ? 'Active' : 'Inactive'}
                        </span>
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
