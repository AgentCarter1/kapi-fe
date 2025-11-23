import { Plus, Loader2 } from 'lucide-react';
import { ZoneTreeNode } from './ZoneTreeNode';
import type { Zone } from '../../../api/endpoints/zones';

interface ZoneTreeProps {
  zones: Zone[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
  onAddChild: (parentZone: Zone) => void;
  onAddRoot: () => void;
  onSelect: (zone: Zone) => void;
  selectedZoneId: string | null;
  hideUnits?: boolean;
  defaultExpanded?: boolean; // If true, all nodes start expanded
}

export const ZoneTree = ({
  zones,
  isLoading,
  error,
  onEdit,
  onDelete,
  onAddChild,
  onAddRoot,
  onSelect,
  selectedZoneId,
  hideUnits = false,
  defaultExpanded = false,
}: ZoneTreeProps) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-12 text-center border border-gray-200 dark:border-gray-800">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 dark:text-brand-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading zones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-6">
        <p className="text-error-800 dark:text-error-400 font-medium">Failed to load zones</p>
        <p className="text-error-600 dark:text-error-500 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (!zones || zones.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg p-12 text-center border border-gray-200 dark:border-gray-800">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">
          No zones yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Get started by creating your first zone
        </p>
        <button
          onClick={onAddRoot}
          className="inline-flex items-center justify-center px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors shadow-theme-xs dark:bg-brand-600 dark:hover:bg-brand-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Zone
        </button>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex flex-col bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Zone Hierarchy</h3>
        <button
          onClick={onAddRoot}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-900 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Zone
        </button>
      </div>

      {/* Tree - Scrollable */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {zones.map((zone) => (
          <ZoneTreeNode
            key={zone.id}
            zone={zone}
            level={0}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onSelect={onSelect}
            selectedZoneId={selectedZoneId}
            hideUnits={hideUnits}
            defaultExpanded={defaultExpanded}
          />
        ))}
      </div>
    </div>
  );
};

