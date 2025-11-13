import { useState } from 'react';
import { Edit, Trash2, Search, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Device, GetDevicesFilters } from '../../../api/endpoints/devices';

interface DeviceListProps {
  devices: Device[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  filters: GetDevicesFilters;
  onFiltersChange: (filters: GetDevicesFilters) => void;
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
}

export const DeviceList = ({
  devices,
  meta,
  isLoading,
  filters,
  onFiltersChange,
  onEdit,
  onDelete,
}: DeviceListProps) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchInput, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    onFiltersChange({ ...filters, page: newPage });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by device name or UUID..."
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

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading devices...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="p-12 text-center">
            <Cpu className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700" />
            <h3 className="mt-4 text-sm font-medium text-gray-800 dark:text-white/90">No devices found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filters.search ? 'Try adjusting your search' : 'Create your first device to get started'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      UUID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {devices.map((device) => (
                    <tr
                      key={device.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-brand-100 dark:bg-brand-950 rounded-lg flex items-center justify-center">
                            <Cpu className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                              {device.name}
                            </div>
                            {device.zoneId && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Zone: {device.zoneId}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {device.uuid}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
                          Type {device.deviceTypeId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {device.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(device.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => onEdit(device)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 transition-colors mr-2"
                          title="Edit device"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(device)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-error-50 dark:hover:bg-error-950 text-error-600 dark:text-error-400 transition-colors"
                          title="Delete device"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of{' '}
                <span className="font-medium">{meta.total}</span> devices
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
          </>
        )}
      </div>
    </div>
  );
};

