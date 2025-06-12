import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, title, subtitle, icon, className = '', footer }) => {
  return (
    <div
      className={clsx(
        'card w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 md:p-12 mb-4',
        className,
      )}
    >
      {(title || subtitle || icon) && (
        <div className="flex items-center mb-4 gap-4">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <div>
            {title && (
              <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">{title}</div>
            )}
            {subtitle && (
              <div className="text-base text-gray-500 font-medium leading-tight">{subtitle}</div>
            )}
          </div>
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-8">{footer}</div>}
    </div>
  );
};

export default Card;
