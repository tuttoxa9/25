import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface NeomorphicBoxProps {
  children: React.ReactNode;
  className?: string;
  isPressed?: boolean;
  color?: 'default' | 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'gray';
  onClick?: () => void;
  as?: React.ElementType;
}

export function NeomorphicBox({
  children,
  className,
  isPressed = false,
  color = 'default',
  onClick,
  as: Component = 'div',
}: NeomorphicBoxProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Определяем цвета для разных вариантов
  const getColorClasses = () => {
    const baseClasses = {
      default: isDark
        ? 'bg-slate-800 text-slate-200'
        : 'bg-gray-100 text-gray-800',
      blue: isDark
        ? 'bg-blue-900/20 text-blue-200'
        : 'bg-blue-50 text-blue-800',
      green: isDark
        ? 'bg-emerald-900/20 text-emerald-200'
        : 'bg-emerald-50 text-emerald-800',
      red: isDark
        ? 'bg-red-900/20 text-red-200'
        : 'bg-red-50 text-red-800',
      purple: isDark
        ? 'bg-purple-900/20 text-purple-200'
        : 'bg-purple-50 text-purple-800',
      orange: isDark
        ? 'bg-orange-900/20 text-orange-200'
        : 'bg-orange-50 text-orange-800',
      gray: isDark
        ? 'bg-gray-800 text-gray-200'
        : 'bg-gray-100 text-gray-800',
    };

    return baseClasses[color];
  };

  // Определяем классы для теней в зависимости от состояния и темы
  const getShadowClasses = () => {
    if (isDark) {
      return isPressed
        ? 'shadow-inner shadow-[0_0_15px_rgba(0,0,0,0.7)_inset,_2px_2px_5px_rgba(0,0,0,0.5)_inset,_-2px_-2px_5px_rgba(255,255,255,0.05)_inset]'
        : 'shadow-[5px_5px_15px_rgba(0,0,0,0.7),_-5px_-5px_15px_rgba(255,255,255,0.05)]';
    } else {
      return isPressed
        ? 'shadow-inner shadow-[0_0_15px_rgba(0,0,0,0.1)_inset,_2px_2px_5px_rgba(0,0,0,0.1)_inset,_-2px_-2px_5px_rgba(255,255,255,0.5)_inset]'
        : 'shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)]';
    }
  };

  return (
    <Component
      className={cn(
        'rounded-2xl transition-all duration-200',
        getColorClasses(),
        getShadowClasses(),
        isPressed ? 'transform scale-[0.98]' : '',
        onClick ? 'cursor-pointer' : '',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}
