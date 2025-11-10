import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { WorkspaceSelector } from '../components/WorkspaceSelector';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      const { logout: logoutApi } = await import('../features/auth/api/authApi');
      await logoutApi();
      dispatch(logout());
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      navigate('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end items-center h-16 space-x-4">
              <WorkspaceSelector />
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

