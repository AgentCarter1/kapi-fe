import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  createAccountInvite, 
  getWorkspaceInvites,
  cancelInvitation,
  getInvitationHistory,
} from '../../../api/endpoints/workspaceInvitations';
import type { 
  CreateInviteRequest, 
  CreateInviteResponse,
  WorkspaceInvite,
  GetWorkspaceInvitesParams,
  InvitationHistory,
} from '../../../api/endpoints/workspaceInvitations';

/**
 * React Query mutation hook for creating workspace invitations
 */
export const useCreateInvite = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation<CreateInviteResponse, Error, CreateInviteRequest>({
    mutationFn: (data: CreateInviteRequest) => createAccountInvite(workspaceId, data),
    onSuccess: () => {
      // Invalidate workspace invitations and accounts queries
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-accounts', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-license', 'status', workspaceId] });
    },
  });
};

/**
 * React Query hook for fetching workspace invitations
 */
export const useWorkspaceInvites = (workspaceId: string, params?: GetWorkspaceInvitesParams) => {
  return useQuery<WorkspaceInvite[], Error>({
    queryKey: ['workspace-invitations', workspaceId, params],
    queryFn: () => getWorkspaceInvites(workspaceId, params),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * React Query mutation hook for cancelling invitations (workspace owner)
 */
export const useCancelInvitation = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (invitationId: string) => cancelInvitation(workspaceId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations', workspaceId] });
    },
  });
};

/**
 * React Query hook for fetching invitation history
 */
export const useInvitationHistory = (workspaceId: string, email: string) => {
  return useQuery<InvitationHistory[], Error>({
    queryKey: ['invitation-history', workspaceId, email],
    queryFn: () => getInvitationHistory(workspaceId, email),
    enabled: !!workspaceId && !!email,
  });
};

