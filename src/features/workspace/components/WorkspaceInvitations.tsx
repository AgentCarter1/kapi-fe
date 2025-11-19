import { useState } from 'react';
import { Mail, Calendar, Clock, CheckCircle, XCircle, Ban, HourglassIcon, X as XIcon, History, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWorkspaceInvites, useCancelInvitation } from '../api/invitationApi';
import { useAppSelector } from '../../../store/hooks';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import InvitationHistoryDialog from './InvitationHistoryDialog';

export const WorkspaceInvitations = () => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean;
    email: string;
  }>({
    isOpen: false,
    email: '',
  });
  const [cancelConfirm, setCancelConfirm] = useState<{
    isOpen: boolean;
    invitationId: string;
    email: string;
  }>({
    isOpen: false,
    invitationId: '',
    email: '',
  });

  const { data: invitesData, isLoading, error } = useWorkspaceInvites(
    currentWorkspace?.workspaceId || '',
    { status: selectedStatus, page, limit },
  );

  const invites = invitesData?.items || [];
  const meta = invitesData?.meta;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const cancelMutation = useCancelInvitation(currentWorkspace?.workspaceId || '');

  const handleCancelInvitation = (invitationId: string, email: string) => {
    setCancelConfirm({ isOpen: true, invitationId, email });
  };

  const handleConfirmCancel = async () => {
    const { invitationId, email } = cancelConfirm;
    if (!invitationId) return;

    const toastId = toast.loading('Cancelling invitation...');
    
    try {
      await cancelMutation.mutateAsync(invitationId);
      toast.success(`Invitation for ${email} cancelled successfully`, { id: toastId });
    } catch (error: any) {
      console.error('Failed to cancel invitation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel invitation';
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleViewHistory = (email: string) => {
    setHistoryDialog({
      isOpen: true,
      email,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <HourglassIcon className="h-5 w-5 text-yellow-600" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'DECLINED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'EXPIRED':
        return <Clock className="h-5 w-5 text-gray-600" />;
      case 'CANCELLED':
        return <Ban className="h-5 w-5 text-orange-600" />;
      default:
        return <Mail className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DECLINED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED':
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

  const isExpiringSoon = (expireAt: string, status: string) => {
    // Only show red if status is PENDING and expiring within 3 days
    if (status !== 'PENDING' && status !== 'pending') {
      return false;
    }
    const now = new Date();
    const expireDate = new Date(expireAt);
    const diffInMs = expireDate.getTime() - now.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    // Show red if expiring within 3 days and not expired yet
    return diffInDays > 0 && diffInDays <= 3;
  };

  if (!currentWorkspace) {
    return (
      <div className="bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
        <p className="text-warning-800 dark:text-warning-400">Please select a workspace first.</p>
      </div>
    );
  }

  return (
    <>
      {/* History Dialog */}
      <InvitationHistoryDialog
        isOpen={historyDialog.isOpen}
        onClose={() =>
          setHistoryDialog({
            isOpen: false,
            email: '',
          })
        }
        workspaceId={currentWorkspace?.workspaceId || ''}
        email={historyDialog.email}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-2">
          Workspace Invitations
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage invitations sent from <span className="font-semibold text-gray-700 dark:text-gray-300">{currentWorkspace.workspaceName}</span>
        </p>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-5 mb-6 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</label>
          <select
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value || undefined)}
            className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="">All Invitations</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="DECLINED">Declined</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
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
        <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="animate-pulse p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-4">
          <p className="text-error-800 dark:text-error-400 font-medium">❌ Failed to load invitations</p>
          <p className="text-error-600 dark:text-error-500 text-sm mt-1">{error.message}</p>
        </div>
      )}

      {/* Invitations Table */}
      {!isLoading && !error && invitesData && (
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
                  ? `No ${selectedStatus.toLowerCase()} invitations in this workspace.`
                  : 'This workspace has not sent any invitations yet.'}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Invitee Email
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Expires
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Accepted
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {invites.map((invite) => (
                      <tr 
                        key={invite.id} 
                        className={`transition-colors ${
                          invite.status === 'EXPIRED' || isExpired(invite.expireAt)
                            ? 'bg-gray-50/50 dark:bg-gray-800/30 opacity-75'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {invite.email}
                              </div>
                              {!invite.isActive && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 mt-1">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              invite.status,
                            )} dark:bg-opacity-20`}
                          >
                            {getStatusIcon(invite.status)}
                            <span className="ml-1.5">{invite.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(invite.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={
                              isExpiringSoon(invite.expireAt, invite.status)
                                ? 'text-error-600 dark:text-error-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400'
                            }
                          >
                            {formatDate(invite.expireAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {invite.acceptedAt ? (
                            formatDate(invite.acceptedAt)
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* History Button */}
                            <button
                              onClick={() => handleViewHistory(invite.email)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-900 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
                              title="View invitation history"
                            >
                              <History className="h-3.5 w-3.5 mr-1" />
                              History
                            </button>

                            {/* Cancel Button */}
                            {invite.status === 'PENDING' && !isExpired(invite.expireAt) && (
                              <button
                                onClick={() => handleCancelInvitation(invite.id, invite.email)}
                                disabled={cancelMutation.isPending}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-error-700 dark:text-error-400 bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-900 rounded-lg hover:bg-error-100 dark:hover:bg-error-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <XIcon className="h-3.5 w-3.5 mr-1" />
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of{' '}
                    <span className="font-medium">{meta.total}</span> invitations
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(meta.page - 1)}
                      disabled={!meta.hasPreviousPage}
                      className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(meta.page + 1)}
                      disabled={!meta.hasNextPage}
                      className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    {/* Page Size Selector */}
                    <div className="relative ml-3">
                      <select
                        aria-label="Items per page"
                        value={limit}
                        onChange={(e) => {
                          const newLimit = Number(e.target.value);
                          setLimit(newLimit);
                          setPage(1);
                        }}
                        className="h-8 appearance-none pr-8 pl-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                      >
                        {[1,3,5,10,20,50,100].map((opt) => (
                          <option key={opt} value={opt}>{opt} / page</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Invitation History Dialog */}
      <InvitationHistoryDialog
        isOpen={historyDialog.isOpen}
        onClose={() => setHistoryDialog({ isOpen: false, email: '' })}
        workspaceId={currentWorkspace?.workspaceId || ''}
        email={historyDialog.email}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelConfirm.isOpen}
        onClose={() => setCancelConfirm({ isOpen: false, invitationId: '', email: '' })}
        onConfirm={handleConfirmCancel}
        title="Cancel Invitation"
        message={`Are you sure you want to cancel the invitation for ${cancelConfirm.email}?`}
        confirmText="Cancel Invitation"
        cancelText="Keep Invitation"
        variant="warning"
      />
    </>
  );
};

