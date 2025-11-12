import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { WorkspaceSelector } from '../components/WorkspaceSelector';
import { ProfileDropdown } from '../components/ProfileDropdown';
import WorkspaceManagementDialog from '../features/workspace/components/WorkspaceManagementDialog';
import { getAccountSelf } from '../features/account/api/accountApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser } from '../store/slices/authSlice';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [isWorkspaceManagementOpen, setIsWorkspaceManagementOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      
      {/* Workspace Management Dialog */}
      <WorkspaceManagementDialog
        isOpen={isWorkspaceManagementOpen}
        onClose={() => setIsWorkspaceManagementOpen(false)}
      />

      <div className="ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 space-x-4">
              {/* Left: Workspace Management Button */}
              <button
                onClick={() => setIsWorkspaceManagementOpen(true)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                title="Manage your workspaces"
              >
                <Settings className="h-4 w-4 mr-2" />
                Workspace Management
              </button>

              {/* Right: Workspace Selector & Profile */}
              <div className="flex items-center space-x-4">
                <WorkspaceSelector />
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

