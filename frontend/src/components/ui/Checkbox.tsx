import React from 'react';
import clsx from 'clsx';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
}



const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  description,
  error = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={clsx("flex items-start", className)}>
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={clsx(
            "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
            error && "border-red-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          {...props}
        />
      </div>
      <div className={clsx("ml-3 text-sm", "text-left")}>
        <label 
          className={clsx(
            "font-medium",
            error ? "text-red-700" : "text-gray-700",
            disabled && "text-gray-500"
          )}
        >
          {label}
        </label>
        {description && (
          <p className={clsx(
            "mt-1 text-sm",
            error ? "text-red-500" : "text-gray-500"
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default Checkbox;