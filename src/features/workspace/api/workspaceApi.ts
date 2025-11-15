import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  leaveWorkspace,
  setDefaultWorkspace,
  createWorkspace,
  type CreateWorkspaceRequest,
  type Workspace,
} from "../../../api/endpoints/workspaces";

/**
 * React Query mutation hook for leaving a workspace
 */
export const useLeaveWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (workspaceId: string) => leaveWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["account", "self"] });
    },
  });
};

/**
 * React Query mutation hook for setting default workspace
 */
export const useSetDefaultWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (workspaceId: string) => setDefaultWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["account", "self"] });
    },
  });
};

/**
 * React Query mutation hook for creating a new workspace
 */
export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<Workspace, Error, CreateWorkspaceRequest>({
    mutationFn: (data: CreateWorkspaceRequest) => createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["account", "self"] });
    },
  });
};

