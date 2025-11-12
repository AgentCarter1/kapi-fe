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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REMOVED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Membership History
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {accountName} ({accountEmail})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Failed to load history</p>
              </div>
            )}

            {!isLoading && !error && history && history.length === 0 && (
              <div className="text-center py-12">
                <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No History Found
                </h3>
                <p className="text-gray-600">
                  This member has no previous membership records.
                </p>
              </div>
            )}

            {!isLoading && !error && history && history.length > 0 && (
              <div className="space-y-4">
                {/* Timeline */}
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />

                  {/* Timeline items */}
                  {history.map((record, index) => (
                    <div key={record.id} className="relative pl-12 pb-8">
                      {/* Timeline dot */}
                      <div className="absolute left-2 top-2 h-4 w-4 rounded-full bg-blue-600 border-4 border-white shadow" />

                      {/* Card */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MemberHistoryDialog;

