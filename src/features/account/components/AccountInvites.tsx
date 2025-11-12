import { useState } from 'react';
import { useAccountInvites, useDeclineInvitation, useAcceptInvitation } from '../api/inviteApi';
import { InviteStatus } from '../../../api/endpoints/accountInvites';
import { Mail, Calendar, MapPin, Clock, Check, X, History } from 'lucide-react';
import AccountInviteHistoryDialog from './AccountInviteHistoryDialog';

export const AccountInvites = () => {
  const [selectedStatus, setSelectedStatus] = useState<InviteStatus | undefined>(
    undefined,
  );
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean;
    workspaceId: string;
    workspaceName: string;
  }>({
    isOpen: false,
    workspaceId: '',
    workspaceName: '',
  });

  const { data: invites, isLoading, error } = useAccountInvites({
    status: selectedStatus,
  });

  const declineMutation = useDeclineInvitation();
  const acceptMutation = useAcceptInvitation();

  const handleDeclineInvitation = async (invitationId: string, zoneName: string) => {
    if (!confirm(`Are you sure you want to decline the invitation from "${zoneName}"?`)) {
      return;
    }

    try {
      await declineMutation.mutateAsync(invitationId);
      alert('❌ Invitation declined');
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      alert('❌ Failed to decline invitation');
    }
  };

  const handleAcceptInvitation = async (invitationId: string, zoneName: string) => {
    if (!confirm(`Accept the invitation from "${zoneName}"? You will become a member of this workspace.`)) {
      return;
    }

    try {
      await acceptMutation.mutateAsync(invitationId);
      alert('✨ Invitation accepted! You are now a member of the workspace.');
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      alert('❌ Failed to accept invitation');
    }
  };

  const handleViewHistory = (workspaceId: string, workspaceName: string) => {
    setHistoryDialog({
      isOpen: true,
      workspaceId,
      workspaceName,
    });
  };

  const getStatusColor = (status: InviteStatus) => {
    switch (status) {
      case InviteStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case InviteStatus.ACCEPTED:
        return 'bg-green-100 text-green-800 border-green-200';
      case InviteStatus.DECLINED:
        return 'bg-red-100 text-red-800 border-red-200';
      case InviteStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case InviteStatus.CANCELLED:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expireAt: string) => {
    return new Date(expireAt) < new Date();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* History Dialog */}
      <AccountInviteHistoryDialog
        isOpen={historyDialog.isOpen}
        onClose={() =>
          setHistoryDialog({
            isOpen: false,
            workspaceId: '',
            workspaceName: '',
          })
        }
        workspaceId={historyDialog.workspaceId}
        workspaceName={historyDialog.workspaceName}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Invitations</h1>
        <p className="mt-2 text-sm text-gray-600">
          View and manage your workspace invitations
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            value={selectedStatus || ''}
            onChange={(e) =>
              setSelectedStatus(
                e.target.value ? (e.target.value as InviteStatus) : undefined,
              )
            }
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            <option value="">All Invites</option>
            <option value={InviteStatus.PENDING}>Pending</option>
            <option value={InviteStatus.ACCEPTED}>Accepted</option>
            <option value={InviteStatus.DECLINED}>Declined</option>
            <option value={InviteStatus.EXPIRED}>Expired</option>
            <option value={InviteStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-gray-300 rounded"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">❌ Failed to load invitations</p>
          <p className="text-red-600 text-sm mt-1">{error.message}</p>
        </div>
      )}

      {/* Invites List */}
      {!isLoading && !error && invites && (
        <>
          {invites.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-12 text-center border border-gray-200">
              <Mail className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No invitations found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {selectedStatus
                  ? `You don't have any ${selectedStatus.toLowerCase()} invitations.`
                  : "You haven't received any workspace invitations yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {invite.zoneName}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Mail className="h-4 w-4 mr-1" />
                            {invite.email}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium mr-1">Created:</span>
                          {formatDate(invite.createdAt)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium mr-1">Expires:</span>
                          <span
                            className={
                              isExpired(invite.expireAt)
                                ? 'text-red-600 font-medium'
                                : ''
                            }
                          >
                            {formatDate(invite.expireAt)}
                          </span>
                        </div>
                      </div>

                      {/* Temporary Access */}
                      {invite.tempBeginAt && invite.tempEndAt && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
                          <p className="text-xs font-medium text-blue-800 mb-1">
                            Temporary Access Period:
                          </p>
                          <p className="text-xs text-blue-700">
                            {formatDate(invite.tempBeginAt)} →{' '}
                            {formatDate(invite.tempEndAt)}
                          </p>
                        </div>
                      )}

                      {/* Roles & Permissions */}
                      {(invite.roles || invite.permissions) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {invite.roles && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-700">Roles: </span>
                              <span className="text-gray-600">
                                {JSON.stringify(invite.roles)}
                              </span>
                            </div>
                          )}
                          {invite.permissions && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-700">
                                Permissions:{' '}
                              </span>
                              <span className="text-gray-600">
                                {JSON.stringify(invite.permissions)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="ml-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          invite.status,
                        )}`}
                      >
                        {invite.status}
                      </span>
                      {!invite.isActive && (
                        <span className="mt-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
                    {/* History Button - Available for all invitations */}
                    <button
                      onClick={() => handleViewHistory(invite.zoneId, invite.zoneName)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                      title="View invitation history from this workspace"
                    >
                      <History className="h-4 w-4 mr-2" />
                      History
                    </button>

                    {/* Accept/Decline Buttons - Only for PENDING non-expired invitations */}
                    {invite.status === InviteStatus.PENDING && !isExpired(invite.expireAt) && (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleDeclineInvitation(invite.id, invite.zoneName)}
                          disabled={declineMutation.isPending || acceptMutation.isPending}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </button>
                        <button
                          onClick={() => handleAcceptInvitation(invite.id, invite.zoneName)}
                          disabled={declineMutation.isPending || acceptMutation.isPending}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

