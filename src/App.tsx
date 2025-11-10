import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AccountProfile } from './features/account/components/AccountProfile';
import { LoginForm } from './features/auth/components/LoginForm';
import { SignUpForm } from './features/auth/components/SignUpForm';
import { VerifyAccountForm } from './features/auth/components/VerifyAccountForm';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { logout } from './store/slices/authSlice';

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
};

// Dashboard placeholder
const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      const { logout: logoutApi } = await import('./features/auth/api/authApi');
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">KAPI Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/account')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to KAPI!</h2>
          <p className="text-gray-600 text-lg">You are successfully logged in.</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/login" element={<LoginForm />} />
        <Route path="/auth/sign-up" element={<SignUpForm />} />
        <Route path="/auth/verify" element={<VerifyAccountForm />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountProfile />
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
