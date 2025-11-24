import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AccountProfile } from './features/account/components/AccountProfile';
import { AccountInvites } from './features/account/components/AccountInvites';
import { LoginForm } from './features/auth/components/LoginForm';
import { SignUpForm } from './features/auth/components/SignUpForm';
import { VerifyAccountForm } from './features/auth/components/VerifyAccountForm';
import { ForgotPasswordForm } from './features/auth/components/ForgotPasswordForm';
import { VerifyForgotPasswordOtpForm } from './features/auth/components/VerifyForgotPasswordOtpForm';
import { ResetPasswordForm } from './features/auth/components/ResetPasswordForm';
import { AuthGoogleCallback } from './features/auth/components/AuthGoogleCallback';
import { AdminLoginForm } from './features/auth/components/AdminLoginForm';
import { AdminDashboardLayout } from './layouts/AdminDashboardLayout';
import { AdminDashboard } from './features/admin/pages/AdminDashboard';
import { AdminAccountsPage } from './features/admin/pages/AdminAccountsPage';
import { AdminDevicesPage } from './features/admin/pages/AdminDevicesPage';
import { AdminWorkspacesPage } from './features/admin/pages/AdminWorkspacesPage';
import { AdminLicensesPage } from './features/admin/pages/AdminLicensesPage';
import { WorkspaceAccountsPage } from './features/workspace/pages/WorkspaceAccountsPage';
import { WorkspaceInvitationsPage } from './features/workspace/pages/WorkspaceInvitationsPage';
import { WorkspaceCredentialCodesPage } from './features/workspace/pages/WorkspaceCredentialCodesPage';
import { WorkspaceAccessHistoryPage } from './features/workspace/pages/WorkspaceAccessHistoryPage';
import { WorkspaceLicensePage } from './features/workspace/pages/WorkspaceLicensePage';
import { WorkspaceAntiPassbacksPage } from './features/anti-passback/pages/WorkspaceAntiPassbacksPage';
import { Zones } from './features/zone/pages/Zones';
import { Devices } from './features/device/pages/Devices';
import { Building } from './features/building/pages/Building';
import { DashboardLayout } from './layouts/DashboardLayout';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setCredentials } from './store/slices/authSlice';

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
};

// Dashboard Home
const DashboardHome = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to KAPI!</h2>
      <p className="text-gray-600 text-lg">You are successfully logged in.</p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Workspace Members</dt>
                  <dd className="text-lg font-medium text-gray-900">View & Manage</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  
  // Listen for token refresh events from apiClient interceptor
  useEffect(() => {
    const handleTokensRefreshed = (event: CustomEvent<{ accessToken: string; refreshToken: string }>) => {
      dispatch(setCredentials({
        accessToken: event.detail.accessToken,
        refreshToken: event.detail.refreshToken,
      }));
    };

    window.addEventListener('tokensRefreshed', handleTokensRefreshed as EventListener);

    return () => {
      window.removeEventListener('tokensRefreshed', handleTokensRefreshed as EventListener);
    };
  }, [dispatch]);
  
  return (
    <BrowserRouter>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
            borderRadius: '0.5rem',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/login" element={<LoginForm />} />
        <Route path="/auth/sign-up" element={<SignUpForm />} />
        <Route path="/auth/verify" element={<VerifyAccountForm />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/auth/forgot-password/verify-otp" element={<VerifyForgotPasswordOtpForm />} />
        <Route path="/auth/reset-password" element={<ResetPasswordForm />} />
        <Route path="/auth/google/callback" element={<AuthGoogleCallback />} />
        
        {/* Admin Auth Routes */}
        <Route path="/auth/admin/login" element={<AdminLoginForm />} />
        
        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardLayout>
                <AdminDashboard />
              </AdminDashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/accounts"
          element={
            <ProtectedRoute>
              <AdminDashboardLayout>
                <AdminAccountsPage />
              </AdminDashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/devices"
          element={
            <ProtectedRoute>
              <AdminDashboardLayout>
                <AdminDevicesPage />
              </AdminDashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/workspaces"
          element={
            <ProtectedRoute>
              <AdminDashboardLayout>
                <AdminWorkspacesPage />
              </AdminDashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/licenses"
          element={
            <ProtectedRoute>
              <AdminDashboardLayout>
                <AdminLicensesPage />
              </AdminDashboardLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardHome />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AccountProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/invites"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AccountInvites />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/zones"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Zones />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/devices"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Devices />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/building"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Building />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Accounts Routes */}
        <Route
          path="/workspace/accounts/members"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WorkspaceAccountsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/accounts/invitations"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WorkspaceInvitationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/accounts/credential-codes"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WorkspaceCredentialCodesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/accounts/access-history"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WorkspaceAccessHistoryPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* License Route */}
        <Route
          path="/workspace/license"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WorkspaceLicensePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Anti-passback Route */}
        <Route
          path="/workspace/anti-passback"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WorkspaceAntiPassbacksPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Redirect old routes */}
        <Route path="/workspace/members" element={<Navigate to="/workspace/accounts/members" replace />} />
        <Route path="/workspace/invitations" element={<Navigate to="/workspace/accounts/invitations" replace />} />
        <Route path="/workspace/settings" element={<Navigate to="/workspace/accounts/access-history" replace />} />
        
        {/* Redirect root based on auth status */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/auth/login" replace />
          } 
        />
        
        {/* Catch all - redirect based on auth status */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/auth/login" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
