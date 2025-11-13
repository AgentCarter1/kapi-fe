import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AccountProfile } from './features/account/components/AccountProfile';
import { AccountInvites } from './features/account/components/AccountInvites';
import { LoginForm } from './features/auth/components/LoginForm';
import { SignUpForm } from './features/auth/components/SignUpForm';
import { VerifyAccountForm } from './features/auth/components/VerifyAccountForm';
import { WorkspaceAccounts } from './features/workspace/components/WorkspaceAccounts';
import { WorkspaceInvitations } from './features/workspace/components/WorkspaceInvitations';
import { Zones } from './features/zone/pages/Zones';
import { DashboardLayout } from './layouts/DashboardLayout';
import { useAppSelector } from './store/hooks';

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
          path="/workspace/members"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WorkspaceAccounts />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/invitations"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WorkspaceInvitations />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
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
