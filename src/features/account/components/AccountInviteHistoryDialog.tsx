import React from "react";
import { X, Clock, Mail, CheckCircle, XCircle, Ban, Building2 } from "lucide-react";
import { useAccountInviteHistory } from "../api/inviteApi";

interface AccountInviteHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
}

const AccountInviteHistoryDialog: React.FC<AccountInviteHistoryDialogProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
}) => {
  const { data: history, isLoading, error } = useAccountInviteHistory(workspaceId);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "DECLINED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "CANCELLED":
        return <Ban className="h-4 w-4 text-gray-600" />;
      case "EXPIRED":
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Mail className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-200";
      case "DECLINED":
        return "bg-red-100 text-red-800 border-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "EXPIRED":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "PENDING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white/90">
                Invitation History
              </h2>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {workspaceName}
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
                <p className="text-red-800">Failed to load invitation history</p>
              </div>
            )}

            {!isLoading && !error && history && history.length === 0 && (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No History Found
                </h3>
                <p className="text-gray-600">
                  There are no previous invitation records from this workspace.
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
                  {history.map((record) => (
                    <div key={record.id} className="relative pl-12 pb-8">
                      {/* Timeline dot */}
                      <div className="absolute left-2 top-2 h-4 w-4 rounded-full bg-blue-600 border-4 border-white shadow" />

                      {/* Card */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded border ${getStatusBadgeColor(
                                record.status
                              )}`}
                            >
                              {record.status}
                            </span>
                            {!record.isActive && (
                              <span className="px-2 py-1 text-xs font-medium rounded border bg-gray-100 text-gray-600 border-gray-200">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {/* Sent Date */}
                          <div>
                            <p className="text-gray-600 mb-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Received
                            </p>
                            <p className="text-gray-900 font-medium">
                              {formatDate(record.createdAt)}
                            </p>
                          </div>

                          {/* Expire Date */}
                          <div>
                            <p className="text-gray-600 mb-1">Expires</p>
                            <p className="text-gray-900 font-medium">
                              {formatDate(record.expireAt)}
                            </p>
                          </div>

                          {/* Accepted Date (if accepted) */}
                          {record.acceptedAt && (
                            <div>
                              <p className="text-gray-600 mb-1 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Accepted
                              </p>
                              <p className="text-gray-900 font-medium">
                                {formatDate(record.acceptedAt)}
                              </p>
                            </div>
                          )}

                          {/* Cancelled/Deleted Date */}
                          <div>
                            <p className="text-gray-600 mb-1 flex items-center gap-1">
                              <Ban className="h-3 w-3" />
                              {record.status === "DECLINED" ? "Declined" : "Cancelled"}
                            </p>
                            <p className="text-gray-900 font-medium">
                              {formatDate(record.deletedAt)}
                            </p>
                          </div>

                          {/* Temporary Access (if exists) */}
                          {(record.tempBeginAt || record.tempEndAt) && (
                            <>
                              <div>
                                <p className="text-gray-600 mb-1">
                                  Access Start
                                </p>
                                <p className="text-gray-900 font-medium">
                                  {record.tempBeginAt
                                    ? formatDate(record.tempBeginAt)
                                    : "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 mb-1">Access End</p>
                                <p className="text-gray-900 font-medium">
                                  {record.tempEndAt
                                    ? formatDate(record.tempEndAt)
                                    : "N/A"}
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Duration */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-600">
                            Duration:{" "}
                            <span className="font-medium text-gray-900">
                              {(() => {
                                const start = new Date(record.createdAt);
                                const end = new Date(record.deletedAt);
                                const days = Math.floor(
                                  (end.getTime() - start.getTime()) /
                                    (1000 * 60 * 60 * 24)
                                );
                                if (days === 0) return "Less than 1 day";
                                if (days === 1) return "1 day";
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

export default AccountInviteHistoryDialog;

