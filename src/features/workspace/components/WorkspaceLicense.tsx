import { 
  Shield, 
  Calendar, 
  Check, 
  X, 
  Users, 
  Cpu, 
  Key, 
  Globe, 
  Smartphone, 
  Bluetooth, 
  Monitor, 
  Clock, 
  Settings, 
  Zap,
  Lock,
  FileText,
  DollarSign,
  Info
} from 'lucide-react';
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

// Helper function to format parameter keys
const formatParameterKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Helper function to get parameter icon
const getParameterIcon = (key: string) => {
  const iconClass = "w-4 h-4";
  if (key.includes('maxUser')) return <Users className={iconClass} />;
  if (key.includes('maxDevice')) return <Cpu className={iconClass} />;
  if (key.includes('maxCredentialCode')) return <Key className={iconClass} />;
  if (key.includes('Web')) return <Globe className={iconClass} />;
  if (key.includes('Mobile')) return <Smartphone className={iconClass} />;
  if (key.includes('Bluetooth')) return <Bluetooth className={iconClass} />;
  if (key.includes('RemoteAccess')) return <Monitor className={iconClass} />;
  if (key.includes('Time') || key.includes('duration')) return <Clock className={iconClass} />;
  if (key.includes('price')) return <DollarSign className={iconClass} />;
  if (key.includes('name') || key.includes('description')) return <FileText className={iconClass} />;
  if (key.includes('Enabled')) return <Zap className={iconClass} />;
  if (key.includes('HeartBeat')) return <Settings className={iconClass} />;
  return <Info className={iconClass} />;
};

// Categorize parameters
const categorizeParameters = (parameters: Record<string, any>) => {
  const categories: Record<string, Array<[string, any]>> = {
    'License Information': [],
    'Limits': [],
    'Access Features': [],
    'Advanced Features': [],
    'Settings': [],
    'Pricing': [],
  };

  Object.entries(parameters).forEach(([key, value]) => {
    if (key.includes('licenseName') || key.includes('description')) {
      categories['License Information'].push([key, value]);
    } else if (key.includes('max')) {
      categories['Limits'].push([key, value]);
    } else if (key.includes('isLogin') || key.includes('isExecute')) {
      categories['Access Features'].push([key, value]);
    } else if (key.includes('isAntiPassback') || key.includes('isScenario')) {
      categories['Advanced Features'].push([key, value]);
    } else if (key.includes('HeartBeat') || key.includes('Time')) {
      categories['Settings'].push([key, value]);
    } else if (key.includes('price') || key.includes('duration')) {
      categories['Pricing'].push([key, value]);
    } else {
      categories['Settings'].push([key, value]);
    }
  });

  // Remove empty categories
  return Object.fromEntries(
    Object.entries(categories).filter(([_, items]) => items.length > 0)
  );
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

  const categorizedParams = categorizeParameters(license.parameters);

  return (
    <div className="space-y-6">
      {/* Hero Section - License Overview */}
      <div className={`relative overflow-hidden rounded-lg shadow-theme-xs border ${
        isExpired 
          ? 'bg-gradient-to-br from-error-50 to-error-100 dark:from-error-950 dark:to-error-900 border-error-200 dark:border-error-800' 
          : 'bg-gradient-to-br from-brand-50 via-brand-100 to-brand-50 dark:from-brand-950 dark:via-brand-900 dark:to-brand-950 border-brand-200 dark:border-brand-800'
      }`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 dark:bg-white/5 rounded-full -mr-24 -mt-24"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full -ml-16 -mb-16"></div>
        
        <div className="relative px-5 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-theme-xs ${
                isExpired
                  ? 'bg-error-500 dark:bg-error-600'
                  : 'bg-brand-500 dark:bg-brand-600'
              }`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h1 className={`text-lg font-bold ${
                    isExpired
                      ? 'text-error-900 dark:text-error-100'
                      : 'text-brand-900 dark:text-brand-100'
                  }`}>
                    {license.licenseTypeName}
                  </h1>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    license.isActive
                      ? 'bg-success-500 text-white dark:bg-success-600'
                      : 'bg-error-500 text-white dark:bg-error-600'
                  }`}>
                    {license.isActive ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" />
                        <span>Inactive</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  ID: <span className="font-mono">{license.id}</span>
                </p>
                
                <div className="flex flex-wrap items-center gap-4">
                  {license.expireAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className={`w-3.5 h-3.5 ${
                        isExpired
                          ? 'text-error-600 dark:text-error-400'
                          : 'text-brand-600 dark:text-brand-400'
                      }`} />
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Expires</div>
                        <div className={`text-xs font-semibold ${
                          isExpired
                            ? 'text-error-700 dark:text-error-300'
                            : 'text-brand-700 dark:text-brand-300'
                        }`}>
                          {formatDate(license.expireAt)}
                        </div>
                        {daysUntilExpiry !== null && (
                          <div className={`text-xs font-medium mt-0.5 ${
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
                  
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Created</div>
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {formatDate(license.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* License Parameters - Categorized */}
      {Object.keys(categorizedParams).length > 0 && (
        <div className="space-y-4">
          {Object.entries(categorizedParams).map(([category, params]) => (
            <div 
              key={category}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-theme-xs overflow-hidden"
            >
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                  {category}
                </h2>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {params.map(([key, value]) => {
                    const isBoolean = typeof value === 'boolean';
                    const isNumber = typeof value === 'number';
                    const isNull = value === null;
                    
                    return (
                      <div 
                        key={key}
                        className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0">
                            {getParameterIcon(key)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              {formatParameterKey(key)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isBoolean ? (
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  value
                                    ? 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                  {value ? (
                                    <>
                                      <Check className="w-2.5 h-2.5" />
                                      <span>Enabled</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-2.5 h-2.5" />
                                      <span>Disabled</span>
                                    </>
                                  )}
                                </div>
                              ) : isNull ? (
                                <span className="text-xs text-gray-400 dark:text-gray-500 italic">Not set</span>
                              ) : (
                                <span className={`text-xs font-semibold ${
                                  isNumber
                                    ? 'text-brand-600 dark:text-brand-400 font-mono'
                                    : 'text-gray-800 dark:text-white/90'
                                }`}>
                                  {isNumber && key.includes('max') ? (
                                    <span className="text-sm">{value.toLocaleString()}</span>
                                  ) : (
                                    String(value)
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

