import { useEffect, useMemo, useState } from 'react';
import { X, Shield, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import type {
  AntiPassbackTypeDefinition,
  AntiPassbackParameterDefinition,
  CreateAntiPassbackPayload,
  UpdateAntiPassbackPayload,
  AntiPassback,
} from '../../../../api/endpoints/antiPassbacks';

interface AntiPassbackWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateAntiPassbackPayload | UpdateAntiPassbackPayload,
  ) => Promise<void> | void;
  types: AntiPassbackTypeDefinition[];
  isSubmitting: boolean;
  initialData?: AntiPassback | null;
}

type WizardStep = 1 | 2;

const steps: Array<{ id: WizardStep; label: string }> = [
  { id: 1, label: 'Configuration' },
  { id: 2, label: 'Parameters' },
];

const booleanParameters = new Set<string>([
  'isWarningEnabled',
  'enforceStrictEntry',
  'autoResetOnTimeout',
  'isAssignedWorkspace',
]);

const numberParameters = new Set<string>([
  'entryCooldownSeconds',
  'allowedReentry',
  'resetTimeoutSeconds',
]);

const getDefaultValue = (definition: AntiPassbackParameterDefinition) => {
  if (definition.defaultValue !== undefined) {
    return definition.defaultValue;
  }

  if (definition.type === 'boolean') {
    return false;
  }

  if (definition.type === 'number') {
    return 0;
  }

  return '';
};

export const AntiPassbackWizard = ({
  isOpen,
  onClose,
  onSubmit,
  types,
  isSubmitting,
  initialData,
}: AntiPassbackWizardProps) => {
  const isEditMode = Boolean(initialData);
  const [step, setStep] = useState<WizardStep>(1);
  const [name, setName] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isAssignedWorkspace, setIsAssignedWorkspace] = useState(false);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setName(initialData?.name ?? '');
      setSelectedTypeId(initialData?.antiPassbackTypeId ?? '');
      setIsActive(initialData?.isActive ?? true);
      setIsAssignedWorkspace(initialData?.isAssignedWorkspace ?? false);
    }
  }, [isOpen, initialData]);

  const selectedType = useMemo(
    () => types.find((item) => item.id === selectedTypeId),
    [types, selectedTypeId],
  );

  useEffect(() => {
    if (!selectedType) {
      setParameterValues({});
      return;
    }

    const defaults: Record<string, any> = {};
    selectedType.parameters.forEach((param) => {
      if (
        initialData &&
        initialData.antiPassbackTypeId === selectedType.id &&
        initialData.parameters &&
        initialData.parameters[param.name] !== undefined
      ) {
        defaults[param.name] = initialData.parameters[param.name];
      } else {
        defaults[param.name] = getDefaultValue(param);
      }
    });
    setParameterValues(defaults);
  }, [selectedType, initialData]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleParameterChange = (name: string, value: any) => {
    setParameterValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (!selectedTypeId) return;
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!selectedTypeId) return;

    if (isEditMode) {
      const payload: UpdateAntiPassbackPayload = {
        name,
        isActive,
        isAssignedWorkspace,
        parameters: parameterValues,
      };
      await onSubmit(payload);
    } else {
      const payload: CreateAntiPassbackPayload = {
        antiPassback: {
          name,
          antiPassbackTypeId: Number(selectedTypeId),
          isActive,
          isAssignedWorkspace,
        },
        parameters: parameterValues,
      };
      await onSubmit(payload);
    }
  };

  const renderParameterField = (definition: AntiPassbackParameterDefinition) => {
    const value = parameterValues[definition.name];
    const description = definition.description;
    const label = definition.label || definition.name;
    const type = definition.type?.toLowerCase() || 'string';

    const commonDescription = description ? (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    ) : null;

    if (type === 'boolean' || booleanParameters.has(definition.name)) {
      return (
        <div className="space-y-1" key={definition.name}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(event) => handleParameterChange(definition.name, event.target.checked)}
                className="form-checkbox h-4 w-4 text-brand-600 focus:ring-brand-500"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {value ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
          {commonDescription}
        </div>
      );
    }

    if (
      type === 'number' ||
      numberParameters.has(definition.name) ||
      typeof definition.defaultValue === 'number'
    ) {
      return (
        <div className="space-y-1" key={definition.name}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <input
            type="number"
            value={value ?? ''}
            min={definition.min}
            max={definition.max}
            step={definition.step ?? 1}
            onChange={(event) => {
              const rawValue = event.target.value;
              handleParameterChange(
                definition.name,
                rawValue === '' ? '' : Number(rawValue),
              );
            }}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90"
          />
          {commonDescription}
        </div>
      );
    }

    if (definition.options && definition.options.length > 0) {
      return (
        <div className="space-y-1" key={definition.name}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <select
            value={value ?? ''}
            onChange={(event) => handleParameterChange(definition.name, event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90"
          >
            {definition.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {commonDescription}
        </div>
      );
    }

    return (
      <div className="space-y-1" key={definition.name}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <input
          type="text"
          value={value ?? ''}
          onChange={(event) => handleParameterChange(definition.name, event.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90"
        />
        {commonDescription}
      </div>
    );
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rule name
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter anti-passback name"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {isEditMode ? 'Anti-passback type' : 'Select anti-passback type'}
            </label>
            {isEditMode && selectedType ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  {selectedType.name}
                </div>
                {selectedType.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedType.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {selectedType.parameters.length} configurable parameter
                  {selectedType.parameters.length === 1 ? '' : 's'}
                </p>
                <p className="text-xs text-warning-600 dark:text-warning-400 mt-2">
                  Type cannot be changed after creation.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {types.map((type) => {
                  const isSelected = selectedTypeId === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedTypeId(type.id)}
                      className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                        <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        {type.name}
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-brand-500 dark:text-brand-300" />
                        )}
                      </div>
                      {type.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {type.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {type.parameters.length} configurable parameter
                        {type.parameters.length === 1 ? '' : 's'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Assign to entire workspace
              </span>
              <input
                type="checkbox"
                checked={isAssignedWorkspace}
                onChange={(event) => setIsAssignedWorkspace(event.target.checked)}
                className="form-checkbox h-4 w-4 text-brand-600 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rule is active
              </span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="form-checkbox h-4 w-4 text-brand-600 focus:ring-brand-500"
              />
            </label>
          </div>
        </div>
      );
    }

    if (!selectedType) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Please select an anti-passback type before configuring parameters.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {selectedType.name} parameters
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Configure how this anti-passback rule should behave.
          </p>
        </div>

        {selectedType.parameters.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            This anti-passback type does not expose configurable parameters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedType.parameters.map((parameter) => renderParameterField(parameter))}
          </div>
        )}
      </div>
    );
  };

  const canProceedToParameters = Boolean(name.trim()) && Boolean(selectedTypeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-4xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {isEditMode ? 'Edit anti-passback rule' : 'Create anti-passback rule'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure how and when users can re-enter secured areas.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-center gap-3">
            {steps.map((wizardStep, index) => {
              const isCurrent = wizardStep.id === step;
              const isCompleted = step > wizardStep.id;
              return (
                <div key={wizardStep.id} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                      isCurrent
                        ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/40'
                        : isCompleted
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    {wizardStep.id}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-brand-600 dark:text-brand-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {wizardStep.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="h-px w-8 bg-gray-200 dark:bg-gray-700" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">{renderStepContent()}</div>

        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-gray-50 dark:bg-gray-900/60">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Step {step} of {steps.length}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            {step === 1 && (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceedToParameters}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}

            {step === 2 && (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create rule'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


