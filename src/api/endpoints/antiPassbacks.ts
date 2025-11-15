import { api } from '../apiClient';

export type AntiPassbackParameterDefinition = {
  name: string;
  label: string;
  description?: string;
  type: 'boolean' | 'number' | 'string' | string;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string }>;
};

export type AntiPassbackTypeDefinition = {
  id: string;
  name: string;
  description?: string;
  parameters: AntiPassbackParameterDefinition[];
};

export type AntiPassback = {
  id: string;
  name: string;
  antiPassbackTypeId: string;
  antiPassbackTypeName: string;
  workspaceId: string;
  isActive: boolean;
  isAssignedWorkspace: boolean;
  parameters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

export type AntiPassbackListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AntiPassbackListResponse = {
  items: AntiPassback[];
  meta: AntiPassbackListMeta;
};

type AntiPassbackTypeApiResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: AntiPassbackTypeDefinition[];
};

type AntiPassbackParameterListApiResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: AntiPassbackParameterDefinition[];
};

type AntiPassbackApiResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: AntiPassback;
};

type AntiPassbackListApiResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: AntiPassbackListResponse;
};

type MessageResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: {
    message: string;
  };
};

export type CreateAntiPassbackPayload = {
  antiPassback: {
    name: string;
    antiPassbackTypeId: string;
    isActive?: boolean;
    isAssignedWorkspace?: boolean;
  };
  parameters?: Record<string, any>;
};

export type UpdateAntiPassbackPayload = {
  name?: string;
  isActive?: boolean;
  isAssignedWorkspace?: boolean;
  parameters?: Record<string, any>;
};

export const getAntiPassbackTypes = async (): Promise<AntiPassbackTypeDefinition[]> => {
  const response = await api.get<AntiPassbackTypeApiResponse>('/web/workspace/anti-passback/types');
  return response.data.data;
};

export const getAntiPassbackParameterDefinitions = async (
  typeId: string,
): Promise<AntiPassbackParameterDefinition[]> => {
  const response = await api.get<AntiPassbackParameterListApiResponse>(
    `/web/workspace/anti-passback/types/${typeId}/parameters`,
  );
  return response.data.data;
};

export const getAntiPassbacks = async (
  workspaceId: string,
  params?: { page?: number; limit?: number; isActive?: boolean },
): Promise<AntiPassbackListResponse> => {
  const response = await api.get<AntiPassbackListApiResponse>('/web/workspace/anti-passback', {
    params,
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data;
};

export const getAntiPassbackById = async (
  workspaceId: string,
  antiPassbackId: string,
): Promise<AntiPassback> => {
  const response = await api.get<AntiPassbackApiResponse>(
    `/web/workspace/anti-passback/${antiPassbackId}`,
    {
      headers: {
        'workspace-id': workspaceId,
      },
    },
  );
  return response.data.data;
};

export const createAntiPassback = async (
  workspaceId: string,
  data: CreateAntiPassbackPayload,
): Promise<AntiPassback> => {
  const response = await api.post<AntiPassbackApiResponse>(
    '/web/workspace/anti-passback',
    data,
    {
      headers: {
        'workspace-id': workspaceId,
      },
    },
  );
  return response.data.data;
};

export const updateAntiPassback = async (
  workspaceId: string,
  antiPassbackId: string,
  data: UpdateAntiPassbackPayload,
): Promise<AntiPassback> => {
  const response = await api.put<AntiPassbackApiResponse>(
    `/web/workspace/anti-passback/${antiPassbackId}`,
    data,
    {
      headers: {
        'workspace-id': workspaceId,
      },
    },
  );
  return response.data.data;
};

export const deleteAntiPassback = async (
  workspaceId: string,
  antiPassbackId: string,
): Promise<string> => {
  const response = await api.delete<MessageResponse>(`/web/workspace/anti-passback/${antiPassbackId}`, {
    headers: {
      'workspace-id': workspaceId,
    },
  });

  return response.data.data.message;
};

// Re-export Zone type from zones endpoint
export type { Zone } from './zones';

type ZonesApiResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: Zone[];
};

export const getZonesByAntiPassback = async (antiPassbackId: string): Promise<Zone[]> => {
  const response = await api.get<ZonesApiResponse>(
    `/web/workspace/anti-passback/${antiPassbackId}/zones`,
  );
  return response.data.data;
};

export const assignZonesToAntiPassback = async (
  workspaceId: string,
  antiPassbackId: string,
  zoneIds: string[],
): Promise<string> => {
  const response = await api.post<MessageResponse>(
    `/web/workspace/anti-passback/${antiPassbackId}/zones`,
    { zoneIds },
    {
      headers: {
        'workspace-id': workspaceId,
      },
    },
  );
  return response.data.data.message;
};

export const removeZonesFromAntiPassback = async (
  workspaceId: string,
  antiPassbackId: string,
  zoneIds: string[],
): Promise<string> => {
  const response = await api.delete<MessageResponse>(
    `/web/workspace/anti-passback/${antiPassbackId}/zones`,
    {
      data: { zoneIds },
      headers: {
        'workspace-id': workspaceId,
      },
    },
  );
  return response.data.data.message;
};


