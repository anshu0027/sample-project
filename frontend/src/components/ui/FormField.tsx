import React from 'react';
import clsx from 'clsx';
import { HelpCircle } from 'lucide-react';

interface FormFieldProps {
  label: React.ReactNode;
  htmlFor: string;
  error?: string;
  required?: boolean;
  tooltip?: string;
  className?: string;
  children: React.ReactNode;
}


const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  required = false,
  tooltip,
  className = '',
  children,
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className={clsx('mb-4', className)}>
      <div className="flex items-center justify-center mb-2 gap-2">
        <label
          htmlFor={htmlFor}
          className={clsx(
            'block text-base font-semibold',
            error ? 'text-red-600' : 'text-gray-800'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {tooltip && (
          <div className="relative ml-1">
            <HelpCircle
              size={18}
              className="text-gray-400 cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
              <div className="absolute z-10 w-64 p-2 mt-1 text-xs text-white bg-gray-800 rounded shadow-lg -left-28 top-6">
                {tooltip}
                <div className="absolute w-3 h-3 bg-gray-800 transform rotate-45 -top-1 left-1/2 -translate-x-1/2"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-center">{children}</div>
      {error && (
        <p className="mt-2 text-sm font-semibold text-red-600 bg-red-50 rounded px-2 py-1 w-fit mx-auto">{error}</p>
      )}
    </div>
  );
};

export default FormField;