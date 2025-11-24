import { useQuery } from '@tanstack/react-query';
import {
  getAdminAccounts,
  getAdminDevices,
  getAdminWorkspaces,
  getAdminLicenses,
  getAdminEmails,
  getAdminWorkspacesList,
  getAdminDeviceTypesList,
  type GetAdminAccountsFilters,
  type GetAdminDevicesFilters,
  type GetAdminWorkspacesFilters,
  type GetAdminLicensesFilters,
  type GetAdminWorkspacesListFilters,
  type GetAdminDeviceTypesListFilters,
} from '../../../api/endpoints/admin';

// Query Keys
export const adminKeys = {
  all: ['admin'] as const,
  accounts: (filters?: GetAdminAccountsFilters) => [...adminKeys.all, 'accounts', filters] as const,
  devices: (filters?: GetAdminDevicesFilters) => [...adminKeys.all, 'devices', filters] as const,
  workspaces: (filters?: GetAdminWorkspacesFilters) => [...adminKeys.all, 'workspaces', filters] as const,
  licenses: (filters?: GetAdminLicensesFilters) => [...adminKeys.all, 'licenses', filters] as const,
};

/**
 * Get admin accounts query
 */
export const useAdminAccounts = (filters?: GetAdminAccountsFilters) => {
  return useQuery({
    queryKey: adminKeys.accounts(filters),
    queryFn: () => getAdminAccounts(filters),
  });
};

/**
 * Get admin devices query
 */
export const useAdminDevices = (filters?: GetAdminDevicesFilters) => {
  return useQuery({
    queryKey: adminKeys.devices(filters),
    queryFn: () => getAdminDevices(filters),
  });
};

/**
 * Get admin workspaces query
 */
export const useAdminWorkspaces = (filters?: GetAdminWorkspacesFilters) => {
  return useQuery({
    queryKey: adminKeys.workspaces(filters),
    queryFn: () => getAdminWorkspaces(filters),
  });
};

/**
 * Get admin licenses query
 */
export const useAdminLicenses = (filters?: GetAdminLicensesFilters) => {
  return useQuery({
    queryKey: adminKeys.licenses(filters),
    queryFn: () => getAdminLicenses(filters),
  });
};

/**
 * Get admin emails query
 */
export const useAdminEmails = (search?: string) => {
  return useQuery({
    queryKey: ['admin', 'emails', search],
    queryFn: () => getAdminEmails(search),
  });
};

/**
 * Get admin workspaces list query
 */
export const useAdminWorkspacesList = (search?: string) => {
  return useQuery({
    queryKey: ['admin', 'workspaces-list', search],
    queryFn: () => getAdminWorkspacesList({ search }),
  });
};

/**
 * Get admin device types list query
 */
export const useAdminDeviceTypesList = (filters?: GetAdminDeviceTypesListFilters) => {
  return useQuery({
    queryKey: ['admin', 'device-types-list', filters],
    queryFn: () => getAdminDeviceTypesList(filters),
  });
};

