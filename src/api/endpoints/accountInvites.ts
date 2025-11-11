import { api } from '../apiClient';

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export type AccountInvite = {
  id: string;
  email: string;
  zoneId: string;
  zoneName: string;
  status: InviteStatus;
  roles: object | null;
  permissions: object | null;
  isActive: boolean;
  expireAt: string;
  tempBeginAt: string | null;
  tempEndAt: string | null;
  createdAt: string;
};

type AccountInvitesResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: AccountInvite[];
};

export type GetAccountInvitesParams = {
  status?: InviteStatus;
};

export const getAccountInvites = async (
  params?: GetAccountInvitesParams,
): Promise<AccountInvite[]> => {
  const response = await api.get<AccountInvitesResponse>('/account/invites', {
    params,
  });
  return response.data.data;
};

