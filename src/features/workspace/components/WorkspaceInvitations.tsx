import { useState } from 'react';
import { Mail, Calendar, Clock, CheckCircle, XCircle, Ban, HourglassIcon, X as XIcon, History } from 'lucide-react';
import { useWorkspaceInvites, useCancelInvitation } from '../api/invitationApi';
import { useAppSelector } from '../../../store/hooks';
import InvitationHistoryDialog from './InvitationHistoryDialog';

export const WorkspaceInvitations = () => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean;
    email: string;
  }>({
    isOpen: false,
    email: '',
  });

  const { data: invites, isLoading, error } = useWorkspaceInvites(
    currentWorkspace?.workspaceId || '',
    { status: selectedStatus },
  );

  const cancelMutation = useCancelInvitation(currentWorkspace?.workspaceId || '');

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`Are you sure you want to cancel the invitation for ${email}?`)) {
      return;
    }

    try {
      await cancelMutation.mutateAsync(invitationId);
      alert('🗑️ Invitation cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      alert('❌ Failed to cancel invitation');
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

  if (!currentWorkspace) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please select a workspace first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Workspace Invitations</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage invitations sent from <span className="font-semibold">{currentWorkspace.workspaceName}</span>
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            <option value="">All Invitations</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="DECLINED">Declined</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          {invites && (
            <span className="text-sm text-gray-500">
              {invites.length} invitation(s) found
            </span>
          )}
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

      {/* Invitations Table */}
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
                  ? `No ${selectedStatus.toLowerCase()} invitations in this workspace.`
                  : 'This workspace has not sent any invitations yet.'}
              </p>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invitee Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accepted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {invite.email}
                            </div>
                            {!invite.isActive && (
                              <span className="text-xs text-gray-500">Inactive</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            invite.status,
                          )}`}
                        >
                          {getStatusIcon(invite.status)}
                          <span className="ml-2">{invite.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(invite.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={
                            isExpired(invite.expireAt)
                              ? 'text-red-600 font-medium'
                              : 'text-gray-600'
                          }
                        >
                          {formatDate(invite.expireAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invite.acceptedAt ? (
                          formatDate(invite.acceptedAt)
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          {/* History Button - Available for all invitations */}
                          <button
                            onClick={() => handleViewHistory(invite.email)}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                            title="View invitation history"
                          >
                            <History className="h-3 w-3 mr-1" />
                            History
                          </button>

                          {/* Cancel Button - Only for PENDING invitations */}
                          {invite.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancelInvitation(invite.id, invite.email)}
                              disabled={cancelMutation.isPending}
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <XIcon className="h-3 w-3 mr-1" />
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
          )}
        </>
      )}
    </div>
  );
};

