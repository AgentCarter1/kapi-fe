import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings, Menu, AlertTriangle } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { WorkspaceSelector } from "../components/WorkspaceSelector";
import { ProfileDropdown } from "../components/ProfileDropdown";
import { ThemeToggleButton } from "../components/ThemeToggleButton";
import WorkspaceManagementDialog from "../features/workspace/components/WorkspaceManagementDialog";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { getAccountSelf } from "../features/account/api/accountApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUser, setCurrentWorkspace } from "../store/slices/authSlice";
import { getWorkspaces } from "../api/endpoints/workspaces";
import toast from "react-hot-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<DashboardLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentWorkspace = useAppSelector(
    (state) => state.auth.currentWorkspace
  );
  const [isWorkspaceManagementOpen, setIsWorkspaceManagementOpen] =
    useState(false);
  const { isExpanded, isHovered, toggleMobile } = useSidebar();

  // Fetch workspaces to check for default workspace
  const { data: workspaces } = useQuery({
    queryKey: ["account-workspaces"],
    queryFn: getWorkspaces,
  });

  // Fetch user profile
  const { data: accountData } = useQuery({
    queryKey: ["account", "self"],
    queryFn: getAccountSelf,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Update Redux state when user data is fetched
  useEffect(() => {
    if (!accountData) return;

    const nextUser = {
      id: accountData.id,
      email: accountData.email,
      firstName: accountData.parameters?.firstName || "",
      lastName: accountData.parameters?.lastName || "",
      isActive: accountData.isActive ?? false,
      verifiedAt: accountData.verifiedAt,
      isSuperAdmin: accountData.isSuperAdmin ?? false,
    };

    const shouldUpdate =
      !currentUser ||
      currentUser.id !== nextUser.id ||
      currentUser.email !== nextUser.email ||
      (currentUser.firstName || "") !== nextUser.firstName ||
      (currentUser.lastName || "") !== nextUser.lastName ||
      (currentUser.isActive ?? false) !== (nextUser.isActive ?? false) ||
      (currentUser.verifiedAt ?? null) !== (nextUser.verifiedAt ?? null) ||
      Boolean(currentUser.isSuperAdmin) !== Boolean(nextUser.isSuperAdmin);

    if (shouldUpdate) {
      dispatch(setUser(nextUser));
    }
  }, [accountData, currentUser, dispatch]);

  // Check if current workspace is PASSIVE and redirect to default
  // IMPORTANT: This only sets current workspace, does NOT change default workspace
  useEffect(() => {
    if (
      currentWorkspace &&
      currentWorkspace.status === "PASSIVE" &&
      workspaces &&
      workspaces.length > 0
    ) {
      // Step 1: Check if default workspace is ACTIVE
      const defaultWorkspace = workspaces.find((w) => w.isDefault);

      // Step 2: Check if current workspace is the default workspace
      const isCurrentWorkspaceDefault =
        currentWorkspace.workspaceId === defaultWorkspace?.workspaceId;

      let targetWorkspace = null;

      if (defaultWorkspace && defaultWorkspace.status === "ACTIVE") {
        // Default workspace is ACTIVE - use it (don't change default)
        targetWorkspace = defaultWorkspace;
      } else if (
        defaultWorkspace &&
        defaultWorkspace.status === "PASSIVE" &&
        isCurrentWorkspaceDefault
      ) {
        // Step 3: Current workspace IS the default workspace AND it's PASSIVE
        // Find primaryOwner's first ACTIVE workspace (but don't change default here)
        targetWorkspace = workspaces.find(
          (w) => w.status === "ACTIVE" && w.accountType === "primaryOwner"
        );

        if (!targetWorkspace) {
          // No primaryOwner ACTIVE workspace - find any ACTIVE workspace
          targetWorkspace = workspaces.find((w) => w.status === "ACTIVE");
        }
      } else if (
        defaultWorkspace &&
        defaultWorkspace.status === "PASSIVE" &&
        !isCurrentWorkspaceDefault
      ) {
        // Step 4: Current workspace is NOT the default workspace, but default is PASSIVE
        // Find primaryOwner's first ACTIVE workspace (don't change default)
        targetWorkspace = workspaces.find(
          (w) => w.status === "ACTIVE" && w.accountType === "primaryOwner"
        );

        if (!targetWorkspace) {
          // No primaryOwner ACTIVE workspace - find any ACTIVE workspace
          targetWorkspace = workspaces.find((w) => w.status === "ACTIVE");
        }
      } else {
        // No default workspace - find primaryOwner's first ACTIVE workspace
        targetWorkspace = workspaces.find(
          (w) => w.status === "ACTIVE" && w.accountType === "primaryOwner"
        );

        if (!targetWorkspace) {
          // No primaryOwner ACTIVE workspace - find any ACTIVE workspace
          targetWorkspace = workspaces.find((w) => w.status === "ACTIVE");
        }
      }

      if (
        targetWorkspace &&
        targetWorkspace.workspaceId !== currentWorkspace.workspaceId
      ) {
        dispatch(setCurrentWorkspace(targetWorkspace));
        toast.error(
          "Bu workspace'de pasif durumdasınız. Aktif bir workspace'e yönlendirildiniz."
        );
      } else if (!targetWorkspace) {
        toast.error(
          "Bu workspace'de pasif durumdasınız. Aktif bir workspace bulunamadı."
        );
      }
    }
  }, [currentWorkspace, workspaces, dispatch]);

  const isPassive = currentWorkspace?.status === "PASSIVE";

  return (
    <div className="min-h-screen xl:flex">
      <Sidebar />

      {/* Workspace Management Dialog */}
      <WorkspaceManagementDialog
        isOpen={isWorkspaceManagementOpen}
        onClose={() => setIsWorkspaceManagementOpen(false)}
      />

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-999 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col items-center justify-between flex-grow lg:flex-row lg:px-6">
            <div className="flex items-center justify-between w-full gap-2 px-3 py-3 lg:justify-normal lg:px-0 lg:py-4">
              {/* Mobile Menu Toggle */}
              <button
                className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg lg:hidden dark:border-gray-800 dark:text-gray-400"
                onClick={toggleMobile}
                aria-label="Toggle Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Left: Workspace Management Button */}
              <button
                onClick={() => setIsWorkspaceManagementOpen(true)}
                className="hidden lg:inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                title="Manage your workspaces"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Workspace Management</span>
              </button>

              {/* Right: Theme Toggle, Workspace Selector & Profile */}
              <div className="flex items-center ml-auto space-x-2">
                <ThemeToggleButton />
                <WorkspaceSelector />
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </header>

        {/* Passive Workspace Warning Banner */}
        {isPassive && (
          <div className="bg-warning-50 dark:bg-warning-950/30 border-b border-warning-200 dark:border-warning-900 px-4 py-3">
            <div className="max-w-screen-2xl mx-auto flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning-800 dark:text-warning-300">
                  Bu workspace'de pasif durumdasınız. İşlem yapamazsınız.
                </p>
                <p className="text-xs text-warning-700 dark:text-warning-400 mt-1">
                  Lütfen workspace yönetiminden aktif bir workspace seçin veya
                  default workspace'inize geçin.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="p-4 mx-auto max-w-screen-2xl md:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};
