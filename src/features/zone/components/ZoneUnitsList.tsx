import { Edit, Trash2, MapPin, Plus } from 'lucide-react';
import type { Zone } from '../../../api/endpoints/zones';
import { ZONE_TYPE_ICONS } from '../../../api/endpoints/zones';

interface ZoneUnitsListProps {
  parentZone: Zone | null;
  units: Zone[];
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
  onAddUnit: (parentZone: Zone) => void;
}

export const ZoneUnitsList = ({ parentZone, units, onEdit, onDelete, onAddUnit }: ZoneUnitsListProps) => {
  if (!parentZone) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <MapPin className="h-10 w-10 text-gray-400 dark:text-gray-600" />
          </div>
        </div>
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">
          No Zone Selected
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select a zone from the left to view its units
        </p>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Units in "{parentZone.name}"
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {ZONE_TYPE_ICONS[parseInt(parentZone.zoneTypeId)]} {parentZone.name}
          </p>
        </div>
        
        {/* Empty State */}
        <div className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-2">
            No Units Yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This zone doesn't have any units
          </p>
          <button
            onClick={() => onAddUnit(parentZone)}
            className="inline-flex items-center justify-center px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors shadow-theme-xs dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Unit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow-theme-xs rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Units in "{parentZone.name}"
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {units.length} unit{units.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => onAddUnit(parentZone)}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-900 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Unit
        </button>
      </div>

      {/* Units List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {units.map((unit) => (
          <div
            key={unit.id}
            className="group px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <span className="text-xl">📍</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate">
                    {unit.name}
                  </h4>
                  {!unit.isActive && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                      Inactive
                    </span>
                  )}
                </div>
                {unit.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {unit.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Created {new Date(unit.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => onEdit(unit)}
                  className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 transition-colors"
                  title="Edit unit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(unit)}
                  className="p-1.5 rounded hover:bg-error-50 dark:hover:bg-error-950 text-error-600 dark:text-error-400 transition-colors"
                  title="Delete unit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

