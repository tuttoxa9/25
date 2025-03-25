import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

interface NeomorphicToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  color?: 'default' | 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

export function NeomorphicToggle({
  checked,
  onCheckedChange,
  label,
  className,
  disabled = false,
  color = 'blue',
}: NeomorphicToggleProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Основные классы для контейнера переключателя
  const containerClasses = cn(
    'relative flex-shrink-0 h-6 w-11 rounded-full transition-all duration-200 outline-none',
    isDark
      ? 'bg-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),_inset_0_-1px_2px_rgba(255,255,255,0.05)]'
      : 'bg-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),_inset_0_-1px_2px_rgba(255,255,255,0.5)]',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  );

  // Классы для фона переключателя в активном состоянии
  const getActiveColorClasses = () => {
    const colorMap = {
      default: isDark ? 'bg-slate-600' : 'bg-gray-400',
      blue: isDark ? 'bg-blue-700' : 'bg-blue-500',
      green: isDark ? 'bg-emerald-700' : 'bg-emerald-500',
      red: isDark ? 'bg-red-700' : 'bg-red-500',
      purple: isDark ? 'bg-purple-700' : 'bg-purple-500',
      orange: isDark ? 'bg-orange-700' : 'bg-orange-500',
    };

    return colorMap[color];
  };

  // Классы для кружка переключателя
  const thumbClasses = cn(
    'absolute top-1 left-1 h-4 w-4 rounded-full transform transition-transform duration-200',
    isDark
      ? 'bg-white shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
      : 'bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
  );

  const handleClick = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  return (
    <div className={cn('flex items-center', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleClick}
        disabled={disabled}
        className={containerClasses}
        data-state={checked ? 'checked' : 'unchecked'}
      >
        {checked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn('absolute inset-0 rounded-full', getActiveColorClasses())}
          />
        )}
        <motion.div
          initial={false}
          animate={{ x: checked ? 20 : 0 }}
          className={thumbClasses}
        />
      </button>
      {label && (
        <label className={cn(
          'ml-2 text-sm',
          isDark ? 'text-slate-300' : 'text-gray-700',
          disabled ? 'opacity-50' : ''
        )}>
          {label}
        </label>
      )}
    </div>
  );
}
