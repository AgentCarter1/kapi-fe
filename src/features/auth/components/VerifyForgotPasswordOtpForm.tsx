import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { verifyForgotPasswordOtp } from '../api/authApi';
import type { VerifyForgotPasswordOtpRequest } from '../../../types';

interface LocationState {
  email?: string;
}

export const VerifyForgotPasswordOtpForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const email = state?.email || '';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyForgotPasswordOtpRequest>({
    defaultValues: {
      email,
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyForgotPasswordOtp,
    onSuccess: (data) => {
      toast.success('OTP verified successfully');
      // Navigate to reset password page with token
      navigate('/auth/reset-password', {
        state: {
          forgotPasswordToken: data.forgotPasswordToken,
        },
      });
    },
    onError: (error: any) => {
      const customCode = error.response?.data?.customCode;
      const message = error.response?.data?.message || error.message || 'Failed to verify OTP code';
      
      // OTP_INVALID (5001)
      if (customCode === 5001) {
        toast.error('Invalid or expired OTP code. Please try again.');
      } else {
        console.error('Verify OTP failed:', message);
        toast.error(message);
      }
    },
  });

  const onSubmit = (data: VerifyForgotPasswordOtpRequest) => {
    verifyOtpMutation.mutate(data);
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
            Verify OTP Code
          </h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Enter the 6-digit OTP code sent to your email address.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field (hidden if already provided) */}
          {!email && (
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
          )}

          {/* OTP Code Field */}
          <div>
            <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              OTP Code <span className="text-error-500">*</span>
            </label>
            <input
              id="otpCode"
              type="text"
              maxLength={6}
              {...register('otpCode', {
                required: 'OTP code is required',
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'OTP code must be exactly 6 digits',
                },
              })}
              placeholder="123456"
              className="w-full h-11 rounded-lg border border-gray-200 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-center text-2xl tracking-widest"
            />
            {errors.otpCode && (
              <p className="mt-2 text-sm text-error-600 dark:text-error-400">{errors.otpCode.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={verifyOtpMutation.isPending}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            {verifyOtpMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>

          {/* Back Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/forgot-password')}
                className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
              >
                Resend
              </button>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

