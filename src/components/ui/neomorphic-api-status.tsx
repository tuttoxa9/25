import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, RefreshCw, ExternalLink, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { Timestamp } from 'firebase/firestore';
import { NeomorphicButton } from './neomorphic-button';

interface NeomorphicApiStatusProps {
  apiName: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  checkConnection: () => Promise<any>;
  className?: string;
}

export function NeomorphicApiStatus({
  apiName,
  description,
  icon,
  color,
  checkConnection,
  className,
}: NeomorphicApiStatusProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [pingTime, setPingTime] = useState<number | null>(null);
  const { toast } = useToast();
  const { addNotification } = useAppContext();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleCheckConnection = async () => {
    setStatus('checking');
    setPingTime(null);

    const startTime = performance.now();

    try {
      await checkConnection();
      const endTime = performance.now();
      const ping = Math.round(endTime - startTime);
      setPingTime(ping);
      setStatus('connected');

      toast({
        title: `${apiName} подключен`,
        variant: "default",
      });

      await addNotification({
        title: `${apiName} подключен`,
        message: `Успешное подключение за ${ping}мс`,
        type: "success",
        isRead: false,
        timestamp: Timestamp.now()
      });

    } catch (error) {
      setStatus('error');

      toast({
        title: `Ошибка ${apiName}`,
        variant: "destructive",
      });

      await addNotification({
        title: `Ошибка ${apiName}`,
        message: error instanceof Error ? error.message : `Не удалось подключиться к ${apiName}`,
        type: "error",
        isRead: false,
        timestamp: Timestamp.now()
      });
    }
  };

  const getStatusBg = () => {
    if (status === 'checking') return isDark ? 'bg-slate-800' : 'bg-white';
    if (status === 'connected') return isDark ? 'bg-green-900/20' : 'bg-green-50';
    if (status === 'error') return isDark ? 'bg-red-900/20' : 'bg-red-50';
    return isDark ? 'bg-slate-800' : 'bg-white';
  };

  const getStatusIcon = () => {
    if (status === 'checking') return <Activity className="h-3.5 w-3.5 text-blue-500 animate-pulse" />;
    if (status === 'connected') return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
    if (status === 'error') return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
    return null;
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        getStatusBg(),
        isDark ? 'border-slate-700' : 'border-slate-200',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex-shrink-0 h-7 w-7 rounded-md flex items-center justify-center',
            isDark
              ? `bg-${color}-900/50 text-${color}-400`
              : `bg-${color}-100 text-${color}-700`
          )}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{apiName}</h3>
            <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {getStatusIcon()}

          <NeomorphicButton
            variant="default"
            size="xs"
            color={color}
            onClick={handleCheckConnection}
            disabled={status === 'checking'}
            isLoading={status === 'checking'}
            compact
          >
            {status === 'checking' ? 'Проверка' : 'Проверить'}
          </NeomorphicButton>
        </div>
      </div>

      {/* Информация о соединении */}
      {(status === 'connected' || status === 'error') && (
        <div className={cn(
          'flex items-center justify-between text-xs px-2 py-1.5 rounded',
          status === 'connected'
            ? isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100/50 text-green-700'
            : isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100/50 text-red-700'
        )}>
          <div>
            {status === 'connected' ? 'Соединение установлено' : 'Ошибка соединения'}
          </div>
          {status === 'connected' && pingTime && (
            <div className="flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              {pingTime} мс
            </div>
          )}
        </div>
      )}
    </div>
  );
}
