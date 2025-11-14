import { useEffect, useState, useMemo } from 'react';
import { X } from 'lucide-react';
import {
  type Zone,
  type CreateZoneRequest,
  type UpdateZoneRequest,
  type CreateZoneTemplateRequest,
  type ZoneTemplateItem,
  ZoneType,
  ZONE_TYPE_LABELS,
  ZONE_TYPE_ICONS,
  getAllowedChildTypes,
  getAllowedZoneTypesForCreation,
} from '../../../api/endpoints/zones';
import { ZoneTemplateBuilder } from './ZoneTemplateBuilder';

interface ZoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateZoneRequest | UpdateZoneRequest) => Promise<void>;
  onSubmitTemplate?: (data: CreateZoneTemplateRequest) => Promise<void>;
  parentZone?: Zone; // If provided, creating a child zone
  editZone?: Zone; // If provided, editing existing zone
  isPending: boolean;
  forceZoneType?: ZoneType; // If provided, zone type is locked and cannot be changed
}

type TabType = 'single' | 'template';

export const ZoneDialog = ({
  isOpen,
  onClose,
  onSubmit,
  onSubmitTemplate,
  parentZone,
  editZone,
  isPending,
  forceZoneType,
}: ZoneDialogProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('single');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [zoneType, setZoneType] = useState<ZoneType | ''>('');
  const [isActive, setIsActive] = useState(true);
  
  // Template mode
  const [templateZones, setTemplateZones] = useState<ZoneTemplateItem[]>([]);

  const isEditMode = !!editZone;
  const isChildMode = !!parentZone && !editZone;
  const showTabs = !isEditMode && !isChildMode && onSubmitTemplate; // Only show tabs in create mode (not edit, not child)

  // Get allowed zone types (memoized to prevent infinite re-renders)
  const allowedZoneTypes = useMemo(() => {
    if (isChildMode) {
      return getAllowedChildTypes(parseInt(parentZone!.zoneTypeId));
    }
    return getAllowedZoneTypesForCreation();
  }, [isChildMode, parentZone]);

  // Initialize form
  useEffect(() => {
    if (!isOpen) return; // Don't update when closed
    
    if (editZone) {
      // Edit mode: Load existing zone data
      setName(editZone.name);
      setDescription(editZone.description || '');
      setZoneType(parseInt(editZone.zoneTypeId) as ZoneType);
      setIsActive(editZone.isActive);
    } else {
      // Create mode: Reset form
      setName('');
      setDescription('');
      setTemplateZones([]);
      
      // Auto-select zone type:
      // 1. If forceZoneType is provided, use it (locked)
      // 2. If only one option, select it automatically
      // 3. If multiple options, select the first one (immediate child level)
      if (forceZoneType) {
        setZoneType(forceZoneType); // Locked type (e.g., Unit)
      } else if (allowedZoneTypes.length > 0) {
        setZoneType(allowedZoneTypes[0]); // First option is the immediate child level
      } else {
        setZoneType('');
      }
      
      setIsActive(true);
      setActiveTab('single'); // Reset to single tab
    }
  }, [editZone, isOpen, allowedZoneTypes, forceZoneType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode) {
      const updateData: UpdateZoneRequest = {
        name,
        description: description || undefined,
        isActive,
      };
      await onSubmit(updateData);
    } else if (activeTab === 'template' && onSubmitTemplate) {
      // Template mode
      if (templateZones.length === 0) {
        alert('Please add at least one zone to the template');
        return;
      }
      // Validate all zones have names
      const validateZones = (zones: ZoneTemplateItem[]): boolean => {
        for (const zone of zones) {
          if (!zone.name.trim()) {
            return false;
          }
          if (zone.children && zone.children.length > 0) {
            if (!validateZones(zone.children)) {
              return false;
            }
          }
        }
        return true;
      };
      if (!validateZones(templateZones)) {
        alert('All zones must have a name');
        return;
      }

      const templateData: CreateZoneTemplateRequest = {
        zones: templateZones,
        parentId: parentZone?.id,
      };
      await onSubmitTemplate(templateData);
    } else {
      // Single mode
      const createData: CreateZoneRequest = {
        name,
        description: description || undefined,
        zoneType: zoneType as ZoneType,
        parentId: parentZone?.id,
      };
      await onSubmit(createData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Dialog Content */}
        <div 
          className={`relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full border border-gray-200 dark:border-gray-800 pointer-events-auto ${
            activeTab === 'template' ? 'max-w-4xl' : 'max-w-md'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {isEditMode
                ? 'Edit Zone'
                : isChildMode
                ? `Add Zone to ${parentZone.name}`
                : 'Create Zone'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={isPending}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs (only in create mode, not edit, not child) */}
          {showTabs && (
            <div className="border-b border-gray-200 dark:border-gray-800">
              <nav className="flex gap-6 px-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('single')}
                  className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'single'
                      ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('template')}
                  className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'template'
                      ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  Template
                </button>
              </nav>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {activeTab === 'template' && showTabs ? (
              // Template Mode
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zones <span className="text-error-500">*</span>
                  </label>
                  <ZoneTemplateBuilder
                    zones={templateZones}
                    onChange={setTemplateZones}
                    parentZoneType={parentZone ? (parseInt(parentZone.zoneTypeId) as ZoneType) : undefined}
                  />
                </div>
              </div>
            ) : (
              // Single Mode (existing form)
              <>
                {/* Zone Type (only for create) */}
                {!isEditMode && (
                  <div>
                    <label 
                      htmlFor="zoneType" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Zone Type <span className="text-error-500">*</span>
                    </label>
                    <select
                      id="zoneType"
                      name="zoneType"
                      value={zoneType}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          setZoneType(Number(value) as ZoneType);
                        }
                      }}
                      required
                      disabled={isPending || !!forceZoneType}
                      className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select zone type</option>
                      {allowedZoneTypes.map((type) => (
                        <option key={type} value={type}>
                          {ZONE_TYPE_ICONS[type]} {ZONE_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                    {forceZoneType && (
                      <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">
                        📍 Zone type is locked to Unit
                      </p>
                    )}
                    {isChildMode && !forceZoneType && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Allowed types for {ZONE_TYPE_LABELS[parseInt(parentZone!.zoneTypeId)]}
                      </p>
                    )}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label 
                    htmlFor="zoneName" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Name <span className="text-error-500">*</span>
                  </label>
                  <input
                    id="zoneName"
                    name="zoneName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isPending}
                    placeholder="Enter zone name"
                    autoComplete="off"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Description */}
                <div>
                  <label 
                    htmlFor="zoneDescription" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="zoneDescription"
                    name="zoneDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isPending}
                    placeholder="Enter description (optional)"
                    autoComplete="off"
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  />
                </div>

                {/* Active Status (only for edit) */}
                {isEditMode && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      disabled={isPending}
                      className="w-4 h-4 text-brand-600 bg-white border-gray-300 rounded focus:ring-brand-500 focus:ring-2 dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Active
                    </label>
                  </div>
                )}
              </>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={
                isPending ||
                (activeTab === 'template'
                  ? templateZones.length === 0
                  : !name || (!isEditMode && !zoneType))
              }
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 dark:bg-brand-600 rounded-lg hover:bg-brand-600 dark:hover:bg-brand-700 transition-colors shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? 'Saving...'
                : isEditMode
                ? 'Update'
                : activeTab === 'template'
                ? 'Create Template'
                : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
