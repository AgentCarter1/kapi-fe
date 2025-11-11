import { Sidebar } from '../components/Sidebar';
import { WorkspaceSelector } from '../components/WorkspaceSelector';
import { ProfileDropdown } from '../components/ProfileDropdown';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end items-center h-16 space-x-4">
              <WorkspaceSelector />
              <ProfileDropdown />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

