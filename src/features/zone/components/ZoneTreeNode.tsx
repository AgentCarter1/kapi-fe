import { useState } from 'react';
import { ChevronRight, ChevronDown, Edit, Trash2, Plus } from 'lucide-react';
import type { Zone } from '../../../api/endpoints/zones';
import { ZONE_TYPE_ICONS, ZoneType, getAllowedChildTypes } from '../../../api/endpoints/zones';

interface ZoneTreeNodeProps {
  zone: Zone;
  level: number;
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
  onAddChild: (parentZone: Zone) => void;
  onSelect: (zone: Zone) => void;
  selectedZoneId: string | null;
  hideUnits?: boolean; // If true, don't render Unit type zones
}

export const ZoneTreeNode = ({ 
  zone, 
  level, 
  onEdit, 
  onDelete, 
  onAddChild, 
  onSelect, 
  selectedZoneId,
  hideUnits = false 
}: ZoneTreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const zoneTypeNumber = parseInt(zone.zoneTypeId) as number;
  const icon = ZONE_TYPE_ICONS[zoneTypeNumber] || '📍';
  
  // If hideUnits is true and this is a Unit, don't render it
  if (hideUnits && zoneTypeNumber === ZoneType.UNIT) {
    return null;
  }
  
  // Filter children to exclude Units if hideUnits is true
  const visibleChildren = hideUnits 
    ? zone.children?.filter(child => parseInt(child.zoneTypeId) !== ZoneType.UNIT)
    : zone.children;
  
  const hasChildren = visibleChildren && visibleChildren.length > 0;
  const isSelected = zone.id === selectedZoneId;
  
  // Check if this zone type can have children
  const allowedChildTypes = getAllowedChildTypes(zoneTypeNumber);
  const canHaveChildren = allowedChildTypes.length > 0;

  return (
    <div className="select-none">
      {/* Zone Item */}
      <div
        onClick={() => onSelect(zone)}
        className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
          isSelected 
            ? 'bg-brand-50 dark:bg-brand-950/50 border-l-2 border-brand-500 dark:border-brand-600' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            !hasChildren ? 'invisible' : ''
          }`}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ))}
        </button>

        {/* Zone Icon */}
        <span className="text-lg flex-shrink-0">{icon}</span>

        {/* Zone Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-white/90 truncate">
              {zone.name}
            </span>
            {!zone.isActive && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                Inactive
              </span>
            )}
          </div>
          {zone.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {zone.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Add Child Button - Only show if zone can have children */}
          {canHaveChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(zone);
              }}
              className="p-1.5 rounded hover:bg-brand-50 dark:hover:bg-brand-950 text-brand-600 dark:text-brand-400 transition-colors"
              title="Add child zone"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(zone);
            }}
            className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 transition-colors"
            title="Edit zone"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(zone);
            }}
            className="p-1.5 rounded hover:bg-error-50 dark:hover:bg-error-950 text-error-600 dark:text-error-400 transition-colors"
            title="Delete zone"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {visibleChildren!.map((child) => (
            <ZoneTreeNode
              key={child.id}
              zone={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onSelect={onSelect}
              selectedZoneId={selectedZoneId}
              hideUnits={hideUnits}
            />
          ))}
        </div>
      )}
    </div>
  );
};

