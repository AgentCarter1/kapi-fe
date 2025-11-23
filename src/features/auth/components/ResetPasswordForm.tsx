import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword } from '../api/authApi';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials } from '../../../store/slices/authSlice';
import type { ResetPasswordRequest, LoginResponse } from '../../../types';

interface LocationState {
  forgotPasswordToken?: string;
}

export const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const state = location.state as LocationState;
  const forgotPasswordToken = state?.forgotPasswordToken || '';
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordRequest>();

  const password = watch('password');

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPassword(forgotPasswordToken, data),
    onSuccess: (data) => {
      toast.success(data.message || 'Password has been reset successfully');
      // Navigate to login page
      navigate('/auth/login');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to reset password';
      console.error('Reset password failed:', message);
      toast.error(message);
    },
  });

  const onSubmit = (data: ResetPasswordRequest) => {
    // Validate password confirmation
    if (data.password !== data.passwordConfirmation) {
      toast.error('Password and password confirmation do not match');
      return;
    }
    resetPasswordMutation.mutate(data);
  };

  // Redirect if no token
  if (!forgotPasswordToken) {
    navigate('/auth/forgot-password');
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
            Reset Password
          </h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Enter your new password below.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* New Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password <span className="text-error-500">*</span>
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
              placeholder="Enter your new password"
              className="w-full h-11 rounded-lg border border-gray-200 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-error-600 dark:text-error-400">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password <span className="text-error-500">*</span>
            </label>
            <input
              id="passwordConfirmation"
              type="password"
              {...register('passwordConfirmation', {
                required: 'Password confirmation is required',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              placeholder="Confirm your new password"
              className="w-full h-11 rounded-lg border border-gray-200 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            {errors.passwordConfirmation && (
              <p className="mt-2 text-sm text-error-600 dark:text-error-400">{errors.passwordConfirmation.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            {resetPasswordMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          {/* Back to Login Link */}
          <div className="text-center">
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

