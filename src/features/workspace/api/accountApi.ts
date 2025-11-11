import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeAccountFromWorkspace } from '../../../api/endpoints/workspaceAccounts';

/**
 * React Query mutation hook for removing account from workspace
 */
export const useRemoveAccount = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (accountId: string) => removeAccountFromWorkspace(workspaceId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-accounts', workspaceId] });
    },
  });
};

