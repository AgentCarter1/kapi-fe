import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getZones, 
  createZone, 
  createZoneTemplate,
  updateZone, 
  deleteZone,
  type Zone, 
  type CreateZoneRequest,
  type CreateZoneTemplateRequest,
  type UpdateZoneRequest 
} from '../../../api/endpoints/zones';

// Query Keys
export const zoneKeys = {
  all: ['zones'] as const,
  workspace: (workspaceId: string) => [...zoneKeys.all, workspaceId] as const,
};

/**
 * Get zones tree query
 */
export const useZones = (workspaceId: string) => {
  return useQuery({
    queryKey: zoneKeys.workspace(workspaceId),
    queryFn: () => getZones(workspaceId),
    enabled: !!workspaceId,
  });
};

/**
 * Create zone mutation
 */
export const useCreateZone = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateZoneRequest) => createZone(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.workspace(workspaceId) });
    },
  });
};

/**
 * Update zone mutation
 */
export const useUpdateZone = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zoneId, data }: { zoneId: string; data: UpdateZoneRequest }) =>
      updateZone(workspaceId, zoneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.workspace(workspaceId) });
    },
  });
};

/**
 * Delete zone mutation
 */
export const useDeleteZone = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: string) => deleteZone(workspaceId, zoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.workspace(workspaceId) });
    },
  });
};

/**
 * Create zone template mutation
 */
export const useCreateZoneTemplate = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateZoneTemplateRequest) => createZoneTemplate(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.workspace(workspaceId) });
    },
  });
};

/**
 * Flatten zone tree to a list (for dropdowns)
 * Adds depth and full path for better UX
 */
export const flattenZones = (zones: Zone[], depth = 0, parentPath = ''): FlatZone[] => {
  if (!zones || !Array.isArray(zones)) {
    console.warn('flattenZones received invalid input:', zones);
    return [];
  }

  console.log(`flattenZones called with ${zones.length} zones at depth ${depth}`);
  
  return zones.reduce<FlatZone[]>((acc, zone) => {
    const currentPath = parentPath ? `${parentPath} > ${zone.name}` : zone.name;
    
    // Add current zone
    acc.push({
      id: zone.id,
      name: zone.name,
      fullPath: currentPath,
      depth,
      zoneTypeId: zone.zoneTypeId,
      zoneTypeName: zone.zoneTypeName,
      isActive: zone.isActive,
    });

    // Add children recursively
    if (zone.children && zone.children.length > 0) {
      acc.push(...flattenZones(zone.children, depth + 1, currentPath));
    }

    return acc;
  }, []);
};

export type FlatZone = {
  id: string;
  name: string;
  fullPath: string;
  depth: number;
  zoneTypeId: string;
  zoneTypeName?: string;
  isActive: boolean;
};
