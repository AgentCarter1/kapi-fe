import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { verifyAccount } from '../api/authApi';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials } from '../../../store/slices/authSlice';
import type { VerifyAccountRequest } from '../../../types';
import { useEffect, useState } from 'react';

interface LocationState {
  verifyAccountToken?: string;
  email?: string;
}

export const VerifyAccountForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
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
      // Save tokens to Redux and localStorage (same as login)
      dispatch(setCredentials({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }));
      
      // Navigate to dashboard (user is now logged in)
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Verification failed:', error.response?.data?.message || error.message);
      alert('❌ Verification failed: ' + (error.response?.data?.message || 'Invalid OTP code'));
    },
  });

  const onSubmit = (data: VerifyAccountRequest) => {
    verifyMutation.mutate(data);
  };

  if (!verifyToken) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your account
          </h2>
          {userEmail && (
            <>
              <p className="mt-2 text-center text-sm text-gray-600">
                We've sent a verification code to
              </p>
              <p className="text-center text-sm font-medium text-primary-600">
                {userEmail}
              </p>
            </>
          )}
          <p className="mt-2 text-center text-sm text-gray-500">
            Please enter the 6-digit code to verify your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* OTP Code Field */}
            <div>
              <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
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
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                autoComplete="off"
              />
              {errors.otpCode && (
                <p className="mt-1 text-sm text-red-600">{errors.otpCode.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={verifyMutation.isPending}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyMutation.isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Account'
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                className="font-medium text-primary-600 hover:text-primary-500"
                onClick={() => alert('Resend feature will be implemented')}
              >
                Resend code
              </button>
            </p>
            <p className="text-sm text-gray-600">
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="font-medium text-gray-700 hover:text-gray-900"
              >
                ← Back to login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

