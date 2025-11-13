import { Shield, Calendar, Check, X } from 'lucide-react';
import { useWorkspaceLicense } from '../api/workspaceLicenseApi';

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface WorkspaceLicenseProps {
  workspaceId: string;
}

export const WorkspaceLicense = ({ workspaceId }: WorkspaceLicenseProps) => {
  const { data: license, isLoading, error } = useWorkspaceLicense(workspaceId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 dark:border-brand-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-4">
        <p className="text-error-800 dark:text-error-400">
          Failed to load license information
        </p>
      </div>
    );
  }

  if (!license) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <Shield className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
          No Active License
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This workspace does not have an active license.
        </p>
      </div>
    );
  }

  const isExpired = license.expireAt && new Date(license.expireAt) < new Date();
  const daysUntilExpiry = license.expireAt 
    ? Math.ceil((new Date(license.expireAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* License Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-theme-xs overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-800 ${
          isExpired 
            ? 'bg-error-50 dark:bg-error-950' 
            : 'bg-brand-50 dark:bg-brand-950'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isExpired
                  ? 'bg-error-100 dark:bg-error-900'
                  : 'bg-brand-100 dark:bg-brand-900'
              }`}>
                <Shield className={`w-5 h-5 ${
                  isExpired 
                    ? 'text-error-600 dark:text-error-400'
                    : 'text-brand-600 dark:text-brand-400'
                }`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  isExpired
                    ? 'text-error-800 dark:text-error-400'
                    : 'text-brand-800 dark:text-brand-400'
                }`}>
                  {license.licenseTypeName}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  License ID: {license.id}
                </p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              license.isActive
                ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300'
                : 'bg-error-100 dark:bg-error-900 text-error-700 dark:text-error-300'
            }`}>
              {license.isActive ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  <span>Inactive</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Expiry Information */}
          {license.expireAt && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expiry Date
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {formatDate(license.expireAt)}
                </div>
                {daysUntilExpiry !== null && (
                  <div className={`text-xs mt-1 font-medium ${
                    isExpired 
                      ? 'text-error-600 dark:text-error-400'
                      : daysUntilExpiry <= 30
                        ? 'text-warning-600 dark:text-warning-400'
                        : 'text-success-600 dark:text-success-400'
                  }`}>
                    {isExpired 
                      ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                      : daysUntilExpiry === 0
                        ? 'Expires today!'
                        : daysUntilExpiry === 1
                          ? 'Expires tomorrow'
                          : `${daysUntilExpiry} days remaining`
                    }
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Created Date
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {formatDate(license.createdAt)}
              </div>
            </div>
          </div>

          {/* License Parameters */}
          {Object.keys(license.parameters).length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                License Parameters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(license.parameters).map(([key, value]) => (
                  <div 
                    key={key} 
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {key}
                    </div>
                    <div className="text-sm text-gray-800 dark:text-white/90 mt-0.5 font-mono">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

