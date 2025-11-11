import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccountInvites } from '../../../api/endpoints/accountInvites';
import { declineInvitation, acceptInvitation } from '../../../api/endpoints/accountInvitations';
import type { AccountInvite, GetAccountInvitesParams } from '../../../api/endpoints/accountInvites';

/**
 * React Query hook for fetching account invites
 * @param params - Optional filter parameters (status)
 */
export const useAccountInvites = (params?: GetAccountInvitesParams) => {
  return useQuery<AccountInvite[], Error>({
    queryKey: ['account-invites', params],
    queryFn: () => getAccountInvites(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * React Query mutation hook for declining invitations
 */
export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (invitationId: string) => declineInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-invites'] });
    },
  });
};

/**
 * React Query mutation hook for accepting invitations
 */
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (invitationId: string) => acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-invites'] });
      queryClient.invalidateQueries({ queryKey: ['account-workspaces'] });
    },
  });
};

