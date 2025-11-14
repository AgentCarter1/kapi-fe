import { useState } from 'react';
import { Settings, Users, Mail, Shield, History, Lock, Key } from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';
import { WorkspaceAccounts } from '../components/WorkspaceAccounts';
import { WorkspaceInvitations } from '../components/WorkspaceInvitations';
import { WorkspaceLicense } from '../components/WorkspaceLicense';
import { WorkspaceAccessHistory } from '../components/WorkspaceAccessHistory';
import { WorkspaceAntiPassbacks } from '../../anti-passback/components/WorkspaceAntiPassbacks';
import { WorkspaceCredentialCodes } from '../components/WorkspaceCredentialCodes';

type TabType = 'members' | 'invitations' | 'license' | 'history' | 'anti-passback' | 'credential-codes';

export const WorkspaceSettings = () => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);
  const [activeTab, setActiveTab] = useState<TabType>('members');

  if (!currentWorkspace) {
    return (
      <div className="bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
        <p className="text-warning-800 dark:text-warning-400">Please select a workspace first.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'members' as TabType, label: 'Members', icon: Users },
    { id: 'invitations' as TabType, label: 'Invitations', icon: Mail },
    { id: 'credential-codes' as TabType, label: 'Credential Codes', icon: Key },
    { id: 'license' as TabType, label: 'License', icon: Shield },
    { id: 'anti-passback' as TabType, label: 'Anti-passback', icon: Lock },
    { id: 'history' as TabType, label: 'Access History', icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-brand-100 dark:bg-brand-950 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Workspace Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage settings for{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {currentWorkspace.workspaceName}
            </span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'members' && <WorkspaceAccounts />}
        {activeTab === 'invitations' && <WorkspaceInvitations />}
        {activeTab === 'credential-codes' && <WorkspaceCredentialCodes />}
        {activeTab === 'license' && (
          <WorkspaceLicense workspaceId={currentWorkspace.workspaceId} />
        )}
        {activeTab === 'anti-passback' && <WorkspaceAntiPassbacks />}
        {activeTab === 'history' && (
          <WorkspaceAccessHistory workspaceId={currentWorkspace.workspaceId} />
        )}
      </div>
    </div>
  );
};

