import { useState } from 'react';
import { History, ArrowRight, ArrowLeft } from 'lucide-react';
import { useWorkspaceAccessHistory } from '../api/workspaceLicenseApi';

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
  });
};

const formatTime = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

interface WorkspaceAccessHistoryProps {
  workspaceId: string;
}

export const WorkspaceAccessHistory = ({ workspaceId }: WorkspaceAccessHistoryProps) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading, error } = useWorkspaceAccessHistory(workspaceId, page, limit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 dark:border-brand-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-4">
        <p className="text-error-800 dark:text-error-400">
          Failed to load access history
        </p>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <History className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
          No Access History
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No access logs found for this workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <div className="bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center">
            <History className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-brand-700 dark:text-brand-300">
              Total Access Logs
            </div>
            <div className="text-2xl font-bold text-brand-900 dark:text-brand-100">
              {data.total.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Access History Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-theme-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.items.map((item) => (
                <tr 
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* Entry/Exit Type */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.isEntry
                        ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300'
                        : 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300'
                    }`}>
                      {item.isEntry ? (
                        <>
                          <ArrowRight className="w-3 h-3" />
                          <span>Entry</span>
                        </>
                      ) : (
                        <>
                          <ArrowLeft className="w-3 h-3" />
                          <span>Exit</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Account */}
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-800 dark:text-white/90">
                      {item.accountEmail}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {item.accountId.substring(0, 8)}...
                    </div>
                  </td>

                  {/* Zone */}
                  <td className="px-4 py-3">
                    {item.zoneName ? (
                      <div className="text-sm text-gray-800 dark:text-white/90">
                        {item.zoneName}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-600 italic">
                        No zone
                      </span>
                    )}
                  </td>

                  {/* Device/Sensor */}
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-800 dark:text-white/90">
                      {item.actuatorSensorName}
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-800 dark:text-white/90">
                      {formatDate(item.createdAt)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(item.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} records
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {data.totalPages}
              </div>
              
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

