import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  className = '',
  error = false,
  icon,
  ...props
}) => {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400">
          {icon}
        </div>
      )}
      <input
        className={clsx(
          'block w-72 rounded-xl text-base font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          error
            ? 'border-2 border-red-400 text-red-900 placeholder-red-300 bg-red-50'
            : 'border border-gray-300 text-gray-900 placeholder-gray-400',
          icon ? 'pl-12' : 'pl-4',
          'pr-4 py-2',
          props.disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
          className
        )}
        {...props}
      />
    </div>
  );
};

export default Input;