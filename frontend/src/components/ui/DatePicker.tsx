import React from 'react';
import clsx from 'clsx';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholderText?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  minDate,
  maxDate,
  // placeholderText = 'Select date',
  error = false,
  disabled = false,
  className = '',
}) => {
  // Helper to format Date object to 'YYYY-MM-DD' string for input value
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    // Ensure date is treated as local, not UTC, to prevent off-by-one day issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleNativeDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = event.target.value;
    if (dateString) {
      // Convert YYYY-MM-DD string back to a Date object, ensuring it's local
      const [year, month, day] = dateString.split('-').map(Number);
      onChange(new Date(year, month - 1, day));
    } else {
      onChange(null);
    }
  };

  return (
    <div className={clsx('relative', className)}>
      {' '}
      {/* Apply the passed className to the wrapper div */}
      <input
        type="date"
        value={formatDateForInput(selected)}
        onChange={handleNativeDateChange}
        min={minDate ? formatDateForInput(minDate) : undefined}
        max={maxDate ? formatDateForInput(maxDate) : undefined}
        // placeholderText={placeholderText}
        className={clsx(
          // Styles for the input element itself
          'block w-full rounded-xl shadow-sm py-2 px-3 transition-colors text-center border', // Adjusted padding for native date input
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          error
            ? 'border-red-400 text-red-900 placeholder-red-300 bg-red-50' // Matched Input.tsx error style
            : 'border-gray-200 text-gray-900 placeholder-gray-400', // Matched Input.tsx default style
          disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
        )}
        disabled={disabled}
      />
    </div>
  );
};

export default DatePicker;
