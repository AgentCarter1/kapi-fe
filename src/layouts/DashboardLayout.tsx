import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings, Menu } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { WorkspaceSelector } from '../components/WorkspaceSelector';
import { ProfileDropdown } from '../components/ProfileDropdown';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import WorkspaceManagementDialog from '../features/workspace/components/WorkspaceManagementDialog';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import { getAccountSelf } from '../features/account/api/accountApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser } from '../store/slices/authSlice';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<DashboardLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [isWorkspaceManagementOpen, setIsWorkspaceManagementOpen] = useState(false);
  const { isExpanded, isHovered, toggleMobile } = useSidebar();

  // Fetch user profile if not already loaded
  const { data: accountData } = useQuery({
    queryKey: ['account', 'self'],
    queryFn: getAccountSelf,
    enabled: !currentUser, // Only fetch if user is not in Redux
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Update Redux state when user data is fetched
  useEffect(() => {
    if (accountData && !currentUser) {
      dispatch(setUser({
        id: accountData.id,
        email: accountData.email,
        firstName: accountData.parameters?.firstName || '',
        lastName: accountData.parameters?.lastName || '',
        isActive: accountData.isActive ?? false,
        verifiedAt: accountData.verifiedAt,
      }));
    }
  }, [accountData, currentUser, dispatch]);

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
          isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
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

        {/* Main Content */}
        <main className="p-4 mx-auto max-w-screen-2xl md:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};

