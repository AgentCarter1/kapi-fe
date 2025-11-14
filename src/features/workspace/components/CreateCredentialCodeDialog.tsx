import { useState } from 'react';
import { X, Phone, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { createCredentialCode } from '../api/credentialCodeApi';
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
    setPhoneFormData({
      name: '',
      countryCode: 'TR',
      dialCode: '+90',
      phoneNumber: '',
      isDefault: false,
    });
    onClose();
  };

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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 dark:bg-brand-600 rounded-lg hover:bg-brand-600 dark:hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

