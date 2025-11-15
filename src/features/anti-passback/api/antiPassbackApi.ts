import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAntiPassbackTypes,
  getAntiPassbackParameterDefinitions,
  getAntiPassbacks,
  getAntiPassbackById,
  createAntiPassback,
  updateAntiPassback,
  deleteAntiPassback,
  getZonesByAntiPassback,
  assignZonesToAntiPassback,
  removeZonesFromAntiPassback,
  type AntiPassbackTypeDefinition,
  type AntiPassbackParameterDefinition,
  type AntiPassbackListResponse,
  type AntiPassback,
  type CreateAntiPassbackPayload,
  type UpdateAntiPassbackPayload,
  type Zone,
} from '../../../api/endpoints/antiPassbacks';

export const antiPassbackKeys = {
  all: ['anti-passbacks'] as const,
  list: (workspaceId: string) => [...antiPassbackKeys.all, 'list', workspaceId] as const,
  detail: (workspaceId: string, antiPassbackId: string) =>
    [...antiPassbackKeys.all, 'detail', workspaceId, antiPassbackId] as const,
  types: () => [...antiPassbackKeys.all, 'types'] as const,
  parameterList: (typeId: string) => [...antiPassbackKeys.all, 'types', typeId] as const,
  zones: (antiPassbackId: string) => [...antiPassbackKeys.all, 'zones', antiPassbackId] as const,
};

export const useAntiPassbackTypes = () => {
  return useQuery<AntiPassbackTypeDefinition[]>({
    queryKey: antiPassbackKeys.types(),
    queryFn: getAntiPassbackTypes,
  });
};

export const useAntiPassbackParameterDefinitions = (antiPassbackTypeId?: string) => {
  return useQuery<AntiPassbackParameterDefinition[]>({
    queryKey: antiPassbackKeys.parameterList(antiPassbackTypeId || 'unknown'),
    queryFn: () => getAntiPassbackParameterDefinitions(antiPassbackTypeId!),
    enabled: !!antiPassbackTypeId,
  });
};

export const useAntiPassbacks = (
  workspaceId: string,
  params?: { page?: number; limit?: number; isActive?: boolean },
) => {
  return useQuery<AntiPassbackListResponse>({
    queryKey: antiPassbackKeys.list(workspaceId),
    queryFn: () => getAntiPassbacks(workspaceId, params),
    enabled: !!workspaceId,
  });
};

export const useAntiPassback = (workspaceId: string, antiPassbackId?: string) => {
  return useQuery<AntiPassback>({
    queryKey: antiPassbackId
      ? antiPassbackKeys.detail(workspaceId, antiPassbackId)
      : [...antiPassbackKeys.all, 'detail', 'unknown'],
    queryFn: () => getAntiPassbackById(workspaceId, antiPassbackId!),
    enabled: !!workspaceId && !!antiPassbackId,
  });
};

export const useCreateAntiPassback = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAntiPassbackPayload) =>
      createAntiPassback(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: antiPassbackKeys.list(workspaceId) });
      queryClient.invalidateQueries({ queryKey: ['workspace-license', 'status', workspaceId] });
    },
  });
};

export const useUpdateAntiPassback = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      antiPassbackId,
      data,
    }: {
      antiPassbackId: string;
      data: UpdateAntiPassbackPayload;
    }) => updateAntiPassback(workspaceId, antiPassbackId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: antiPassbackKeys.list(workspaceId) });
      queryClient.invalidateQueries({
        queryKey: antiPassbackKeys.detail(workspaceId, variables.antiPassbackId),
      });
    },
  });
};

export const useDeleteAntiPassback = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (antiPassbackId: string) =>
      deleteAntiPassback(workspaceId, antiPassbackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: antiPassbackKeys.list(workspaceId) });
      queryClient.invalidateQueries({ queryKey: ['workspace-license', 'status', workspaceId] });
    },
  });
};

export const useZonesByAntiPassback = (antiPassbackId?: string) => {
  return useQuery<Zone[]>({
    queryKey: antiPassbackKeys.zones(antiPassbackId || 'unknown'),
    queryFn: () => getZonesByAntiPassback(antiPassbackId!),
    enabled: !!antiPassbackId,
  });
};

export const useAssignZonesToAntiPassback = (workspaceId: string, antiPassbackId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneIds: string[]) =>
      assignZonesToAntiPassback(workspaceId, antiPassbackId, zoneIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: antiPassbackKeys.zones(antiPassbackId) });
      queryClient.invalidateQueries({ queryKey: antiPassbackKeys.list(workspaceId) });
    },
  });
};

export const useRemoveZonesFromAntiPassback = (workspaceId: string, antiPassbackId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneIds: string[]) =>
      removeZonesFromAntiPassback(workspaceId, antiPassbackId, zoneIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: antiPassbackKeys.zones(antiPassbackId) });
      queryClient.invalidateQueries({ queryKey: antiPassbackKeys.list(workspaceId) });
    },
  });
};


