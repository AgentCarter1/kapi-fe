/**
 * License error handling utilities
 * Maps backend error codes to user-friendly messages
 */

export const LICENSE_ERROR_CODES = {
  LICENSE_LIMIT_EXCEEDED: 6001,
  LICENSE_FEATURE_NOT_ENABLED: 6002,
} as const;

export const getLicenseErrorMessage = (error: any): string => {
  const customCode = error?.response?.data?.customCode;
  const message = error?.response?.data?.message || error?.message || 'An error occurred';

  // Backend already provides translated messages, so we can use them directly
  // But we can enhance them if needed
  switch (customCode) {
    case LICENSE_ERROR_CODES.LICENSE_LIMIT_EXCEEDED:
      return message || 'License limit exceeded. Please upgrade your plan.';
    case LICENSE_ERROR_CODES.LICENSE_FEATURE_NOT_ENABLED:
      return message || 'This feature is not available in your current license. Please upgrade your plan.';
    default:
      return message;
  }
};

