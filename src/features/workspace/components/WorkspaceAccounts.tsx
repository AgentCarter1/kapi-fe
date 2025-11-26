import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MapPin,
  ChevronDown,
  UserPlus,
  History,
} from "lucide-react";
import { getWorkspaceAccounts } from "../../../api/endpoints/workspaceAccounts";
import type {
  WorkspaceAccountsFilters,
  WorkspaceAccount,
} from "../../../api/endpoints/workspaceAccounts";
import { useAppSelector } from "../../../store/hooks";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { InviteMemberDialog } from "./InviteMemberDialog";
import MemberHistoryDialog from "./MemberHistoryDialog";
import {
  useRemoveAccount,
  useUpdateAccountWorkspaceStatus,
} from "../api/accountApi";
import { useWorkspaceLicenseStatus } from "../api/workspaceLicenseApi";

export const WorkspaceAccounts = () => {
  const currentWorkspace = useAppSelector(
    (state) => state.auth.currentWorkspace
  );
  const currentUser = useAppSelector((state) => state.auth.user);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean;
    accountId: string;
    accountName: string;
    accountEmail: string;
  }>({
    isOpen: false,
    accountId: "",
    accountName: "",
    accountEmail: "",
  });
  const [removeConfirm, setRemoveConfirm] = useState<{
    isOpen: boolean;
    accountId: string;
    email: string;
  }>({
    isOpen: false,
    accountId: "",
    email: "",
  });

  const removeMutation = useRemoveAccount(currentWorkspace?.workspaceId || "");
  const updateStatusMutation = useUpdateAccountWorkspaceStatus(
    currentWorkspace?.workspaceId || ""
  );
  const { data: licenseStatus, isLoading: isLoadingLicenseStatus } =
    useWorkspaceLicenseStatus(currentWorkspace?.workspaceId || null);

  // Check if user limit is reached
  // Button is disabled while loading or if limit is reached
  const isUserLimitReached = licenseStatus?.user.isLimitReached ?? false;
  const isButtonDisabled = isLoadingLicenseStatus || isUserLimitReached;
  const userLimitMessage =
    licenseStatus?.user &&
    licenseStatus.user.max !== null &&
    licenseStatus.user.max !== undefined
      ? `User limit reached (${licenseStatus.user.current}/${licenseStatus.user.max}). Please upgrade your license to invite more members.`
      : isLoadingLicenseStatus
      ? "Loading license status..."
      : "";

  const [filters, setFilters] = useState<WorkspaceAccountsFilters>({
    page: 1,
    limit: 10,
    status: "ACTIVE",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["workspace-accounts", currentWorkspace?.workspaceId, filters],
    queryFn: () => getWorkspaceAccounts(currentWorkspace!.workspaceId, filters),
    enabled: !!currentWorkspace?.workspaceId,
  });

  // Sort accounts: Current user first, then others
  const sortedAccounts = useMemo(() => {
    if (!data?.items || !currentUser?.email) return data?.items || [];

    const currentUserAccount = data.items.find(
      (acc) => acc.email === currentUser.email
    );
    const otherAccounts = data.items.filter(
      (acc) => acc.email !== currentUser.email
    );

    return currentUserAccount
      ? [currentUserAccount, ...otherAccounts]
      : data.items;
  }, [data?.items, currentUser?.email]);

  const getStatusTooltip = (account: WorkspaceAccount): string | undefined => {
    // Show detailed info for LEFT / REMOVED / OUTDATED statuses
    if (account.status === "LEFT" || account.status === "REMOVED") {
      const leftDate = account.endAt || account.leftAt;
      if (!leftDate) return undefined;
      const formatted = new Date(leftDate).toLocaleString("tr-TR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return `Bu kullanıcı bu workspace'den ${formatted} tarihinde ayrıldı.`;
    }

    if (account.status === "OUTDATED" && account.endAt) {
      const formatted = new Date(account.endAt).toLocaleString("tr-TR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return `Bu üyeliğin süresi ${formatted} tarihinde doldu.`;
    }

    return undefined;
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (search: string) => {
    const newFilters: WorkspaceAccountsFilters = { ...filters, page: 1 };

    if (search.trim()) {
      newFilters.search = search;
    } else {
      delete newFilters.search;
    }

    setFilters(newFilters);
  };

  const handleRemoveAccount = (accountId: string, email: string) => {
    setRemoveConfirm({ isOpen: true, accountId, email });
  };

  const handleConfirmRemove = async () => {
    const { accountId, email } = removeConfirm;
    if (!accountId) return;

    const toastId = toast.loading("Removing member...");

    try {
      await removeMutation.mutateAsync(accountId);
      toast.success(`Member ${email} removed successfully`, { id: toastId });
    } catch (error: any) {
      console.error("Failed to remove member:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to remove member";
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleToggleStatus = async (
    accountId: string,
    currentStatus: string
  ) => {
    const toastId = toast.loading("Updating status...");

    try {
      const newStatus = currentStatus === "ACTIVE" ? "PASSIVE" : "ACTIVE";
      await updateStatusMutation.mutateAsync({
        accountId,
        status: newStatus,
      });
      toast.success(`Status updated successfully`, { id: toastId });
    } catch (error: any) {
      console.error("Failed to update status:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update status";
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleViewHistory = (
    accountId: string,
    firstName: string | undefined,
    lastName: string | undefined,
    email: string
  ) => {
    const accountName =
      firstName || lastName
        ? `${firstName || ""} ${lastName || ""}`.trim()
        : "No name";

    setHistoryDialog({
      isOpen: true,
      accountId,
      accountName,
      accountEmail: email,
    });
  };

  if (!currentWorkspace) {
    return (
      <div className="bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
        <p className="text-warning-800 dark:text-warning-400">
          Please select a workspace first.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Invite Button */}
      <div className="flex justify-end mb-6">
        <div className="relative group">
          <button
            onClick={() => setIsInviteDialogOpen(true)}
            disabled={isButtonDisabled}
            className={`inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-theme-xs ${
              isButtonDisabled
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700"
            }`}
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Invite Member
          </button>
          {isButtonDisabled && userLimitMessage && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 max-w-xs">
              {userLimitMessage}
              <div className="absolute top-full right-4 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Dialog */}
      {currentWorkspace && (
        <InviteMemberDialog
          isOpen={isInviteDialogOpen}
          onClose={() => setIsInviteDialogOpen(false)}
          workspaceId={currentWorkspace.workspaceId}
        />
      )}

      {/* History Dialog */}
      <MemberHistoryDialog
        isOpen={historyDialog.isOpen}
        onClose={() =>
          setHistoryDialog({
            isOpen: false,
            accountId: "",
            accountName: "",
            accountEmail: "",
          })
        }
        workspaceId={currentWorkspace?.workspaceId || ""}
        accountId={historyDialog.accountId}
        accountName={historyDialog.accountName}
        accountEmail={historyDialog.accountEmail}
      />

      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-5 mb-6 border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by email or name..."
              value={filters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) => {
                const newFilters: WorkspaceAccountsFilters = {
                  ...filters,
                  page: 1,
                };
                if (e.target.value) {
                  newFilters.status = e.target.value;
                } else {
                  delete newFilters.status;
                }
                setFilters(newFilters);
              }}
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PASSIVE">Passive</option>
              <option value="OUTDATED">Outdated</option>
              <option value="LEFT">Left</option>
              <option value="REMOVED">Removed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={filters.accountType || ""}
              onChange={(e) => {
                const newFilters: WorkspaceAccountsFilters = {
                  ...filters,
                  page: 1,
                };
                if (e.target.value) {
                  newFilters.accountType = e.target.value;
                } else {
                  delete newFilters.accountType;
                }
                setFilters(newFilters);
              }}
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="">All Types</option>
              <option value="primaryOwner">Primary Owner</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </div>
        </div>
        {data && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {data.items.length} of {data.meta.total} members
            </p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-4">
          <p className="text-error-800 dark:text-error-400 font-medium">
            Failed to load workspace members.
          </p>
          <p className="text-error-600 dark:text-error-500 text-sm mt-1">
            {error.message}
          </p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && data && (
        <>
          {data.items.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-12 text-center border border-gray-200 dark:border-gray-800">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg
                    className="h-10 w-10 text-gray-400 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">
                No members found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Access Period
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {sortedAccounts.map((account) => {
                      const isCurrentUser =
                        account.email === currentUser?.email;
                      const getRoleBadgeColor = (role: string) => {
                        if (role === "primaryOwner")
                          return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-900";
                        if (role === "owner")
                          return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-900";
                        if (role === "admin")
                          return "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-400 border-brand-200 dark:border-brand-900";
                        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
                      };

                      return (
                        <tr
                          key={account.id}
                          className={`transition-colors ${
                            isCurrentUser
                              ? "bg-brand-50/50 dark:bg-brand-950/20 hover:bg-brand-50 dark:hover:bg-brand-950/30"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-600 dark:to-brand-700 flex items-center justify-center text-white font-semibold text-sm shadow-theme-xs">
                                  {account.firstName?.[0]?.toUpperCase() ||
                                    account.email[0].toUpperCase()}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                                  {account.firstName || account.lastName
                                    ? `${account.firstName || ""} ${
                                        account.lastName || ""
                                      }`.trim()
                                    : "No name"}
                                  {isCurrentUser && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {account.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                                account.accountType
                              )}`}
                            >
                              {account.accountType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {/* Toggle Switch - show only for ACTIVE and PASSIVE */}
                              {(account.status === "ACTIVE" ||
                                account.status === "PASSIVE") && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleStatus(
                                      account.accountId,
                                      account.status
                                    )
                                  }
                                  disabled={
                                    updateStatusMutation.isPending ||
                                    isCurrentUser
                                  }
                                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    account.status === "ACTIVE"
                                      ? "bg-brand-600 dark:bg-brand-500 border-brand-700 dark:border-brand-600"
                                      : "bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500"
                                  }`}
                                  role="switch"
                                  aria-checked={account.status === "ACTIVE"}
                                  aria-label={`Toggle ${account.email} status`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                      account.status === "ACTIVE"
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              )}
                              {/* Status Badge */}
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                  account.status === "ACTIVE"
                                    ? "bg-success-100 text-success-800 dark:bg-success-950 dark:text-success-400 border-success-200 dark:border-success-900"
                                    : account.status === "PASSIVE"
                                    ? "bg-warning-100 text-warning-800 dark:bg-warning-950 dark:text-warning-400 border-warning-200 dark:border-warning-900"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                                }`}
                                title={getStatusTooltip(account)}
                              >
                                {account.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(account.createdAt).toLocaleDateString(
                              "tr-TR",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {account.startAt || account.endAt ? (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {account.startAt && (
                                  <div className="mb-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      Başlangıç:{" "}
                                    </span>
                                    <span>
                                      {new Date(
                                        account.startAt
                                      ).toLocaleDateString("tr-TR", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                )}
                                {account.endAt && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      Bitiş:{" "}
                                    </span>
                                    <span>
                                      {new Date(
                                        account.endAt
                                      ).toLocaleDateString("tr-TR", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                                Süresiz
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {/* History Button */}
                              <button
                                onClick={() =>
                                  handleViewHistory(
                                    account.accountId,
                                    account.firstName,
                                    account.lastName,
                                    account.email
                                  )
                                }
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-900 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
                                title="View membership history"
                              >
                                <History className="h-3.5 w-3.5 mr-1" />
                                History
                              </button>

                              {/* Remove Button */}
                              {account.status === "ACTIVE" &&
                                !isCurrentUser && (
                                  <button
                                    onClick={() =>
                                      handleRemoveAccount(
                                        account.accountId,
                                        account.email
                                      )
                                    }
                                    disabled={removeMutation.isPending}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-error-700 dark:text-error-400 bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-900 rounded-lg hover:bg-error-100 dark:hover:bg-error-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Remove
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {data.meta && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium">
                  {(data.meta.page - 1) * data.meta.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(data.meta.page * data.meta.limit, data.meta.total)}
                </span>{" "}
                of <span className="font-medium">{data.meta.total}</span>{" "}
                results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(data.meta.page - 1)}
                  disabled={!data.meta.hasPreviousPage}
                  className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {data.meta.page} of {data.meta.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(data.meta.page + 1)}
                  disabled={!data.meta.hasNextPage}
                  className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
                {/* Page Size Selector */}
                <div className="relative ml-3">
                  <select
                    aria-label="Items per page"
                    value={filters.limit}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        page: 1,
                        limit: Number(e.target.value),
                      }))
                    }
                    className="h-8 appearance-none pr-8 pl-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                  >
                    {[1, 3, 5, 10, 20, 50, 100].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt} / page
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={removeConfirm.isOpen}
        onClose={() =>
          setRemoveConfirm({ isOpen: false, accountId: "", email: "" })
        }
        onConfirm={handleConfirmRemove}
        title="Remove Member"
        message={`Are you sure you want to remove ${removeConfirm.email} from this workspace?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};
