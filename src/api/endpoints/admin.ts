import { api } from '../apiClient';
import type { ApiResponse } from '../../types';

/**
 * Admin API Endpoints
 */

// Account Types
export interface AdminAccount {
  id: string;
  email: string;
  accountTypeId: string;
  accountTypeName?: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  defaultWorkspaceId?: string;
  defaultWorkspaceName?: string;
  verifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  workspaces: {
    workspaceId: string;
    workspaceName?: string;
    accountType: string;
    status: string;
  }[];
}

export interface GetAdminAccountsFilters {
  page?: number;
  limit?: number;
  search?: string;
  email?: string; // Comma-separated emails
  accountTypeId?: string;
  isActive?: boolean;
  isSuperAdmin?: boolean;
  workspaceId?: string; // Comma-separated workspace IDs
}

type AdminAccountsResponse = {
  data: {
    items: AdminAccount[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

/**
 * Get all accounts (admin)
 */
export const getAdminAccounts = async (
  filters?: GetAdminAccountsFilters,
): Promise<AdminAccountsResponse['data']> => {
  const cleanParams: Record<string, any> = {};
  if (filters) {
    if (filters.page) cleanParams.page = filters.page;
    if (filters.limit) cleanParams.limit = filters.limit;
    if (filters.search && filters.search.trim()) cleanParams.search = filters.search;
    if (filters.email && filters.email.trim()) cleanParams.email = filters.email;
    if (filters.accountTypeId && filters.accountTypeId.trim()) cleanParams.accountTypeId = filters.accountTypeId;
    // Explicitly convert boolean to string for query params (Axios converts it anyway, but being explicit)
    if (filters.isActive !== undefined && filters.isActive !== null) {
      cleanParams.isActive = filters.isActive.toString();
    }
    if (filters.isSuperAdmin !== undefined && filters.isSuperAdmin !== null) {
      cleanParams.isSuperAdmin = filters.isSuperAdmin.toString();
    }
    if (filters.workspaceId && filters.workspaceId.trim()) cleanParams.workspaceId = filters.workspaceId;
  }

  const response = await api.get<ApiResponse<AdminAccountsResponse['data']>>('/admin/accounts', {
    params: cleanParams,
  });
  return response.data.data!;
};

/**
 * Get all emails (admin)
 */
export const getAdminEmails = async (search?: string): Promise<string[]> => {
  const cleanParams: Record<string, any> = {};
  if (search && search.trim()) cleanParams.search = search;

  const response = await api.get<ApiResponse<{ emails: string[] }>>('/admin/accounts/emails', {
    params: cleanParams,
  });
  return response.data.data!.emails;
};

/**
 * Get all workspaces list (admin)
 */
export interface GetAdminWorkspacesListFilters {
  search?: string;
}

export const getAdminWorkspacesList = async (
  filters?: GetAdminWorkspacesListFilters,
): Promise<{ workspaces: AdminWorkspaceListItem[] }> => {
  const response = await api.get<ApiResponse<{ workspaces: AdminWorkspaceListItem[] }>>(
    '/admin/workspaces/list',
    {
      params: filters,
    },
  );
  return response.data.data!;
};

export interface AdminWorkspaceListItem {
  id: string;
  name: string;
}

// Device Types
export interface AdminDevice {
  id: string;
  uuid: string;
  name: string;
  deviceTypeId: string;
  deviceTypeName?: string;
  zoneId?: string;
  zoneName?: string;
  workspaceId: string;
  workspaceName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parameters?: Record<string, any>;
}

export interface GetAdminDevicesFilters {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  uuid?: string;
  deviceTypeId?: string | string[]; // Comma-separated or array
  workspaceId?: string | string[]; // Comma-separated or array
  zoneId?: string;
  isActive?: boolean;
}

type AdminDevicesResponse = {
  data: {
    items: AdminDevice[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

/**
 * Get all devices (admin)
 */
export const getAdminDevices = async (
  filters?: GetAdminDevicesFilters,
): Promise<AdminDevicesResponse['data']> => {
  const cleanParams: Record<string, any> = {};
  if (filters) {
    if (filters.page) cleanParams.page = filters.page;
    if (filters.limit) cleanParams.limit = filters.limit;
    if (filters.search && filters.search.trim()) cleanParams.search = filters.search;
    if (filters.name && filters.name.trim()) cleanParams.name = filters.name.trim();
    if (filters.uuid && filters.uuid.trim()) cleanParams.uuid = filters.uuid.trim();
    if (filters.deviceTypeId) {
      const deviceTypeIds = Array.isArray(filters.deviceTypeId) 
        ? filters.deviceTypeId 
        : typeof filters.deviceTypeId === 'string' 
        ? filters.deviceTypeId.split(',').map((d) => d.trim()).filter((d) => d)
        : [];
      if (deviceTypeIds.length > 0) {
        cleanParams.deviceTypeId = deviceTypeIds.join(',');
      }
    }
    if (filters.workspaceId) {
      const workspaceIds = Array.isArray(filters.workspaceId) 
        ? filters.workspaceId 
        : typeof filters.workspaceId === 'string' 
        ? filters.workspaceId.split(',').map((w) => w.trim()).filter((w) => w)
        : [];
      if (workspaceIds.length > 0) {
        cleanParams.workspaceId = workspaceIds.join(',');
      }
    }
    if (filters.zoneId && filters.zoneId.trim()) cleanParams.zoneId = filters.zoneId.trim();
    if (filters.isActive !== undefined && filters.isActive !== null) {
      // Explicitly convert boolean to string for query params (Axios converts it anyway, but being explicit)
      cleanParams.isActive = filters.isActive.toString();
    }
  }

  const response = await api.get<ApiResponse<AdminDevicesResponse['data']>>('/admin/devices', {
    params: cleanParams,
  });
  return response.data.data!;
};

export interface AdminDeviceTypeListItem {
  id: string;
  name: string;
}

export interface GetAdminDeviceTypesListFilters {
  search?: string;
}

export const getAdminDeviceTypesList = async (
  filters?: GetAdminDeviceTypesListFilters,
): Promise<{ deviceTypes: AdminDeviceTypeListItem[] }> => {
  const response = await api.get<ApiResponse<{ deviceTypes: AdminDeviceTypeListItem[] }>>('/admin/devices/types/list', {
    params: filters,
  });
  return response.data.data!;
};

// Workspace Types
export interface AdminWorkspace {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  accounts: {
    accountId: string;
    accountEmail?: string;
    accountType: string;
    status: string;
  }[];
}

export interface GetAdminWorkspacesFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

type AdminWorkspacesResponse = {
  data: {
    items: AdminWorkspace[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

/**
 * Get all workspaces (admin)
 */
export const getAdminWorkspaces = async (
  filters?: GetAdminWorkspacesFilters,
): Promise<AdminWorkspacesResponse['data']> => {
  const cleanParams: Record<string, any> = {};
  if (filters) {
    if (filters.page) cleanParams.page = filters.page;
    if (filters.limit) cleanParams.limit = filters.limit;
    if (filters.search && filters.search.trim()) cleanParams.search = filters.search;
    // Explicitly convert boolean to string for query params
    if (filters.isActive !== undefined && filters.isActive !== null) {
      cleanParams.isActive = filters.isActive.toString();
    }
  }

  const response = await api.get<ApiResponse<AdminWorkspacesResponse['data']>>('/admin/workspaces', {
    params: cleanParams,
  });
  return response.data.data!;
};

// License Types
export interface AdminLicense {
  id: string;
  licenseTypeId: string;
  licenseTypeName?: string;
  parentId?: string;
  workspaceId?: string;
  workspaceName?: string;
  isActive: boolean;
  expireAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  parameters?: Record<string, any>;
}

export interface GetAdminLicensesFilters {
  page?: number;
  limit?: number;
  workspaceId?: string;
  licenseTypeId?: string;
  isActive?: boolean;
}

type AdminLicensesResponse = {
  data: {
    items: AdminLicense[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

/**
 * Get all licenses (admin)
 */
export const getAdminLicenses = async (
  filters?: GetAdminLicensesFilters,
): Promise<AdminLicensesResponse['data']> => {
  const cleanParams: Record<string, any> = {};
  if (filters) {
    if (filters.page) cleanParams.page = filters.page;
    if (filters.limit) cleanParams.limit = filters.limit;
    if (filters.workspaceId && filters.workspaceId.trim()) cleanParams.workspaceId = filters.workspaceId;
    if (filters.licenseTypeId && filters.licenseTypeId.trim()) cleanParams.licenseTypeId = filters.licenseTypeId;
    if (filters.isActive !== undefined) cleanParams.isActive = filters.isActive;
  }

  const response = await api.get<ApiResponse<AdminLicensesResponse['data']>>('/admin/licenses', {
    params: cleanParams,
  });
  return response.data.data!;
};

