import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { Loader2 } from 'lucide-react';

interface NeomorphicButtonProps {
  children: React.ReactNode;
  className?: string;
  color?: 'default' | 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'gray';
  onClick?: () => void;
  variant?: 'default' | 'icon' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  compact?: boolean;
}

export function NeomorphicButton({
  children,
  className,
  color = 'default',
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  isLoading = false,
  type = 'button',
  compact = false,
}: NeomorphicButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPressed, setIsPressed] = useState(false);

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

  // Определяем размеры в зависимости от варианта
  const getSizeClasses = () => {
    if (variant === 'icon') {
      return {
        xs: 'p-1.5 text-xs',
        sm: 'p-2 text-sm',
        md: 'p-3 text-base',
        lg: 'p-4 text-lg',
      }[size];
    }

    if (compact) {
      return {
        xs: 'py-1 px-2 text-xs',
        sm: 'py-1 px-2.5 text-xs',
        md: 'py-1.5 px-3 text-xs',
        lg: 'py-2 px-4 text-sm',
      }[size];
    }

    return {
      xs: 'py-1.5 px-2.5 text-xs',
      sm: 'py-2 px-3 text-xs',
      md: 'py-2.5 px-4 text-sm',
      lg: 'py-3 px-5 text-base',
    }[size];
  };

  // Определяем классы для теней в зависимости от состояния и темы
  const getShadowClasses = () => {
    if (disabled) {
      return isDark ? 'opacity-50' : 'opacity-70';
    }

    if (isDark) {
      return isPressed
        ? 'shadow-inner shadow-[0_0_10px_rgba(0,0,0,0.7)_inset,_2px_2px_5px_rgba(0,0,0,0.5)_inset,_-2px_-2px_5px_rgba(255,255,255,0.05)_inset]'
        : 'shadow-[3px_3px_10px_rgba(0,0,0,0.7),_-3px_-3px_10px_rgba(255,255,255,0.05)]';
    } else {
      return isPressed
        ? 'shadow-inner shadow-[0_0_10px_rgba(0,0,0,0.1)_inset,_2px_2px_5px_rgba(0,0,0,0.1)_inset,_-2px_-2px_5px_rgba(255,255,255,0.5)_inset]'
        : 'shadow-[3px_3px_10px_rgba(0,0,0,0.1),_-3px_-3px_10px_rgba(255,255,255,0.8)]';
    }
  };

  const handleMouseDown = () => {
    if (!disabled) setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (!disabled) setIsPressed(false);
  };

  const handleMouseLeave = () => {
    if (isPressed) setIsPressed(false);
  };

  return (
    <button
      type={type}
      className={cn(
        'rounded-xl font-medium outline-none transition-all duration-200 flex items-center justify-center',
        getColorClasses(),
        getSizeClasses(),
        getShadowClasses(),
        isPressed && !disabled ? 'transform scale-[0.97]' : '',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        variant === 'icon' ? 'rounded-full aspect-square' : '',
        compact ? 'rounded-lg' : 'rounded-xl',
        className
      )}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className={cn("animate-spin", compact ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2")} />
          <span>{compact ? "Загрузка" : "Загрузка..."}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
