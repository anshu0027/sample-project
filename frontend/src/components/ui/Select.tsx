import React from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  error = false,
  ...props
}) => {
  return (
    <div className="relative flex items-center gap-1">
      <select
        className={clsx(
          'block w-64 justify-center text-center items-center rounded-md shadow-sm appearance-none pl-3 pr-10 py-2 text-base transition-colors border border-gray-300',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          error
            ? 'border-red-300 text-red-900 placeholder-red-300'
            : 'border-gray-300 text-gray-900 placeholder-gray-400',
          disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
          className,
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none flex text-gray-500">
        <ChevronDown size={16} />
      </div>
    </div>
  );
};

export default Select;
