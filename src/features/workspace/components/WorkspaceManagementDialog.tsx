import React, { useState } from "react";
import { X, Building2, Star, LogOut, Crown, Shield, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAccountWorkspaces } from "../../../api/endpoints/workspaces";
import { useLeaveWorkspace, useSetDefaultWorkspace } from "../api/workspaceApi";

interface WorkspaceManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkspaceManagementDialog: React.FC<WorkspaceManagementDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: workspaces, isLoading, error } = useQuery({
    queryKey: ["account-workspaces"],
    queryFn: getAccountWorkspaces,
    enabled: isOpen,
  });

  const leaveMutation = useLeaveWorkspace();
  const setDefaultMutation = useSetDefaultWorkspace();

  const handleLeaveWorkspace = async (
    workspaceId: string,
    workspaceName: string,
    accountType: string
  ) => {
    if (accountType === "primaryOwner") {
      alert(
        "❌ Primary owners cannot leave the workspace. Please transfer ownership first."
      );
      return;
    }

    if (
      !confirm(
        `Are you sure you want to leave "${workspaceName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await leaveMutation.mutateAsync(workspaceId);
      alert(`✅ Successfully left "${workspaceName}"`);
    } catch (error: any) {
      console.error("Failed to leave workspace:", error);
      alert(
        `❌ Failed to leave workspace: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleSetDefault = async (
    workspaceId: string,
    workspaceName: string
  ) => {
    try {
      await setDefaultMutation.mutateAsync(workspaceId);
      alert(`⭐ "${workspaceName}" is now your default workspace`);
    } catch (error: any) {
      console.error("Failed to set default workspace:", error);
      alert(
        `❌ Failed to set default workspace: ${
          error.response?.data?.message || error.message
        }`
      );
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
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "owner":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "member":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Workspace Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your workspaces, set default, and leave workspaces
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
                <p className="text-red-800">Failed to load workspaces</p>
              </div>
            )}

            {!isLoading && !error && workspaces && workspaces.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Workspaces Found
                </h3>
                <p className="text-gray-600">
                  You are not a member of any workspaces yet.
                </p>
              </div>
            )}

            {!isLoading && !error && workspaces && workspaces.length > 0 && (
              <div className="space-y-4">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.workspaceId}
                    className={`border rounded-lg p-4 transition-all ${
                      workspace.isDefault
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      {/* Workspace Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-5 w-5 text-gray-700" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {workspace.workspaceName}
                          </h3>
                          {workspace.isDefault && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border bg-blue-100 text-blue-800 border-blue-200">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Default
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            {getRoleIcon(workspace.accountType)}
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded border ${getRoleBadgeColor(
                                workspace.accountType
                              )}`}
                            >
                              {getRoleLabel(workspace.accountType)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>{" "}
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                workspace.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {workspace.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {/* Set Default Button */}
                        {!workspace.isDefault && (
                          <button
                            onClick={() =>
                              handleSetDefault(
                                workspace.workspaceId,
                                workspace.workspaceName
                              )
                            }
                            disabled={setDefaultMutation.isPending}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Set as default workspace"
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Set Default
                          </button>
                        )}

                        {/* Leave Button - Not for primary owners */}
                        {workspace.accountType !== "primaryOwner" && (
                          <button
                            onClick={() =>
                              handleLeaveWorkspace(
                                workspace.workspaceId,
                                workspace.workspaceName,
                                workspace.accountType
                              )
                            }
                            disabled={leaveMutation.isPending}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Leave this workspace"
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            Leave
                          </button>
                        )}

                        {/* Primary Owner Info */}
                        {workspace.accountType === "primaryOwner" && (
                          <div className="px-3 py-2 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md">
                            Cannot leave (Owner)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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

export default WorkspaceManagementDialog;

