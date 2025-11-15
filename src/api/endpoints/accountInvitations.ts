import { api } from '../apiClient';

export const declineInvitation = async (invitationId: string): Promise<void> => {
  await api.patch(`/web/account/invitations/${invitationId}/decline`);
};

export const acceptInvitation = async (invitationId: string): Promise<void> => {
  await api.patch(`/web/account/invitations/${invitationId}/accept`);
};

