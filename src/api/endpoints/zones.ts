import { api } from '../apiClient';

// Zone Types Enum
export enum ZoneType {
  MASTER_WORKSPACE = 1,
  WORKSPACE = 2,
  CAMPUS = 3,
  BUILDING = 4,
  FLOOR = 5,
  SECTION = 6,
  UNIT = 7,
}

// Zone Type Labels
export const ZONE_TYPE_LABELS: Record<ZoneType, string> = {
  [ZoneType.MASTER_WORKSPACE]: 'Master Workspace',
  [ZoneType.WORKSPACE]: 'Workspace',
  [ZoneType.CAMPUS]: 'Campus',
  [ZoneType.BUILDING]: 'Building',
  [ZoneType.FLOOR]: 'Floor',
  [ZoneType.SECTION]: 'Section',
  [ZoneType.UNIT]: 'Unit',
};

// Zone Type Icons
export const ZONE_TYPE_ICONS: Record<ZoneType, string> = {
  [ZoneType.MASTER_WORKSPACE]: '🏢',
  [ZoneType.WORKSPACE]: '💼',
  [ZoneType.CAMPUS]: '🏫',
  [ZoneType.BUILDING]: '🏗️',
  [ZoneType.FLOOR]: '🔢',
  [ZoneType.SECTION]: '📦',
  [ZoneType.UNIT]: '📍',
};

export type Zone = {
  id: string;
  name: string;
  description?: string;
  zoneTypeId: string;
  zoneTypeName?: string;
  parentId?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  children?: Zone[];
};

export type CreateZoneRequest = {
  name: string;
  description?: string;
  zoneType: ZoneType;
  parentId?: string;
};

export type ZoneTemplateItem = {
  name: string;
  description?: string;
  zoneType: ZoneType;
  parentId?: string;
  children?: ZoneTemplateItem[];
};

export type CreateZoneTemplateRequest = {
  zones: ZoneTemplateItem[];
  parentId?: string;
};

export type UpdateZoneRequest = {
  name?: string;
  description?: string;
  isActive?: boolean;
};

type ZonesResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: {
    zones: Zone[];
  };
};

type ZoneResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: Zone;
};

type MessageResponse = {
  success: boolean;
  customCode: number;
  message: string;
  data: {
    message: string;
  };
};

/**
 * Get all zones in tree structure for workspace
 */
export const getZones = async (workspaceId: string): Promise<Zone[]> => {
  const response = await api.get<ZonesResponse>('/zones', {
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data.zones;
};

/**
 * Create a new zone
 */
export const createZone = async (
  workspaceId: string,
  data: CreateZoneRequest,
): Promise<Zone> => {
  const response = await api.post<ZoneResponse>('/zones', data, {
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data;
};

/**
 * Update a zone
 */
export const updateZone = async (
  workspaceId: string,
  zoneId: string,
  data: UpdateZoneRequest,
): Promise<string> => {
  const response = await api.put<MessageResponse>(`/zones/${zoneId}`, data, {
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data.message;
};

/**
 * Delete a zone
 */
export const deleteZone = async (workspaceId: string, zoneId: string): Promise<string> => {
  const response = await api.delete<MessageResponse>(`/zones/${zoneId}`, {
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data.message;
};

/**
 * Create zone template (bulk zone creation)
 */
export const createZoneTemplate = async (
  workspaceId: string,
  data: CreateZoneTemplateRequest,
): Promise<Zone[]> => {
  const response = await api.post<ZonesResponse>('/zones/template', data, {
    headers: {
      'workspace-id': workspaceId,
    },
  });
  return response.data.data.zones;
};

/**
 * Get allowed child zone types for a parent zone type
 * Rule: Can add any zone type that comes AFTER the current type in hierarchy
 * Example: Campus can have Building, Floor, Section, or Unit (skip levels allowed)
 * But Section cannot have Floor (cannot go back up)
 */
export const getAllowedChildTypes = (parentZoneType: number): ZoneType[] => {
  const allowedChildren: Record<number, ZoneType[]> = {
    [ZoneType.MASTER_WORKSPACE]: [],
    [ZoneType.WORKSPACE]: [
      ZoneType.CAMPUS,
      ZoneType.BUILDING,
      ZoneType.FLOOR,
      ZoneType.SECTION,
      ZoneType.UNIT,
    ],
    [ZoneType.CAMPUS]: [ZoneType.BUILDING, ZoneType.FLOOR, ZoneType.SECTION, ZoneType.UNIT],
    [ZoneType.BUILDING]: [ZoneType.FLOOR, ZoneType.SECTION, ZoneType.UNIT],
    [ZoneType.FLOOR]: [ZoneType.SECTION, ZoneType.UNIT],
    [ZoneType.SECTION]: [ZoneType.UNIT],
    [ZoneType.UNIT]: [],
  };

  return allowedChildren[parentZoneType] || [];
};

/**
 * Get allowed zone types for creation (excluding MASTER_WORKSPACE and WORKSPACE)
 */
export const getAllowedZoneTypesForCreation = (): ZoneType[] => {
  return [
    ZoneType.CAMPUS,
    ZoneType.BUILDING,
    ZoneType.FLOOR,
    ZoneType.SECTION,
    ZoneType.UNIT,
  ];
};

