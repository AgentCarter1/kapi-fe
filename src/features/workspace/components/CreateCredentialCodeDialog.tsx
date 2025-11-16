import { useState, useEffect, useMemo } from 'react';
import { X, Phone, Trash2, ChevronDown, ChevronUp, CreditCard, AlertCircle, Package, Plus, Minus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { createCredentialCode, createBulkCredentialCode } from '../api/credentialCodeApi';
import { useWorkspaceLicenseStatus } from '../api/workspaceLicenseApi';
import type { PhoneFormData } from '../../account/components/PhoneFormDialog';

const createCredentialCodeSchema = z.object({
  firstName: z.string().max(255).optional(),
  lastName: z.string().max(255).optional(),
  email: z.string().email().max(255).optional().or(z.literal('')),
});

type CreateCredentialCodeFormData = z.infer<typeof createCredentialCodeSchema>;

interface CreateCredentialCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess?: () => void;
}

export const CreateCredentialCodeDialog = ({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: CreateCredentialCodeDialogProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState<PhoneFormData | null>(null);
  const [isPhoneFormOpen, setIsPhoneFormOpen] = useState(false);
  const [phoneFormData, setPhoneFormData] = useState<PhoneFormData>({
    name: '',
    countryCode: 'TR',
    dialCode: '+90',
    phoneNumber: '',
    isDefault: false,
  });
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkCount, setBulkCount] = useState<number>(1);

  const { data: licenseStatus, isLoading: isLoadingLicense } = useWorkspaceLicenseStatus(workspaceId);

  // Real-time license check for bulk creation
  const bulkLicenseCheck = useMemo(() => {
    if (!licenseStatus?.credentialCode || !isBulkMode || bulkCount <= 0) {
      return {
        isValid: true,
        wouldExceed: false,
        currentAfter: null,
        remainingAfter: null,
        percentageAfter: null,
      };
    }

    const { current, max, remaining } = licenseStatus.credentialCode;

    if (max === null || max === undefined) {
      return {
        isValid: true,
        wouldExceed: false,
        currentAfter: current + bulkCount,
        remainingAfter: null,
        percentageAfter: null,
      };
    }

    const currentAfter = current + bulkCount;
    const wouldExceed = currentAfter > max;
    const remainingAfter = wouldExceed ? 0 : max - currentAfter;
    const percentageAfter = (currentAfter / max) * 100;

    return {
      isValid: !wouldExceed,
      wouldExceed,
      currentAfter,
      remainingAfter,
      percentageAfter: Math.min(percentageAfter, 100),
    };
  }, [licenseStatus?.credentialCode, isBulkMode, bulkCount]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCredentialCodeFormData>({
    resolver: zodResolver(createCredentialCodeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  const handleRemovePhone = () => {
    setPhone(null);
    setIsPhoneFormOpen(false);
    // Reset form
    setPhoneFormData({
      name: '',
      countryCode: 'TR',
      dialCode: '+90',
      phoneNumber: '',
      isDefault: false,
    });
  };

  const handleTogglePhoneForm = () => {
    setIsPhoneFormOpen(!isPhoneFormOpen);
    if (!isPhoneFormOpen) {
      // Reset form when opening
      setPhoneFormData({
        name: '',
        countryCode: 'TR',
        dialCode: '+90',
        phoneNumber: '',
        isDefault: false,
      });
    }
  };

  const onSubmit = async (data: CreateCredentialCodeFormData) => {
    setIsSubmitting(true);
    try {
      if (isBulkMode) {
        // Bulk creation - no optional fields
        if (bulkLicenseCheck.wouldExceed) {
          toast.error(`Cannot create ${bulkCount} credential codes. This would exceed your license limit.`);
          setIsSubmitting(false);
          return;
        }

        await createBulkCredentialCode(workspaceId, { count: bulkCount });
        toast.success(`${bulkCount} credential code${bulkCount !== 1 ? 's' : ''} created successfully ✨`);
        queryClient.invalidateQueries({ queryKey: ['credential-codes', workspaceId] });
        queryClient.invalidateQueries({ queryKey: ['workspace-license', 'status', workspaceId] });
        onSuccess?.();
        onClose();
        return;
      }

      // Single creation - with optional fields
      // Remove empty strings and convert to undefined
      const payload: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: {
          name?: string;
          countryCode: string;
          dialCode: string;
          phoneNumber: string;
          isDefault?: boolean;
        };
      } = {};

      if (data.firstName?.trim()) {
        payload.firstName = data.firstName.trim();
      }
      if (data.lastName?.trim()) {
        payload.lastName = data.lastName.trim();
      }
      if (data.email?.trim()) {
        payload.email = data.email.trim();
      }
      
      // Format phone from PhoneFormData (either from saved phone or from form)
      const phoneToUse = phone || (isPhoneFormOpen && phoneFormData.phoneNumber ? phoneFormData : null);
      if (phoneToUse && phoneToUse.phoneNumber) {
        payload.phone = {
          name: phoneToUse.name || undefined,
          countryCode: phoneToUse.countryCode,
          dialCode: phoneToUse.dialCode,
          phoneNumber: phoneToUse.phoneNumber,
          isDefault: phoneToUse.isDefault || false,
        };
      }

      await createCredentialCode(workspaceId, payload);
      reset();
      setPhone(null);
      setIsPhoneFormOpen(false);
      setPhoneFormData({
        name: '',
        countryCode: 'TR',
        dialCode: '+90',
        phoneNumber: '',
        isDefault: false,
      });
      toast.success('Credential code created successfully ✨');
      queryClient.invalidateQueries({ queryKey: ['credential-codes', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-license', 'status', workspaceId] });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to create credential code:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create credential code';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog closes
  const handleClose = () => {
    reset();
    setPhone(null);
    setIsPhoneFormOpen(false);
    setIsBulkMode(false);
    setBulkCount(1);
    setPhoneFormData({
      name: '',
      countryCode: 'TR',
      dialCode: '+90',
      phoneNumber: '',
      isDefault: false,
    });
    onClose();
  };

  // Reset bulk mode when switching
  useEffect(() => {
    if (!isBulkMode) {
      setBulkCount(1);
    }
  }, [isBulkMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Create Credential Code
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Bulk Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Bulk Creation Mode
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Create multiple credential codes at once (optional fields will be empty)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsBulkMode(!isBulkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isBulkMode
                  ? 'bg-brand-500 dark:bg-brand-600'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isBulkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Bulk Count Input */}
          {isBulkMode && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Credential Codes <span className="text-error-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkCount(Math.max(1, bulkCount - 1))}
                    disabled={bulkCount <= 1 || isSubmitting}
                    className="flex items-center justify-center w-10 h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={bulkCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 1) {
                        setBulkCount(value);
                      } else if (e.target.value === '') {
                        setBulkCount(1);
                      }
                    }}
                    min={1}
                    required
                    disabled={isSubmitting}
                    className="flex-1 h-11 rounded-lg border border-gray-200 bg-white px-4 text-center text-sm font-semibold text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setBulkCount(bulkCount + 1)}
                    disabled={isSubmitting}
                    className="flex items-center justify-center w-10 h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real-time License Check for Bulk */}
              {licenseStatus?.credentialCode && (
                <div className={`rounded-lg border p-4 ${
                  bulkLicenseCheck.wouldExceed
                    ? 'bg-error-50 dark:bg-error-950 border-error-200 dark:border-error-800'
                    : bulkLicenseCheck.remainingAfter !== null && bulkLicenseCheck.remainingAfter <= 3
                    ? 'bg-warning-50 dark:bg-warning-950 border-warning-200 dark:border-warning-800'
                    : 'bg-brand-50 dark:bg-brand-950 border-brand-200 dark:border-brand-800'
                }`}>
                  <div className="flex items-start gap-3">
                    <CreditCard className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      bulkLicenseCheck.wouldExceed
                        ? 'text-error-600 dark:text-error-400'
                        : bulkLicenseCheck.remainingAfter !== null && bulkLicenseCheck.remainingAfter <= 3
                        ? 'text-warning-600 dark:text-warning-400'
                        : 'text-brand-600 dark:text-brand-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                          License Status After Creation
                        </h3>
                        {licenseStatus.credentialCode.max !== null && bulkLicenseCheck.currentAfter !== null ? (
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            bulkLicenseCheck.wouldExceed
                              ? 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300'
                              : bulkLicenseCheck.remainingAfter !== null && bulkLicenseCheck.remainingAfter <= 3
                              ? 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300'
                              : 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                          }`}>
                            {bulkLicenseCheck.currentAfter} / {licenseStatus.credentialCode.max}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Unlimited
                          </span>
                        )}
                      </div>
                      {licenseStatus.credentialCode.max !== null && bulkLicenseCheck.currentAfter !== null && (
                        <>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                bulkLicenseCheck.wouldExceed
                                  ? 'bg-error-500 dark:bg-error-600'
                                  : bulkLicenseCheck.remainingAfter !== null && bulkLicenseCheck.remainingAfter <= 3
                                  ? 'bg-warning-500 dark:bg-warning-600'
                                  : 'bg-brand-500 dark:bg-brand-600'
                              }`}
                              style={{
                                width: `${bulkLicenseCheck.percentageAfter}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">
                              {bulkLicenseCheck.wouldExceed ? (
                                <span className="text-error-600 dark:text-error-400 font-medium flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Would exceed limit by {bulkLicenseCheck.currentAfter - licenseStatus.credentialCode.max}
                                </span>
                              ) : bulkLicenseCheck.remainingAfter !== null ? (
                                <>
                                  <span className="font-medium text-gray-800 dark:text-white/90">
                                    {bulkLicenseCheck.remainingAfter}
                                  </span>
                                  {' '}slot{bulkLicenseCheck.remainingAfter !== 1 ? 's' : ''} remaining
                                </>
                              ) : (
                                'No limit'
                              )}
                            </span>
                            <span className="text-gray-500 dark:text-gray-500">
                              {bulkLicenseCheck.percentageAfter?.toFixed(0)}% used
                            </span>
                          </div>
                        </>
                      )}
                      {bulkLicenseCheck.wouldExceed && (
                        <p className="text-xs text-error-700 dark:text-error-400 mt-2">
                          Cannot create {bulkCount} credential codes. This would exceed your license limit of {licenseStatus.credentialCode.max}. You can create a maximum of {licenseStatus.credentialCode.max - licenseStatus.credentialCode.current} more codes.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* License Info Banner (for single mode) */}
          {!isBulkMode && licenseStatus?.credentialCode && (
            <div className={`rounded-lg border p-4 ${
              licenseStatus.credentialCode.isLimitReached
                ? 'bg-error-50 dark:bg-error-950 border-error-200 dark:border-error-800'
                : licenseStatus.credentialCode.remaining !== null && licenseStatus.credentialCode.remaining <= 3
                ? 'bg-warning-50 dark:bg-warning-950 border-warning-200 dark:border-warning-800'
                : 'bg-brand-50 dark:bg-brand-950 border-brand-200 dark:border-brand-800'
            }`}>
              <div className="flex items-start gap-3">
                <CreditCard className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  licenseStatus.credentialCode.isLimitReached
                    ? 'text-error-600 dark:text-error-400'
                    : licenseStatus.credentialCode.remaining !== null && licenseStatus.credentialCode.remaining <= 3
                    ? 'text-warning-600 dark:text-warning-400'
                    : 'text-brand-600 dark:text-brand-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      Credential Code Limit
                    </h3>
                    {licenseStatus.credentialCode.max !== null ? (
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        licenseStatus.credentialCode.isLimitReached
                          ? 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300'
                          : licenseStatus.credentialCode.remaining !== null && licenseStatus.credentialCode.remaining <= 3
                          ? 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300'
                          : 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                      }`}>
                        {licenseStatus.credentialCode.current} / {licenseStatus.credentialCode.max}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Unlimited
                      </span>
                    )}
                  </div>
                  {licenseStatus.credentialCode.max !== null && (
                    <>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            licenseStatus.credentialCode.isLimitReached
                              ? 'bg-error-500 dark:bg-error-600'
                              : licenseStatus.credentialCode.remaining !== null && licenseStatus.credentialCode.remaining <= 3
                              ? 'bg-warning-500 dark:bg-warning-600'
                              : 'bg-brand-500 dark:bg-brand-600'
                          }`}
                          style={{
                            width: `${Math.min((licenseStatus.credentialCode.current / licenseStatus.credentialCode.max) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {licenseStatus.credentialCode.remaining !== null ? (
                            <>
                              {licenseStatus.credentialCode.remaining === 0 ? (
                                <span className="text-error-600 dark:text-error-400 font-medium flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Limit reached
                                </span>
                              ) : (
                                <>
                                  <span className="font-medium text-gray-800 dark:text-white/90">
                                    {licenseStatus.credentialCode.remaining}
                                  </span>
                                  {' '}slot{licenseStatus.credentialCode.remaining !== 1 ? 's' : ''} remaining
                                </>
                              )}
                            </>
                          ) : (
                            'No limit'
                          )}
                        </span>
                        <span className="text-gray-500 dark:text-gray-500">
                          {((licenseStatus.credentialCode.current / licenseStatus.credentialCode.max) * 100).toFixed(0)}% used
                        </span>
                      </div>
                    </>
                  )}
                  {licenseStatus.credentialCode.isLimitReached && (
                    <p className="text-xs text-error-700 dark:text-error-400 mt-2">
                      You have reached your credential code limit. Please upgrade your license to create more codes.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Single Mode Form Fields */}
          {!isBulkMode && (
            <>
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name <span className="text-gray-400 text-xs">(optional)</span>
                </label>
            <input
              {...register('firstName')}
              type="text"
              placeholder="John"
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              {...register('lastName')}
              type="text"
              placeholder="Doe"
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="john.doe@example.com"
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            {phone ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {phone.name || 'Mobile'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {phone.dialCode} {phone.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhone}
                    className="p-1.5 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950 rounded transition-colors"
                    title="Remove phone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePhoneForm}
                  className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Change Phone
                  {isPhoneFormOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleTogglePhoneForm}
                className="w-full h-11 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Add Phone
                {isPhoneFormOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Phone Form (Collapsible) */}
            {isPhoneFormOpen && (
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      value={phoneFormData.name}
                      onChange={(e) => setPhoneFormData({ ...phoneFormData, name: e.target.value })}
                      placeholder="Mobile, Home, Work..."
                      className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Country Code
                      </label>
                      <input
                        type="text"
                        value={phoneFormData.countryCode}
                        onChange={(e) => setPhoneFormData({ ...phoneFormData, countryCode: e.target.value })}
                        placeholder="TR"
                        className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dial Code
                      </label>
                      <input
                        type="text"
                        value={phoneFormData.dialCode}
                        onChange={(e) => setPhoneFormData({ ...phoneFormData, dialCode: e.target.value })}
                        placeholder="+90"
                        className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phoneFormData.phoneNumber}
                      onChange={(e) => setPhoneFormData({ ...phoneFormData, phoneNumber: e.target.value })}
                      placeholder="5551234567"
                      className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={phoneFormData.isDefault}
                      onChange={(e) => setPhoneFormData({ ...phoneFormData, isDefault: e.target.checked })}
                      className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
                    />
                    <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Set as default phone
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (isBulkMode && bulkLicenseCheck.wouldExceed)}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 dark:bg-brand-600 rounded-lg hover:bg-brand-600 dark:hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting
                ? isBulkMode
                  ? `Creating ${bulkCount} code${bulkCount !== 1 ? 's' : ''}...`
                  : 'Creating...'
                : isBulkMode
                ? `Create ${bulkCount} Code${bulkCount !== 1 ? 's' : ''}`
                : 'Create Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

