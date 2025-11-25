import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../api/authApi';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials } from '../../../store/slices/authSlice';
import type { LoginRequest } from '../../../types';

const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
  '86458822632-0bpboeq5igi7qqnl2n3vthpolv0qvren.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI =
  (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string) ||
  `${window.location.origin}/auth/google/callback`;
const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
  GOOGLE_CLIENT_ID,
)}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(
  'openid email profile',
)}&access_type=offline&prompt=consent`;
export const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.removeQueries({ queryKey: ['account', 'self'], exact: false });
      // Save tokens to Redux and localStorage
      dispatch(setCredentials({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          id: data.accountId,
          email: data.email,
          isSuperAdmin: data.isSuperAdmin,
        },
      }));
      
      // Navigate to dashboard
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const customCode = error.response?.data?.customCode;
      const message = error.response?.data?.message || error.message;
      
      // ACCOUNT_NOT_VERIFIED (1002) - Redirect to verify page
      if (customCode === 1002) {
        const verifyToken = error.response?.data?.errorData?.verifyAccountToken;
        const email = error.response?.data?.errorData?.email;
        
        if (verifyToken) {
          // Navigate to verify page with token
          navigate('/auth/verify', {
            state: {
              verifyAccountToken: verifyToken,
              email: email || '',
            },
          });
          return;
        }
      }
      
      console.error('Login failed:', message);
      toast.error(message);
    },
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500">
              <span className="text-2xl font-bold text-white">K</span>
            </div>
          </div>
          <h1 className="text-center font-semibold text-gray-800 dark:text-white/90 text-xl sm:text-2xl mb-2">
            Sign In
          </h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to sign in!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email <span className="text-error-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              placeholder="info@gmail.com"
              className="w-full h-11 rounded-lg border border-gray-200 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-error-600 dark:text-error-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password <span className="text-error-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              placeholder="Enter your password"
              className="w-full h-11 rounded-lg border border-gray-200 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-error-600 dark:text-error-400">{errors.password.message}</p>
            )}
          </div>

          {/* Or divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="px-3 text-xs uppercase text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={async () => {
              const encoder = new TextEncoder();
              const random = crypto.getRandomValues(new Uint8Array(32));
              const verifier = btoa(String.fromCharCode(...Array.from(random)))
                .replace(/=/g, '')
                .replace(/\+/g, '-')
                .replace(/\//g, '_');
              const data = encoder.encode(verifier);
              const digest = await crypto.subtle.digest('SHA-256', data);
              const challenge = btoa(String.fromCharCode(...Array.from(new Uint8Array(digest))))
                .replace(/=/g, '')
                .replace(/\+/g, '-')
                .replace(/\//g, '_');
              sessionStorage.setItem('google_pkce_verifier', verifier);
              const url = `${GOOGLE_AUTH_URL}&code_challenge=${challenge}&code_challenge_method=S256`;
              window.location.href = url;
            }}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-theme-xs transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
              <path fill="#ffc107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.861,8.337,6.306,14.691z"/>
              <path fill="#ff3d00" d="M6.306,14.691l6.571,4.819C14.655,16.108,19.005,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.861,8.337,6.306,14.691z"/>
              <path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.196l-6.191-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.957l-6.5,5.017C9.734,39.556,16.322,44,24,44z"/>
              <path fill="#1976d2" d="M43.611,20.083H42V20H24v8h11.303c-0.793,2.239-2.231,4.166-4.094,5.566 c0.001-0.001,0.002-0.001,0.003-0.002l6.191,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Continue with Google
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            {loginMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/auth/forgot-password')}
              className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/sign-up')}
                className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

