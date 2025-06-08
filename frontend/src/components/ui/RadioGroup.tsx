import React from 'react';
import clsx from 'clsx';

export interface RadioOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
  price?: number;
}

interface RadioGroupProps {
  options: RadioOption[];
  name: string;
  value: string;
  onChange: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  showPrices?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  name,
  value,
  onChange,
  orientation = 'vertical',
  showPrices = false
}) => {
  return (
    <div 
      className={clsx(
        "space-y-4",
        orientation === 'horizontal' && "sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 md:grid-cols-3"
      )}
    >
      {options.map((option) => (
        <div 
          key={option.value} 
          className={clsx(
            "relative bg-white border rounded-lg p-4 cursor-pointer transition-all",
            value === option.value 
              ? "border-blue-600 ring-2 ring-blue-100" 
              : "border-gray-200 hover:border-gray-300",
            option.disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => {
            if (!option.disabled) {
              onChange(option.value);
            }
          }}
        >
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={`${name}-${option.value}`}
                name={name}
                type="radio"
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                disabled={option.disabled}
              />
            </div>
            <div className="ml-3 flex-grow">
              <label 
                htmlFor={`${name}-${option.value}`} 
                className={clsx(
                  "font-medium",
                  value === option.value ? "text-blue-600" : "text-gray-700"
                )}
              >
                {option.label}
                {showPrices && option.price !== undefined && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ${option.price.toFixed(2)}
                  </span>
                )}
              </label>
              {option.description && (
                <p className="mt-1 text-sm text-gray-500">{option.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RadioGroup;