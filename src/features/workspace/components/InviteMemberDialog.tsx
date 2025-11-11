import { useState } from 'react';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Invite Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="invitee@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Invitation Expires At *
            </label>
            <input
              type="datetime-local"
              value={expireAt}
              onChange={(e) => setExpireAt(e.target.value)}
              required
              min={getMinDate()}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Advanced Option 1: Temporary Access Period */}
          <div className="border border-gray-200 rounded-md">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  Temporary Access Period
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Set a limited time period for access
                </p>
              </div>
              <span className="text-blue-600 text-sm font-medium">
                {showAdvanced ? '− Hide' : '+ Show'}
              </span>
            </button>

            {showAdvanced && (
              <div className="p-4 pt-0 border-t border-gray-200 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Begin At
                    </label>
                    <input
                      type="datetime-local"
                      value={tempBeginAt}
                      onChange={(e) => setTempBeginAt(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      End At
                    </label>
                    <input
                      type="datetime-local"
                      value={tempEndAt}
                      onChange={(e) => setTempEndAt(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Option 2: Access Keys */}
          <div className="border border-gray-200 rounded-md">
            <button
              type="button"
              onClick={() => setShowAccessKeys(!showAccessKeys)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  Physical Access Keys
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Add RFID cards or PIN codes
                </p>
              </div>
              <span className="text-blue-600 text-sm font-medium">
                {showAccessKeys ? '− Hide' : '+ Show'}
              </span>
            </button>

            {showAccessKeys && (
              <div className="p-4 pt-0 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-600">
                    {accessKeys.length === 0
                      ? 'No access keys added yet'
                      : `${accessKeys.length} access key(s) configured`}
                  </p>
                  <button
                    type="button"
                    onClick={handleAddAccessKey}
                    className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Key
                  </button>
                </div>

                <div className="space-y-2">
                  {accessKeys.map((key, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={key.accessKeyType}
                        onChange={(e) =>
                          handleAccessKeyChange(index, 'accessKeyType', e.target.value)
                        }
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="rfid">RFID Card</option>
                        <option value="pinCode">PIN Code</option>
                      </select>
                      <input
                        type="text"
                        value={key.data}
                        onChange={(e) => handleAccessKeyChange(index, 'data', e.target.value)}
                        placeholder={
                          key.accessKeyType === 'rfid'
                            ? 'RFID number (e.g., 1234567890AB)'
                            : 'PIN code (e.g., 1234)'
                        }
                        required
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAccessKey(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createInviteMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createInviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

