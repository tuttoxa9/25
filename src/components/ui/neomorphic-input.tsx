import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

export interface NeomorphicInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const NeomorphicInput = forwardRef<HTMLInputElement, NeomorphicInputProps>(
  ({
    label,
    error,
    className,
    fullWidth = false,
    startIcon,
    endIcon,
    ...props
  }, ref) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Стили для контейнера
    const containerClasses = cn(
      fullWidth ? 'w-full' : 'max-w-sm',
      className
    );

    // Стили для input
    const inputClasses = cn(
      'rounded-xl px-4 py-2.5 outline-none transition-all duration-200',
      fullWidth ? 'w-full' : 'w-full max-w-sm',
      isDark
        ? 'bg-slate-800 text-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),_inset_0_-1px_2px_rgba(255,255,255,0.05)]'
        : 'bg-gray-100 text-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),_inset_0_-1px_2px_rgba(255,255,255,0.7)]',
      (startIcon) && 'pl-10',
      (endIcon) && 'pr-10',
      (error) && (isDark ? 'border border-red-500' : 'border border-red-500'),
      props.disabled && 'opacity-60 cursor-not-allowed',
    );

    // Стили для лейбла
    const labelClasses = cn(
      'block mb-2 text-sm font-medium',
      isDark ? 'text-slate-300' : 'text-gray-700',
      props.disabled && 'opacity-60'
    );

    // Стили для сообщения об ошибке
    const errorClasses = cn(
      'mt-1.5 text-xs',
      isDark ? 'text-red-400' : 'text-red-600'
    );

    return (
      <div className={containerClasses}>
        {label && (
          <label
            className={labelClasses}
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <p className={errorClasses}>{error}</p>
        )}
      </div>
    );
  }
);
