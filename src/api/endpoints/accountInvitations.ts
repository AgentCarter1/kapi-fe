import { api } from '../apiClient';

export const declineInvitation = async (invitationId: string): Promise<void> => {
  await api.patch(`/account/invitations/${invitationId}/decline`);
};

export const acceptInvitation = async (invitationId: string): Promise<void> => {
  await api.patch(`/account/invitations/${invitationId}/accept`);
};

