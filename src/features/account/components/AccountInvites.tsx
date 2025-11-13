import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAccountInvites, useDeclineInvitation, useAcceptInvitation } from '../api/inviteApi';
import { InviteStatus } from '../../../api/endpoints/accountInvites';
import { Mail, Calendar, MapPin, Clock, Check, X, History } from 'lucide-react';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
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
  const [declineConfirm, setDeclineConfirm] = useState<{
    isOpen: boolean;
    invitationId: string;
    zoneName: string;
  }>({
    isOpen: false,
    invitationId: '',
    zoneName: '',
  });
  const [acceptConfirm, setAcceptConfirm] = useState<{
    isOpen: boolean;
    invitationId: string;
    zoneName: string;
  }>({
    isOpen: false,
    invitationId: '',
    zoneName: '',
  });

  const { data: invites, isLoading, error } = useAccountInvites({
    status: selectedStatus,
  });

  const declineMutation = useDeclineInvitation();
  const acceptMutation = useAcceptInvitation();

  const handleDeclineInvitation = (invitationId: string, zoneName: string) => {
    setDeclineConfirm({ isOpen: true, invitationId, zoneName });
  };

  const handleConfirmDecline = async () => {
    const { invitationId } = declineConfirm;
    if (!invitationId) return;

    const toastId = toast.loading('Declining invitation...');
    
    try {
      await declineMutation.mutateAsync(invitationId);
      toast.success('Invitation declined', { id: toastId });
    } catch (error: any) {
      console.error('Failed to decline invitation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to decline invitation';
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleAcceptInvitation = (invitationId: string, zoneName: string) => {
    setAcceptConfirm({ isOpen: true, invitationId, zoneName });
  };

  const handleConfirmAccept = async () => {
    const { invitationId, zoneName } = acceptConfirm;
    if (!invitationId) return;

    const toastId = toast.loading('Accepting invitation...');
    
    try {
      await acceptMutation.mutateAsync(invitationId);
      toast.success(`Invitation accepted! You are now a member of ${zoneName}.`, { id: toastId, duration: 5000 });
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to accept invitation';
      toast.error(errorMessage, { id: toastId });
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
    <>
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
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-2">
          My Invitations
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View and manage your workspace invitations
        </p>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-5 mb-6 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Status:
          </label>
          <select
            value={selectedStatus || ''}
            onChange={(e) =>
              setSelectedStatus(
                e.target.value ? (e.target.value as InviteStatus) : undefined,
              )
            }
            className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="">All Invites</option>
            <option value={InviteStatus.PENDING}>Pending</option>
            <option value={InviteStatus.ACCEPTED}>Accepted</option>
            <option value={InviteStatus.DECLINED}>Declined</option>
            <option value={InviteStatus.EXPIRED}>Expired</option>
            <option value={InviteStatus.CANCELLED}>Cancelled</option>
          </select>
          {invites && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {invites.length} invitation(s) found
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="animate-pulse flex items-start space-x-4">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-4">
          <p className="text-error-800 dark:text-error-400 font-medium">❌ Failed to load invitations</p>
          <p className="text-error-600 dark:text-error-500 text-sm mt-1">{error.message}</p>
        </div>
      )}

      {/* Invites List */}
      {!isLoading && !error && invites && (
        <>
          {invites.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-12 text-center border border-gray-200 dark:border-gray-800">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Mail className="h-10 w-10 text-gray-400 dark:text-gray-600" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">
                No invitations found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedStatus
                  ? `You don't have any ${selectedStatus.toLowerCase()} invitations.`
                  : "You haven't received any workspace invitations yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-6 border border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
                >
                  <div className="flex items-start justify-between">
                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center ring-1 ring-brand-100 dark:ring-brand-900">
                            <MapPin className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 truncate">
                            {invite.zoneName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Mail className="h-4 w-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{invite.email}</span>
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <span className="font-medium mr-1">Created:</span>
                          <span className="text-gray-700 dark:text-gray-300">{formatDate(invite.createdAt)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <span className="font-medium mr-1">Expires:</span>
                          <span
                            className={
                              isExpired(invite.expireAt)
                                ? 'text-error-600 dark:text-error-400 font-medium'
                                : 'text-gray-700 dark:text-gray-300'
                            }
                          >
                            {formatDate(invite.expireAt)}
                          </span>
                        </div>
                      </div>

                      {/* Temporary Access */}
                      {invite.tempBeginAt && invite.tempEndAt && (
                        <div className="mt-3 p-3 bg-brand-50 dark:bg-brand-950 rounded-lg border border-brand-200 dark:border-brand-900">
                          <p className="text-xs font-medium text-brand-800 dark:text-brand-400 mb-1">
                            Temporary Access Period:
                          </p>
                          <p className="text-xs text-brand-700 dark:text-brand-500">
                            {formatDate(invite.tempBeginAt)} → {formatDate(invite.tempEndAt)}
                          </p>
                        </div>
                      )}

                      {/* Roles & Permissions */}
                      {(invite.roles || invite.permissions) && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {invite.roles && (
                            <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Roles: </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                {JSON.stringify(invite.roles)}
                              </span>
                            </div>
                          )}
                          {invite.permissions && (
                            <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Permissions: </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                {JSON.stringify(invite.permissions)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
                          invite.status,
                        )} dark:bg-opacity-20`}
                      >
                        {invite.status}
                      </span>
                      {!invite.isActive && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 flex items-center justify-between pt-5 border-t border-gray-200 dark:border-gray-800">
                    {/* History Button */}
                    <button
                      onClick={() => handleViewHistory(invite.zoneId, invite.zoneName)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-900 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
                      title="View invitation history from this workspace"
                    >
                      <History className="h-4 w-4 mr-2" />
                      History
                    </button>

                    {/* Accept/Decline Buttons */}
                    {invite.status === InviteStatus.PENDING && !isExpired(invite.expireAt) && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDeclineInvitation(invite.id, invite.zoneName)}
                          disabled={declineMutation.isPending || acceptMutation.isPending}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-error-700 dark:text-error-400 bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-900 rounded-lg hover:bg-error-100 dark:hover:bg-error-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </button>
                        <button
                          onClick={() => handleAcceptInvitation(invite.id, invite.zoneName)}
                          disabled={declineMutation.isPending || acceptMutation.isPending}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-success-600 dark:bg-success-700 border border-success-600 dark:border-success-700 rounded-lg hover:bg-success-700 dark:hover:bg-success-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-theme-xs"
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
      {/* Decline Confirmation Dialog */}
      <ConfirmDialog
        isOpen={declineConfirm.isOpen}
        onClose={() => setDeclineConfirm({ isOpen: false, invitationId: '', zoneName: '' })}
        onConfirm={handleConfirmDecline}
        title="Decline Invitation"
        message={`Are you sure you want to decline the invitation from "${declineConfirm.zoneName}"?`}
        confirmText="Decline"
        cancelText="Keep"
        variant="warning"
      />

      {/* Accept Confirmation Dialog */}
      <ConfirmDialog
        isOpen={acceptConfirm.isOpen}
        onClose={() => setAcceptConfirm({ isOpen: false, invitationId: '', zoneName: '' })}
        onConfirm={handleConfirmAccept}
        title="Accept Invitation"
        message={`Accept the invitation from "${acceptConfirm.zoneName}"? You will become a member of this workspace.`}
        confirmText="Accept"
        cancelText="Cancel"
        variant="info"
      />
    </>
  );
};

