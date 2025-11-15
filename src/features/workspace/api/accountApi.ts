import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  removeAccountFromWorkspace,
  getAccountHistory,
  type AccountHistory,
} from "../../../api/endpoints/workspaceAccounts";

/**
 * React Query mutation hook for removing account from workspace
 */
export const useRemoveAccount = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (accountId: string) =>
      removeAccountFromWorkspace(workspaceId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-accounts", workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ['workspace-license', 'status', workspaceId] });
    },
  });
};

/**
 * React Query hook for fetching account membership history
 */
export const useAccountHistory = (workspaceId: string, accountId: string) => {
  return useQuery<AccountHistory[], Error>({
    queryKey: ["account-history", workspaceId, accountId],
    queryFn: () => getAccountHistory(workspaceId, accountId),
    enabled: !!workspaceId && !!accountId,
  });
};
