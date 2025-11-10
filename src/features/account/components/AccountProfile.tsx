import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAccountSelf } from '../api/accountApi';
import { createPhone, updatePhone, deletePhone } from '../api/phoneApi';
import { createAddress, updateAddress, deleteAddress } from '../api/addressApi';
import { useAppDispatch } from '../../../store/hooks';
import { logout as logoutAction } from '../../../store/slices/authSlice';
import { PhoneFormDialog, type PhoneFormData } from './PhoneFormDialog';
import { AddressFormDialog, type AddressFormData } from './AddressFormDialog';
import type { PhoneResponse, AddressResponse } from '../../../types';

export const AccountProfile = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

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

  const handleLogout = async () => {
    try {
      const { logout: logoutApi } = await import('../../auth/api/authApi');
      await logoutApi();
      dispatch(logoutAction());
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logoutAction());
      navigate('/auth/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Failed to load account information.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-bold text-gray-900">Account Profile</h1>
            </div>
            <div className="flex items-center">
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

      {/* Content */}
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Account Info Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500">Email</div>
                <div className="col-span-2 text-sm text-gray-900">{account.email}</div>
              </div>

              {account.parameters.firstName && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500">First Name</div>
                  <div className="col-span-2 text-sm text-gray-900">{account.parameters.firstName}</div>
                </div>
              )}

              {account.parameters.lastName && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500">Last Name</div>
                  <div className="col-span-2 text-sm text-gray-900">{account.parameters.lastName}</div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500">Account ID</div>
                <div className="col-span-2 text-sm text-gray-900 font-mono text-xs">{account.id}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500">Status</div>
                <div className="col-span-2">
                  {account.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {account.verifiedAt && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500">Verified At</div>
                  <div className="col-span-2 text-sm text-gray-900">
                    {new Date(account.verifiedAt).toLocaleString()}
                  </div>
                </div>
              )}

              {account.lastLoginAt && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500">Last Login</div>
                  <div className="col-span-2 text-sm text-gray-900">
                    {new Date(account.lastLoginAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phone Numbers Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">📱 Phone Numbers</h2>
              <button
                onClick={() => setPhoneDialog({ isOpen: true, phone: null })}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
              >
                + Add Phone
              </button>
            </div>
            <div className="px-6 py-4">
              {account.phones && account.phones.length > 0 ? (
                <div className="space-y-3">
                  {account.phones.map((phone) => (
                    <div key={phone.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{phone.name || 'Phone'}</p>
                        <p className="text-lg font-semibold text-gray-900">{phone.fullNumber}</p>
                        <p className="text-xs text-gray-500">
                          {phone.countryCode} ({phone.dialCode})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {phone.isDefault && (
                          <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded">
                            Default
                          </span>
                        )}
                        <button
                          onClick={() => setPhoneDialog({ isOpen: true, phone })}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePhone(phone.id)}
                          disabled={deletePhoneMutation.isPending}
                          className="px-3 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">No phone numbers added yet.</p>
              )}
            </div>
          </div>

          {/* Addresses Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">📍 Addresses</h2>
              <button
                onClick={() => setAddressDialog({ isOpen: true, address: null })}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition"
              >
                + Add Address
              </button>
            </div>
            <div className="px-6 py-4">
              {account.addresses && account.addresses.length > 0 ? (
                <div className="space-y-4">
                  {account.addresses.map((address) => (
                    <div key={address.id} className="p-4 bg-green-50 rounded-lg border border-green-200 hover:border-green-300 transition">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-700">{address.name || 'Address'}</p>
                        <div className="flex items-center gap-2">
                          {address.isDefault && (
                            <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded">
                              Default
                            </span>
                          )}
                          {address.isInvoice && (
                            <span className="px-2 py-1 text-xs font-semibold text-purple-800 bg-purple-200 rounded">
                              Invoice
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-700 mb-3">
                        {address.line1 && <p>{address.line1}</p>}
                        {address.line2 && <p>{address.line2}</p>}
                        <p>
                          {[address.district, address.state, address.country, address.zipCode]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAddressDialog({ isOpen: true, address })}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          disabled={deleteAddressMutation.isPending}
                          className="px-3 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">No addresses added yet.</p>
              )}
            </div>
          </div>

          {/* All Parameters Card (for debugging) */}
          {Object.keys(account.parameters).length > 0 && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">All Parameters</h2>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-3">
                  {Object.entries(account.parameters).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">{key}</dt>
                      <dd className="col-span-2 text-sm text-gray-900">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>
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
    </div>
  );
};

