import { useState } from 'react';
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import type { Zone } from '../../../api/endpoints/antiPassbacks';
import { ZONE_TYPE_ICONS, ZONE_TYPE_LABELS, ZoneType } from '../../../api/endpoints/zones';

interface ZoneTreeSelectorProps {
  zones: Zone[];
  selectedZoneIds: string[];
  onSelectionChange: (zoneIds: string[]) => void;
  isLoading?: boolean;
}

export const ZoneTreeSelector = ({
  zones,
  selectedZoneIds,
  onSelectionChange,
  isLoading = false,
}: ZoneTreeSelectorProps) => {
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());

  const toggleExpand = (zoneId: string) => {
    setExpandedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) {
        next.delete(zoneId);
      } else {
        next.add(zoneId);
      }
      return next;
    });
  };

  const toggleZoneSelection = (zoneId: string) => {
    const newSelection = selectedZoneIds.includes(zoneId)
      ? selectedZoneIds.filter((id) => id !== zoneId)
      : [...selectedZoneIds, zoneId];
    onSelectionChange(newSelection);
  };

  const renderZoneNode = (zone: Zone, depth: number = 0): JSX.Element => {
    const isExpanded = expandedZones.has(zone.id);
    const hasChildren = zone.children && zone.children.length > 0;
    const isSelected = selectedZoneIds.includes(zone.id);
    const zoneType = parseInt(zone.zoneTypeId) as ZoneType;
    const zoneTypeIcon = ZONE_TYPE_ICONS[zoneType] || '📍';
    const zoneTypeLabel = ZONE_TYPE_LABELS[zoneType] || 'Zone';

    return (
      <div key={zone.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
            depth > 0 ? 'ml-4' : ''
          }`}
          style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(zone.id)}
              className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleZoneSelection(zone.id)}
            className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
          />

          {/* Zone Info */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="text-sm">{zoneTypeIcon}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {zone.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({zoneTypeLabel})
            </span>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>{zone.children!.map((child) => renderZoneNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!zones || zones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No zones available
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-96 overflow-y-auto">
      <div className="space-y-1">{zones.map((zone) => renderZoneNode(zone, 0))}</div>
    </div>
  );
};

