import React from 'react';
import { X, Clock, UserX } from 'lucide-react';
import { useAccountHistory } from '../api/accountApi';

interface MemberHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  accountId: string;
  accountName: string;
  accountEmail: string;
}

const MemberHistoryDialog: React.FC<MemberHistoryDialogProps> = ({
  isOpen,
  onClose,
  workspaceId,
  accountId,
  accountName,
  accountEmail,
}) => {
  const { data: history, isLoading, error } = useAccountHistory(
    workspaceId,
    accountId
  );

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success-100 text-success-800 dark:bg-success-950 dark:text-success-400 border-success-200 dark:border-success-900';
      case 'REMOVED':
        return 'bg-error-100 text-error-800 dark:bg-error-950 dark:text-error-400 border-error-200 dark:border-error-900';
      case 'SUSPENDED':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-950 dark:text-warning-400 border-warning-200 dark:border-warning-900';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case 'primaryOwner':
        return 'Primary Owner';
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-950 dark:to-brand-900">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white/90">
              Membership History
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {accountName} ({accountEmail})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-brand-600 dark:border-brand-400"></div>
            </div>
          )}

          {error && (
            <div className="bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-4">
              <p className="text-error-800 dark:text-error-400 font-medium">Failed to load history</p>
            </div>
          )}

          {!isLoading && !error && history && history.length === 0 && (
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <UserX className="h-10 w-10 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">
                No History Found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This member has no previous membership records.
              </p>
            </div>
          )}

          {!isLoading && !error && history && history.length > 0 && (
            <div className="space-y-4">
              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-gradient-to-b from-brand-300 to-gray-200 dark:from-brand-700 dark:to-gray-700" />

                {/* Timeline items */}
                {history.map((record, index) => (
                  <div key={record.id} className="relative pl-14 pb-6 last:pb-0">
                    {/* Timeline dot */}
                    <div className="absolute left-3 top-2 h-5 w-5 rounded-full bg-brand-500 dark:bg-brand-600 border-4 border-white dark:border-gray-900 shadow-lg ring-2 ring-brand-100 dark:ring-brand-900" />

                    {/* Card */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-800 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded border ${getStatusBadgeColor(
                                  record.status
                                )}`}
                              >
                                {record.status}
                              </span>
                              <span className="px-2 py-1 text-xs font-medium rounded border bg-blue-50 text-blue-700 border-blue-200">
                                {getAccountTypeBadge(record.accountType)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {/* Joined Date */}
                          <div>
                            <p className="text-gray-600 mb-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Joined
                            </p>
                            <p className="text-gray-900 font-medium">
                              {formatDate(record.createdAt)}
                            </p>
                          </div>

                          {/* Removed Date */}
                          <div>
                            <p className="text-gray-600 mb-1 flex items-center gap-1">
                              <UserX className="h-3 w-3" />
                              Removed
                            </p>
                            <p className="text-gray-900 font-medium">
                              {formatDate(record.deletedAt)}
                            </p>
                          </div>

                          {/* Temporary Access (if exists) */}
                          {(record.startAt || record.endAt) && (
                            <>
                              <div>
                                <p className="text-gray-600 mb-1">Start Date</p>
                                <p className="text-gray-900 font-medium">
                                  {record.startAt
                                    ? formatDate(record.startAt)
                                    : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 mb-1">End Date</p>
                                <p className="text-gray-900 font-medium">
                                  {record.endAt ? formatDate(record.endAt) : 'N/A'}
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Duration */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-600">
                            Duration:{' '}
                            <span className="font-medium text-gray-900">
                              {(() => {
                                const start = new Date(record.createdAt);
                                const end = new Date(record.deletedAt);
                                const days = Math.floor(
                                  (end.getTime() - start.getTime()) /
                                    (1000 * 60 * 60 * 24)
                                );
                                if (days === 0) return 'Less than 1 day';
                                if (days === 1) return '1 day';
                                return `${days} days`;
                              })()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberHistoryDialog;

