import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  ZoneType,
  ZONE_TYPE_LABELS,
  ZONE_TYPE_ICONS,
  getAllowedZoneTypesForCreation,
  getAllowedChildTypes,
  type ZoneTemplateItem,
} from '../../../api/endpoints/zones';

interface ZoneTemplateBuilderProps {
  zones: ZoneTemplateItem[];
  onChange: (zones: ZoneTemplateItem[]) => void;
  parentZoneType?: ZoneType;
}

export const ZoneTemplateBuilder = ({
  zones,
  onChange,
  parentZoneType,
}: ZoneTemplateBuilderProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const getAllowedTypes = (forZoneType?: ZoneType): ZoneType[] => {
    if (forZoneType) {
      // Get allowed child types for a specific zone type
      return getAllowedChildTypes(forZoneType);
    }
    if (parentZoneType) {
      // If parent zone type is provided, get allowed child types
      return getAllowedChildTypes(parentZoneType);
    }
    // Root level - all types allowed
    return getAllowedZoneTypesForCreation();
  };

  const toggleExpanded = (index: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const addZone = (parentIndex?: string, parentZoneType?: ZoneType) => {
    const allowedTypes = getAllowedTypes(parentZoneType);
    const newZone: ZoneTemplateItem = {
      name: '',
      description: '',
      zoneType: allowedTypes[0] || ZoneType.CAMPUS,
      children: [],
    };

    if (parentIndex === undefined) {
      // Add to root
      const newIndex = zones.length.toString();
      onChange([...zones, newZone]);
      // Auto-expand the new root zone
      setExpandedItems((prev) => new Set([...prev, newIndex]));
    } else {
      // Add as child - need to find parent zone type
      const getZoneByPath = (items: ZoneTemplateItem[], path: number[]): ZoneTemplateItem | null => {
        if (path.length === 0) return null;
        if (path.length === 1) return items[path[0]] || null;
        const [current, ...rest] = path;
        const item = items[current];
        if (!item || !item.children) return null;
        return getZoneByPath(item.children, rest);
      };

      const path = parentIndex.split('-').map(Number);
      const parentZone = getZoneByPath(zones, path);
      const parentType = parentZone ? (parentZone.zoneType as ZoneType) : parentZoneType;

      // Update newZone with correct zone type based on parent
      const allowedTypesForParent = getAllowedTypes(parentType);
      newZone.zoneType = allowedTypesForParent[0] || ZoneType.CAMPUS;

      // Calculate the new child's index before updating
      // Get current child count from parent zone
      const getChildCount = (items: ZoneTemplateItem[], path: number[]): number => {
        if (path.length === 0) return 0;
        if (path.length === 1) {
          const item = items[path[0]];
          return item?.children?.length || 0;
        }
        const [current, ...rest] = path;
        const item = items[current];
        if (!item || !item.children) return 0;
        return getChildCount(item.children, rest);
      };

      const currentChildCount = getChildCount(zones, path);
      const newChildIndex = `${parentIndex}-${currentChildCount}`;

      const updateZones = (items: ZoneTemplateItem[], path: number[]): ZoneTemplateItem[] => {
        if (path.length === 1) {
          return items.map((item, idx) => {
            if (idx === path[0]) {
              return {
                ...item,
                children: [...(item.children || []), newZone],
              };
            }
            return item;
          });
        }

        const [current, ...rest] = path;
        return items.map((item, idx) => {
          if (idx === current) {
            return {
              ...item,
              children: updateZones(item.children || [], rest),
            };
          }
          return item;
        });
      };

      onChange(updateZones(zones, path));
      
      // Auto-expand parent and new child
      setExpandedItems((prev) => {
        const next = new Set(prev);
        // Expand parent if not already expanded
        next.add(parentIndex);
        // Expand the new child
        next.add(newChildIndex);
        return next;
      });
    }
  };

  const removeZone = (index: string) => {
    if (index.includes('-')) {
      // Remove child
      const path = index.split('-').map(Number);
      const updateZones = (items: ZoneTemplateItem[], path: number[]): ZoneTemplateItem[] => {
        if (path.length === 1) {
          return items.filter((_, idx) => idx !== path[0]);
        }

        const [current, ...rest] = path;
        return items.map((item, idx) => {
          if (idx === current) {
            return {
              ...item,
              children: updateZones(item.children || [], rest),
            };
          }
          return item;
        });
      };

      onChange(updateZones(zones, path));
    } else {
      // Remove root
      onChange(zones.filter((_, idx) => idx !== parseInt(index)));
    }
  };

  const updateZone = (index: string, field: keyof ZoneTemplateItem, value: any) => {
    // Helper function to clean invalid children when zone type changes
    const cleanInvalidChildren = (zone: ZoneTemplateItem, newZoneType: ZoneType): ZoneTemplateItem => {
      const allowedChildTypes = getAllowedChildTypes(newZoneType);
      if (!zone.children || zone.children.length === 0) {
        return zone;
      }

      // Filter out invalid children and recursively clean valid ones
      const validChildren = zone.children
        .filter((child) => allowedChildTypes.includes(child.zoneType))
        .map((child) => cleanInvalidChildren(child, child.zoneType));

      return {
        ...zone,
        children: validChildren.length > 0 ? validChildren : undefined,
      };
    };

    if (index.includes('-')) {
      // Update child
      const path = index.split('-').map(Number);
      const updateZones = (items: ZoneTemplateItem[], path: number[]): ZoneTemplateItem[] => {
        if (path.length === 1) {
          return items.map((item, idx) => {
            if (idx === path[0]) {
              const updatedItem = { ...item, [field]: value };
              // If zone type changed, clean invalid children
              if (field === 'zoneType' && updatedItem.zoneType) {
                return cleanInvalidChildren(updatedItem, updatedItem.zoneType as ZoneType);
              }
              return updatedItem;
            }
            return item;
          });
        }

        const [current, ...rest] = path;
        return items.map((item, idx) => {
          if (idx === current) {
            const updatedItem = {
              ...item,
              children: updateZones(item.children || [], rest),
            };
            // If zone type changed, clean invalid children
            if (field === 'zoneType' && updatedItem.zoneType) {
              return cleanInvalidChildren(updatedItem, updatedItem.zoneType as ZoneType);
            }
            return updatedItem;
          }
          return item;
        });
      };

      onChange(updateZones(zones, path));
    } else {
      // Update root
      onChange(
        zones.map((item, idx) => {
          if (idx === parseInt(index)) {
            const updatedItem = { ...item, [field]: value };
            // If zone type changed, clean invalid children
            if (field === 'zoneType' && updatedItem.zoneType) {
              return cleanInvalidChildren(updatedItem, updatedItem.zoneType as ZoneType);
            }
            return updatedItem;
          }
          return item;
        }),
      );
    }
  };


  const renderZoneItem = (zone: ZoneTemplateItem, index: string, depth: number = 0, parentType?: ZoneType) => {
    const isExpanded = expandedItems.has(index);
    const hasChildren = zone.children && zone.children.length > 0;
    const currentZoneType = zone.zoneType as ZoneType;
    
    // Get allowed types for this zone based on its parent
    const allowedTypesForThisZone = getAllowedTypes(parentType);
    
    // Use current zone type if valid, otherwise use first allowed type (will be auto-fixed by useEffect)
    const validZoneType = allowedTypesForThisZone.includes(currentZoneType) 
      ? currentZoneType 
      : (allowedTypesForThisZone[0] || currentZoneType);

    return (
      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg mb-2">
        <div
          className={`p-3 bg-gray-50 dark:bg-gray-800/50 ${
            depth > 0 ? 'ml-4 border-l-2 border-brand-300 dark:border-brand-700' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                type="button"
                onClick={() => toggleExpanded(index)}
                className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}

            {/* Zone Form */}
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {/* Zone Type */}
                <select
                  value={validZoneType}
                  onChange={(e) => {
                    const newZoneType = Number(e.target.value) as ZoneType;
                    updateZone(index, 'zoneType', newZoneType);
                  }}
                  className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
                >
                  {allowedTypesForThisZone.map((type) => (
                    <option key={type} value={type}>
                      {ZONE_TYPE_ICONS[type]} {ZONE_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>

                {/* Name */}
                <input
                  type="text"
                  value={zone.name}
                  onChange={(e) => updateZone(index, 'name', e.target.value)}
                  placeholder="Zone name"
                  className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* Description */}
              <input
                type="text"
                value={zone.description || ''}
                onChange={(e) => updateZone(index, 'description', e.target.value)}
                placeholder="Description (optional)"
                className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Only show "Add Child" button if this zone type can have children */}
                {getAllowedChildTypes(currentZoneType).length > 0 && (
                  <button
                    type="button"
                    onClick={() => addZone(index, currentZoneType)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Child
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeZone(index)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="pl-4 pb-2">
            {zone.children!.map((child, childIdx) =>
              renderZoneItem(child, `${index}-${childIdx}`, depth + 1, currentZoneType),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {zones.map((zone, idx) => renderZoneItem(zone, idx.toString(), 0, parentZoneType))}

      {/* Add Root Zone Button */}
      <button
        type="button"
        onClick={() => addZone()}
        className="w-full h-10 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Zone
      </button>
    </div>
  );
};

