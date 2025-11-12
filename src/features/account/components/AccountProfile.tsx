import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccountSelf } from '../api/accountApi';
import { createPhone, updatePhone, deletePhone } from '../api/phoneApi';
import { createAddress, updateAddress, deleteAddress } from '../api/addressApi';
import { PhoneFormDialog, type PhoneFormData } from './PhoneFormDialog';
import { AddressFormDialog, type AddressFormData } from './AddressFormDialog';
import type { PhoneResponse, AddressResponse } from '../../../types';
import { User, Mail, Shield, Clock, Phone, MapPin, Edit2, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';

type TabType = 'overview' | 'personal' | 'security' | 'contact' | 'addresses';

export const AccountProfile = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Dialog states
  const [phoneDialog, setPhoneDialog] = useState<{ isOpen: boolean; phone: PhoneResponse | null }>({
    isOpen: false,
    phone: null,
  });
  const [addressDialog, setAddressDialog] = useState<{ isOpen: boolean; address: AddressResponse | null }>({
    isOpen: false,
    address: null,
  });

  const { data: account, isLoading, error } = useQuery({
    queryKey: ['account', 'self'],
    queryFn: getAccountSelf,
  });

  // Phone mutations
  const createPhoneMutation = useMutation({
    mutationFn: createPhone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'self'] });
      setPhoneDialog({ isOpen: false, phone: null });
      alert('✅ Phone added successfully!');
    },
    onError: (error: any) => {
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    },
  });

  const updatePhoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PhoneFormData }) => updatePhone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'self'] });
      setPhoneDialog({ isOpen: false, phone: null });
      alert('✅ Phone updated successfully!');
    },
    onError: (error: any) => {
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    },
  });

  const deletePhoneMutation = useMutation({
    mutationFn: deletePhone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'self'] });
      alert('🗑️ Phone deleted successfully!');
    },
    onError: (error: any) => {
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    },
  });

  // Address mutations
  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'self'] });
      setAddressDialog({ isOpen: false, address: null });
      alert('✅ Address added successfully!');
    },
    onError: (error: any) => {
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddressFormData }) => updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'self'] });
      setAddressDialog({ isOpen: false, address: null });
      alert('✅ Address updated successfully!');
    },
    onError: (error: any) => {
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'self'] });
      alert('🗑️ Address deleted successfully!');
    },
    onError: (error: any) => {
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    },
  });

  // Handlers
  const handlePhoneSubmit = (data: PhoneFormData) => {
    if (phoneDialog.phone) {
      updatePhoneMutation.mutate({ id: phoneDialog.phone.id, data });
    } else {
      createPhoneMutation.mutate(data);
    }
  };

  const handleAddressSubmit = (data: AddressFormData) => {
    if (addressDialog.address) {
      updateAddressMutation.mutate({ id: addressDialog.address.id, data });
    } else {
      createAddressMutation.mutate(data);
    }
  };

  const handleDeletePhone = (id: string) => {
    if (confirm('Are you sure you want to delete this phone?')) {
      deletePhoneMutation.mutate(id);
    }
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-6 border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-4">
        <p className="text-error-800 dark:text-error-400 font-medium">Failed to load account information.</p>
      </div>
    );
  }

  const getInitials = () => {
    const firstName = account?.parameters?.firstName || '';
    const lastName = account?.parameters?.lastName || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return account?.email?.[0]?.toUpperCase() || 'U';
  };

  const getFullName = () => {
    const firstName = account?.parameters?.firstName || '';
    const lastName = account?.parameters?.lastName || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return 'User';
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: User },
    { id: 'personal' as TabType, label: 'Personal Info', icon: User },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
    { id: 'contact' as TabType, label: 'Contact', icon: Phone },
    { id: 'addresses' as TabType, label: 'Addresses', icon: MapPin },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Compact Header */}
        <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-600 dark:to-brand-700 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {getInitials()}
                </div>
                {account.verifiedAt && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 bg-success-500 dark:bg-success-600 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-800 dark:text-white/90 truncate">
                  {getFullName()}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  {account.email}
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2">
                {account.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-800 dark:bg-success-950 dark:text-success-400 border border-success-200 dark:border-success-900">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-error-100 text-error-800 dark:bg-error-950 dark:text-error-400 border border-error-200 dark:border-error-900">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-gray-200 dark:border-gray-800">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-5 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
                  <User className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{getFullName()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-5 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success-50 dark:bg-success-950 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-success-600 dark:text-success-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {account.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-5 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phones</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {account.phones?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-5 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Addresses</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {account.addresses?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                Personal Information
              </h2>
            </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">First Name</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {account.parameters.firstName || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Name</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {account.parameters.lastName || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Address</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate ml-4">
                    {account.email}
                  </span>
                </div>
              </div>
            </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                <Shield className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                Account Security
              </h2>
            </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Account ID</span>
                  <span className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                    {account.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verification Status</span>
                  {account.verifiedAt ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-800 dark:bg-success-950 dark:text-success-400 border border-success-200 dark:border-success-900">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-warning-100 text-warning-800 dark:bg-warning-950 dark:text-warning-400 border border-warning-200 dark:border-warning-900">
                      Not Verified
                    </span>
                  )}
                </div>
                {account.verifiedAt && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified Date</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(account.verifiedAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {account.lastLoginAt && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Last Login
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(account.lastLoginAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
        )}

        {activeTab === 'contact' && (
          <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                Phone Numbers
              </h2>
                <button
                  onClick={() => setPhoneDialog({ isOpen: true, phone: null })}
                  className="inline-flex items-center px-3 py-2 bg-brand-500 text-white text-xs font-medium rounded-lg hover:bg-brand-600 transition-colors shadow-theme-xs dark:bg-brand-600 dark:hover:bg-brand-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>
              <div className="p-6">
                {account.phones && account.phones.length > 0 ? (
                  <div className="space-y-3">
                    {account.phones.map((phone) => (
                      <div key={phone.id} className="group relative p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{phone.name || 'Phone'}</p>
                              {phone.isDefault && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{phone.fullNumber}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {phone.countryCode} ({phone.dialCode})
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setPhoneDialog({ isOpen: true, phone })}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 rounded-lg transition-colors"
                              title="Edit phone"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePhone(phone.id)}
                              disabled={deletePhoneMutation.isPending}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-error-600 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-950 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete phone"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                      <Phone className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No phone numbers added yet</p>
                    <button
                      onClick={() => setPhoneDialog({ isOpen: true, phone: null })}
                      className="mt-3 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                    >
                      + Add your first phone
                    </button>
                  </div>
                )}
              </div>
            </div>
        )}

        {activeTab === 'addresses' && (
          <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                Addresses
              </h2>
                <button
                  onClick={() => setAddressDialog({ isOpen: true, address: null })}
                  className="inline-flex items-center px-3 py-2 bg-brand-500 text-white text-xs font-medium rounded-lg hover:bg-brand-600 transition-colors shadow-theme-xs dark:bg-brand-600 dark:hover:bg-brand-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>
              <div className="p-6">
                {account.addresses && account.addresses.length > 0 ? (
                  <div className="space-y-3">
                    {account.addresses.map((address) => (
                      <div key={address.id} className="group relative p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{address.name || 'Address'}</p>
                              {address.isDefault && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
                                  Default
                                </span>
                              )}
                              {address.isInvoice && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
                                  Invoice
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                              {address.line1 && <p>{address.line1}</p>}
                              {address.line2 && <p className="text-gray-600 dark:text-gray-400">{address.line2}</p>}
                              <p className="text-gray-600 dark:text-gray-400">
                                {[address.district, address.state, address.country, address.zipCode]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setAddressDialog({ isOpen: true, address })}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 rounded-lg transition-colors"
                              title="Edit address"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              disabled={deleteAddressMutation.isPending}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-error-600 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-950 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete address"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                      <MapPin className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No addresses added yet</p>
                    <button
                      onClick={() => setAddressDialog({ isOpen: true, address: null })}
                      className="mt-3 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                    >
                      + Add your first address
                    </button>
                  </div>
                )}
              </div>
            </div>
        )}
      </div>

      {/* Dialogs */}
      <PhoneFormDialog
        isOpen={phoneDialog.isOpen}
        onClose={() => setPhoneDialog({ isOpen: false, phone: null })}
        onSubmit={handlePhoneSubmit}
        phone={phoneDialog.phone}
        isLoading={createPhoneMutation.isPending || updatePhoneMutation.isPending}
      />

      <AddressFormDialog
        isOpen={addressDialog.isOpen}
        onClose={() => setAddressDialog({ isOpen: false, address: null })}
        onSubmit={handleAddressSubmit}
        address={addressDialog.address}
        isLoading={createAddressMutation.isPending || updateAddressMutation.isPending}
      />
    </>
  );
};

