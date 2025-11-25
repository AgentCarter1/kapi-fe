import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { verifyAccount } from '../api/authApi';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials } from '../../../store/slices/authSlice';
import type { VerifyAccountRequest } from '../../../types';

interface LocationState {
  verifyAccountToken?: string;
  email?: string;
}

export const VerifyAccountForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const state = location.state as LocationState;
  
  // Get token from URL query parameter or location state
  const [verifyToken, setVerifyToken] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    const tokenFromState = state?.verifyAccountToken;
    const emailFromState = state?.email || '';

    const token = tokenFromUrl || tokenFromState || localStorage.getItem('verifyToken') || '';
    
    if (!token) {
      navigate('/auth/sign-up', { replace: true });
      return;
    }

    setVerifyToken(token);
    setUserEmail(emailFromState);

    // Clean up localStorage after reading
    if (tokenFromUrl && localStorage.getItem('verifyToken')) {
      localStorage.removeItem('verifyToken');
    }
  }, [searchParams, state, navigate]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyAccountRequest>();

  const verifyMutation = useMutation({
    mutationFn: (data: VerifyAccountRequest) => 
      verifyAccount(verifyToken, data),
    onSuccess: (data) => {
      queryClient.removeQueries({ queryKey: ['account', 'self'], exact: false });
      // Save tokens to Redux and localStorage (same as login)
      dispatch(setCredentials({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          id: data.accountId,
          email: data.email,
          isSuperAdmin: data.isSuperAdmin,
        },
      }));
      
      // Navigate to dashboard (user is now logged in)
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Verification failed:', error.response?.data?.message || error.message);
      const errorMessage = error.response?.data?.message || 'Invalid OTP code';
      toast.error(`Verification failed: ${errorMessage}`);
    },
  });

  const onSubmit = (data: VerifyAccountRequest) => {
    verifyMutation.mutate(data);
  };

  if (!verifyToken) {
    return null;
  }

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
            Verify your account
          </h1>
          {userEmail ? (
            <div className="space-y-1">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                We've sent a verification code to
              </p>
              <p className="text-center text-sm font-medium text-brand-500 dark:text-brand-400">
                {userEmail}
              </p>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Please enter the 6-digit code to verify your account
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* OTP Code Field */}
          <div>
            <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
              Verification Code <span className="text-error-500">*</span>
            </label>
            <input
              id="otpCode"
              type="text"
              maxLength={6}
              {...register('otpCode', {
                required: 'Verification code is required',
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'Code must be 6 digits',
                },
              })}
              placeholder="000000"
              autoComplete="off"
              className="w-full h-14 rounded-lg border border-gray-200 bg-transparent py-2.5 px-4 text-2xl text-gray-800 shadow-theme-xs placeholder:text-gray-300 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/20 dark:focus:border-brand-800 text-center tracking-[0.5em] font-mono"
            />
            {errors.otpCode && (
              <p className="mt-2 text-sm text-error-600 dark:text-error-400 text-center">{errors.otpCode.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={verifyMutation.isPending}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            {verifyMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Verify Account'
            )}
          </button>

          {/* Helper Links */}
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={() => toast('Resend feature will be implemented soon', { icon: 'ℹ️' })}
                  className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                >
                  Resend code
                </button>
              </p>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

