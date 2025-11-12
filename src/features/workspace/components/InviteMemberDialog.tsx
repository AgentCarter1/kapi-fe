import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar } from 'lucide-react';
import { useCreateInvite } from '../api/invitationApi';
import type { AccessKeyData } from '../../../api/endpoints/workspaceInvitations';

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  isOpen,
  onClose,
  workspaceId,
}) => {
  const [email, setEmail] = useState('');
  const [expireAt, setExpireAt] = useState('');
  const [tempBeginAt, setTempBeginAt] = useState('');
  const [tempEndAt, setTempEndAt] = useState('');
  const [accessKeys, setAccessKeys] = useState<AccessKeyData[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAccessKeys, setShowAccessKeys] = useState(false);

  const createInviteMutation = useCreateInvite(workspaceId);

  // Set default expiration date (3 days from now) when dialog opens
  useEffect(() => {
    if (isOpen && !expireAt) {
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);
      setExpireAt(threeDaysLater.toISOString().slice(0, 16));
    }
  }, [isOpen]);

  const handleAddAccessKey = () => {
    setAccessKeys([...accessKeys, { accessKeyType: 'rfid', data: '' }]);
  };

  const handleRemoveAccessKey = (index: number) => {
    setAccessKeys(accessKeys.filter((_, i) => i !== index));
  };

  const handleAccessKeyChange = (index: number, field: keyof AccessKeyData, value: string | number) => {
    const updated = [...accessKeys];
    updated[index] = { ...updated[index], [field]: value };
    setAccessKeys(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createInviteMutation.mutateAsync({
        email,
        expireAt,
        tempBeginAt: tempBeginAt || undefined,
        tempEndAt: tempEndAt || undefined,
        accessKeys: accessKeys.length > 0 ? accessKeys : undefined,
        isActive: true,
      });

      // Show success toast
      alert('✨ Invitation sent successfully!');
      
      // Reset form and close
      setEmail('');
      setExpireAt('');
      setTempBeginAt('');
      setTempEndAt('');
      setAccessKeys([]);
      setShowAdvanced(false);
      setShowAccessKeys(false);
      onClose();
    } catch (error) {
      console.error('Failed to create invite:', error);
      alert('❌ Failed to send invitation. Please try again.');
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-950 dark:to-brand-900">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white/90">Invite Member</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Send an invitation to join this workspace</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form id="invite-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email Address <span className="text-error-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="invitee@example.com"
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Invitation Expires At <span className="text-error-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={expireAt}
              onChange={(e) => setExpireAt(e.target.value)}
              required
              min={getMinDate()}
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
            />
          </div>

          {/* Advanced Option 1: Temporary Access Period */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/30">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  ⏱️ Temporary Access Period
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Set a limited time period for access
                </p>
              </div>
              <span className="text-brand-600 dark:text-brand-400 text-sm font-medium">
                {showAdvanced ? '− Hide' : '+ Show'}
              </span>
            </button>

            {showAdvanced && (
              <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Begin At
                    </label>
                    <input
                      type="datetime-local"
                      value={tempBeginAt}
                      onChange={(e) => setTempBeginAt(e.target.value)}
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      End At
                    </label>
                    <input
                      type="datetime-local"
                      value={tempEndAt}
                      onChange={(e) => setTempEndAt(e.target.value)}
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Option 2: Access Keys */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/30">
            <button
              type="button"
              onClick={() => setShowAccessKeys(!showAccessKeys)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  🔑 Physical Access Keys
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Add RFID cards or PIN codes
                </p>
              </div>
              <span className="text-brand-600 dark:text-brand-400 text-sm font-medium">
                {showAccessKeys ? '− Hide' : '+ Show'}
              </span>
            </button>

            {showAccessKeys && (
              <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {accessKeys.length === 0
                      ? 'No access keys added yet'
                      : `${accessKeys.length} access key(s) configured`}
                  </p>
                  <button
                    type="button"
                    onClick={handleAddAccessKey}
                    className="flex items-center text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Key
                  </button>
                </div>

                <div className="space-y-3">
                  {accessKeys.map((key, index) => (
                    <div key={index} className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={key.accessKeyType}
                          onChange={(e) =>
                            handleAccessKeyChange(index, 'accessKeyType', e.target.value)
                          }
                          className="w-32 h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90"
                        >
                          <option value="rfid">RFID</option>
                          <option value="pinCode">PIN</option>
                        </select>
                        <input
                          type="text"
                          value={key.data}
                          onChange={(e) => handleAccessKeyChange(index, 'data', e.target.value)}
                          placeholder={
                            key.accessKeyType === 'rfid'
                              ? 'Enter RFID number (e.g., 1234567890)'
                              : 'Enter PIN code (e.g., 1234)'
                          }
                          required
                          className="flex-1 h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAccessKey(index)}
                          className="flex-shrink-0 p-2 text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300 hover:bg-error-50 dark:hover:bg-error-950 rounded-lg transition-colors"
                          title="Remove access key"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer - Outside form */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="invite-form"
            disabled={createInviteMutation.isPending}
            className="px-6 py-2.5 text-sm font-medium text-white bg-brand-500 dark:bg-brand-600 rounded-lg hover:bg-brand-600 dark:hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-theme-xs"
          >
            {createInviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
};

