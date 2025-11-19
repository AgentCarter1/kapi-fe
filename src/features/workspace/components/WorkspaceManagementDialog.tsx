import React, { useState, useEffect } from "react";
import { X, Building2, Star, LogOut, Crown, Shield, Users, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { getAccountWorkspaces, type Workspace } from "../../../api/endpoints/workspaces";
import { useLeaveWorkspace, useSetDefaultWorkspace } from "../api/workspaceApi";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";

interface WorkspaceManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to check if workspace access is available
const isWorkspaceAccessAvailable = (workspace: Workspace): boolean => {
  const now = new Date();
  const startDate = workspace.accessStartDate ? new Date(workspace.accessStartDate) : null;
  const endDate = workspace.accessEndDate ? new Date(workspace.accessEndDate) : null;

  if (startDate && now < startDate) {
    return false; // Access hasn't started yet
  }
  if (endDate && now > endDate) {
    return false; // Access has expired
  }
  return true; // Access is available (no time restrictions or within range)
};

// Hook to get countdown timer
const useCountdown = (targetDate: string | null) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      
      setTimeLeft(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

// Helper function to format countdown
const formatCountdown = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} gün ${hours % 24} saat`;
  }
  if (hours > 0) {
    return `${hours} saat ${minutes % 60} dakika`;
  }
  if (minutes > 0) {
    return `${minutes} dakika ${seconds % 60} saniye`;
  }
  return `${seconds} saniye`;
};

// Workspace Item Component with countdown
interface WorkspaceItemProps {
  workspace: Workspace;
  setDefaultMutation: ReturnType<typeof useSetDefaultWorkspace>;
  leaveMutation: ReturnType<typeof useLeaveWorkspace>;
  onSetDefault: (workspace: Workspace) => void;
  onLeave: (workspaceId: string, workspaceName: string, accountType: string) => void;
  getRoleIcon: (accountType: string) => React.ReactNode;
  getRoleBadgeColor: (accountType: string) => string;
  getRoleLabel: (accountType: string) => string;
}

const WorkspaceItemComponent: React.FC<WorkspaceItemProps> = ({
  workspace,
  setDefaultMutation,
  leaveMutation,
  onSetDefault,
  onLeave,
  getRoleIcon,
  getRoleBadgeColor,
  getRoleLabel,
}) => {
  const isAccessAvailable = isWorkspaceAccessAvailable(workspace);
  const countdown = useCountdown(workspace.accessStartDate);
  const isDisabled = !isAccessAvailable && workspace.accessStartDate && countdown !== null;
  return (
    <div
      className={`border rounded-xl p-5 transition-all ${
        workspace.isDefault
          ? "border-brand-300 dark:border-brand-700 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/50 dark:to-brand-900/30 shadow-lg"
          : isDisabled
          ? "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-75"
          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-800"
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Workspace Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-600 dark:to-brand-700 flex items-center justify-center shadow-theme-xs flex-shrink-0">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white/90 truncate">
                {workspace.workspaceName}
              </h3>
              {workspace.isDefault && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-400 border-brand-200 dark:border-brand-900 mt-1">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Default
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              {getRoleIcon(workspace.accountType)}
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(
                  workspace.accountType
                )}`}
              >
                {getRoleLabel(workspace.accountType)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status:</span>
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                  workspace.status === "ACTIVE"
                    ? "bg-success-100 text-success-800 dark:bg-success-950 dark:text-success-400 border-success-200 dark:border-success-900"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                }`}
              >
                {workspace.status}
              </span>
            </div>
          </div>
          
          {/* Access Time Information */}
          {isDisabled && countdown !== null && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                ⏳ Erişim {formatCountdown(countdown)} sonra başlayacak
              </span>
            </div>
          )}
          {!isAccessAvailable && workspace.accessEndDate && new Date() > new Date(workspace.accessEndDate) && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                ❌ Erişim süresi doldu
              </span>
            </div>
          )}
          {workspace.accessStartDate && workspace.accessEndDate && isAccessAvailable && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                📅 Erişim: {new Date(workspace.accessStartDate).toLocaleDateString('tr-TR')} - {new Date(workspace.accessEndDate).toLocaleDateString('tr-TR')}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 ml-4">
          {/* Set Default Button */}
          {!workspace.isDefault && (
            <button
              onClick={() => onSetDefault(workspace)}
              disabled={setDefaultMutation.isPending || !isAccessAvailable}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-900 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={!isAccessAvailable ? "Workspace erişimi şu anda mevcut değil" : "Set as default workspace"}
            >
              <Star className="h-4 w-4 mr-1.5" />
              Set Default
            </button>
          )}

          {/* Leave Button */}
          {workspace.accountType !== "primaryOwner" && (
            <button
              onClick={() =>
                onLeave(
                  workspace.workspaceId,
                  workspace.workspaceName,
                  workspace.accountType
                )
              }
              disabled={leaveMutation.isPending}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-error-700 dark:text-error-400 bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-900 rounded-lg hover:bg-error-100 dark:hover:bg-error-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Leave this workspace"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Leave
            </button>
          )}

          {/* Primary Owner Info */}
          {workspace.accountType === "primaryOwner" && (
            <div className="px-3 py-2 text-xs font-medium text-warning-700 dark:text-warning-400 bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-900 rounded-lg text-center">
              Cannot leave
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WorkspaceManagementDialog: React.FC<WorkspaceManagementDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [leaveConfirm, setLeaveConfirm] = useState<{
    isOpen: boolean;
    workspaceId: string;
    workspaceName: string;
  }>({
    isOpen: false,
    workspaceId: '',
    workspaceName: '',
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: workspaces, isLoading, error } = useQuery({
    queryKey: ["account-workspaces"],
    queryFn: getAccountWorkspaces,
    enabled: isOpen,
  });

  const leaveMutation = useLeaveWorkspace();
  const setDefaultMutation = useSetDefaultWorkspace();

  const handleLeaveWorkspace = (
    workspaceId: string,
    workspaceName: string,
    accountType: string
  ) => {
    if (accountType === "primaryOwner") {
      toast.error("Primary owners cannot leave the workspace. Please transfer ownership first.", {
        duration: 5000,
      });
      return;
    }

    setLeaveConfirm({ isOpen: true, workspaceId, workspaceName });
  };

  const handleConfirmLeave = async () => {
    const { workspaceId, workspaceName } = leaveConfirm;
    if (!workspaceId) return;

    const toastId = toast.loading('Leaving workspace...');

    try {
      await leaveMutation.mutateAsync(workspaceId);
      toast.success(`Successfully left "${workspaceName}"`, { id: toastId });
    } catch (error: any) {
      console.error("Failed to leave workspace:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to leave workspace';
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleSetDefault = async (
    workspace: Workspace
  ) => {
    // Check if workspace access is available
    if (!isWorkspaceAccessAvailable(workspace)) {
      const now = new Date();
      const startDate = workspace.accessStartDate ? new Date(workspace.accessStartDate) : null;
      const endDate = workspace.accessEndDate ? new Date(workspace.accessEndDate) : null;

      if (startDate && now < startDate) {
        toast.error(`Bu workspace'e erişim henüz başlamadı. Erişim ${startDate.toLocaleString('tr-TR')} tarihinde başlayacak.`);
      } else if (endDate && now > endDate) {
        toast.error(`Bu workspace'e erişim süresi doldu. Erişim ${endDate.toLocaleString('tr-TR')} tarihinde sona erdi.`);
      } else {
        toast.error('Bu workspace\'e şu anda erişim mevcut değil.');
      }
      return;
    }

    const toastId = toast.loading('Setting default workspace...');

    try {
      await setDefaultMutation.mutateAsync(workspace.workspaceId);
      toast.success(`"${workspace.workspaceName}" is now your default workspace`, { 
        id: toastId,
        icon: '⭐',
      });
    } catch (error: any) {
      console.error("Failed to set default workspace:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to set default workspace';
      toast.error(errorMessage, { id: toastId });
    }
  };

  const getRoleIcon = (accountType: string) => {
    switch (accountType) {
      case "primaryOwner":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "owner":
        return <Shield className="h-4 w-4 text-blue-600" />;
      case "admin":
        return <Shield className="h-4 w-4 text-purple-600" />;
      case "member":
        return <Users className="h-4 w-4 text-gray-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (accountType: string) => {
    switch (accountType) {
      case "primaryOwner":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900";
      case "owner":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-900";
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-900";
      case "member":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  const getRoleLabel = (accountType: string) => {
    switch (accountType) {
      case "primaryOwner":
        return "Primary Owner";
      case "owner":
        return "Owner";
      case "admin":
        return "Admin";
      case "member":
        return "Member";
      default:
        return accountType;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-950 dark:to-brand-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-500 dark:bg-brand-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white/90">
                Workspace Management
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your workspaces, set default, and leave workspaces
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors shadow-theme-xs dark:bg-brand-600 dark:hover:bg-brand-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
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
              <p className="text-error-800 dark:text-error-400 font-medium">Failed to load workspaces</p>
            </div>
          )}

          {!isLoading && !error && workspaces && workspaces.length === 0 && (
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-10 w-10 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">
                No Workspaces Found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You are not a member of any workspaces yet.
              </p>
            </div>
          )}

          {!isLoading && !error && workspaces && workspaces.length > 0 && (
            <div className="space-y-3">
              {workspaces.map((workspace) => (
                <WorkspaceItemComponent
                  key={workspace.workspaceId}
                  workspace={workspace}
                  setDefaultMutation={setDefaultMutation}
                  leaveMutation={leaveMutation}
                  onSetDefault={handleSetDefault}
                  onLeave={handleLeaveWorkspace}
                  getRoleIcon={getRoleIcon}
                  getRoleBadgeColor={getRoleBadgeColor}
                  getRoleLabel={getRoleLabel}
                />
              ))}
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

      {/* Leave Workspace Confirmation */}
      <ConfirmDialog
        isOpen={leaveConfirm.isOpen}
        onClose={() => setLeaveConfirm({ isOpen: false, workspaceId: '', workspaceName: '' })}
        onConfirm={handleConfirmLeave}
        title="Leave Workspace"
        message={`Are you sure you want to leave "${leaveConfirm.workspaceName}"? This action cannot be undone.`}
        confirmText="Leave Workspace"
        cancelText="Stay"
        variant="danger"
      />

      {/* Create Workspace Dialog */}
      <CreateWorkspaceDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          // Workspace list will be automatically refreshed by React Query
        }}
      />
    </div>
  );
};

export default WorkspaceManagementDialog;

