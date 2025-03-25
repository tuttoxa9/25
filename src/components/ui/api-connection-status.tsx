import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Zap, Clock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme } from '@/context/ThemeContext';

interface ApiConnectionStatusProps {
  className?: string;
  apiName: string;
  icon: React.ReactNode;
  checkConnection: () => Promise<any>;
  primaryColor: string;
  secondaryColor: string;
  description: string;
}

export function ApiConnectionStatus({
  className,
  apiName,
  icon,
  checkConnection,
  primaryColor,
  secondaryColor,
  description
}: ApiConnectionStatusProps) {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const { addNotification } = useAppContext();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const statusColors = {
    idle: {
      bg: isDark ? 'bg-slate-800' : 'bg-slate-50',
      border: isDark ? 'border-slate-700' : 'border-slate-200',
      text: isDark ? 'text-slate-300' : 'text-slate-700'
    },
    checking: {
      bg: isDark ? 'bg-blue-950' : 'bg-blue-50',
      border: isDark ? 'border-blue-900' : 'border-blue-200',
      text: isDark ? 'text-blue-400' : 'text-blue-700'
    },
    connected: {
      bg: isDark ? `bg-${primaryColor}-950` : `bg-${primaryColor}-50`,
      border: isDark ? `border-${primaryColor}-900` : `border-${primaryColor}-200`,
      text: isDark ? `text-${primaryColor}-400` : `text-${primaryColor}-700`
    },
    error: {
      bg: isDark ? 'bg-red-950' : 'bg-red-50',
      border: isDark ? 'border-red-900' : 'border-red-200',
      text: isDark ? 'text-red-400' : 'text-red-700'
    }
  };

  useEffect(() => {
    if (connectionStatus === 'connected' || connectionStatus === 'error') {
      setExpanded(true);
    }
  }, [connectionStatus]);

  const handleCheckConnection = async () => {
    setConnectionStatus('checking');
    setPingTime(null);

    const startTime = performance.now();

    try {
      await checkConnection();
      const endTime = performance.now();
      const ping = Math.round(endTime - startTime);
      setPingTime(ping);
      setConnectionStatus('connected');
      setLastChecked(new Date());

      // Показать уведомление
      toast({
        title: `Соединение c ${apiName} установлено`,
        description: `Успешное подключение за ${ping}мс`,
        variant: "default",
      });

      // Сохранить уведомление в БД
      await addNotification({
        title: `Соединение с ${apiName} установлено`,
        message: `Успешное подключение за ${ping}мс`,
        type: "success",
        isRead: false,
        timestamp: Timestamp.now()
      });

    } catch (error) {
      setConnectionStatus('error');

      // Показать уведомление об ошибке
      toast({
        title: `Ошибка подключения к ${apiName}`,
        description: error instanceof Error ? error.message : `Не удалось подключиться к ${apiName}`,
        variant: "destructive",
      });

      // Сохранить уведомление об ошибке в БД
      await addNotification({
        title: `Ошибка подключения к ${apiName}`,
        message: error instanceof Error ? error.message : `Не удалось подключиться к ${apiName}`,
        type: "error",
        isRead: false,
        timestamp: Timestamp.now()
      });
    }
  };

  const getSpeedLabel = () => {
    if (!pingTime) return "";
    if (pingTime < 300) return "Быстрое";
    if (pingTime < 800) return "Среднее";
    return "Медленное";
  };

  const getSpeedClass = () => {
    if (!pingTime) return "";
    if (pingTime < 300) return "text-green-500 dark:text-green-400";
    if (pingTime < 800) return "text-amber-500 dark:text-amber-400";
    return "text-red-500 dark:text-red-400";
  };

  return (
    <div className={cn("rounded-lg border shadow-sm overflow-hidden", isDark ? "border-slate-700" : "", className)}>
      <div className={cn(
        "p-4 flex items-center justify-between",
        statusColors[connectionStatus].bg,
        statusColors[connectionStatus].border
      )}>
        <div className="flex items-center space-x-3">
          <div className={cn(isDark ? `bg-${secondaryColor}-900` : `bg-${secondaryColor}-100`, "p-2 rounded-full")}>
            {icon}
          </div>
          <div>
            <h3 className={cn("font-medium", statusColors[connectionStatus].text)}>
              {apiName}
              {connectionStatus === 'connected' && pingTime && (
                <span className="ml-2 font-normal text-sm">({pingTime} мс)</span>
              )}
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>{description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {connectionStatus === 'connected' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <CheckCircle className={cn(`h-5 w-5 ${isDark ? `text-${primaryColor}-400` : `text-${primaryColor}-500`}`)} />
                    <motion.span
                      className={cn(`absolute -top-0.5 -right-0.5 w-2 h-2 ${isDark ? `bg-${primaryColor}-300` : `bg-${primaryColor}-400`} rounded-full`)}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Соединение установлено</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {connectionStatus === 'error' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <AlertCircle className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                    <motion.span
                      className={`absolute -top-0.5 -right-0.5 w-2 h-2 ${isDark ? 'bg-red-300' : 'bg-red-400'} rounded-full`}
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Соединение не установлено</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Button
            onClick={handleCheckConnection}
            disabled={connectionStatus === 'checking'}
            variant="outline"
            size="sm"
            className={cn(isDark
              ? `border-${secondaryColor}-900 hover:border-${secondaryColor}-700 bg-slate-800`
              : `border-${secondaryColor}-200 hover:border-${secondaryColor}-400`)}
          >
            <motion.div
              animate={{ rotate: connectionStatus === 'checking' ? 360 : 0 }}
              transition={{ duration: 1.5, repeat: connectionStatus === 'checking' ? Infinity : 0, ease: "linear" }}
              className="mr-2"
            >
              {connectionStatus === 'checking' ? (
                <Loader2 className={cn(`h-3.5 w-3.5 ${isDark ? `text-${primaryColor}-400` : `text-${primaryColor}-600`}`)} />
              ) : (
                <RefreshCw className={cn(`h-3.5 w-3.5 ${isDark ? `text-${primaryColor}-400` : `text-${primaryColor}-600`}`)} />
              )}
            </motion.div>
            <span className="text-xs">Проверить</span>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && connectionStatus !== 'idle' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "px-4 py-3",
              isDark ? "bg-slate-800" : "bg-white",
              statusColors[connectionStatus].border,
              "border-t-0"
            )}>
              {connectionStatus === 'checking' && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className={`h-5 w-5 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-500'} mr-3`} />
                  <span className={isDark ? 'text-blue-400' : 'text-blue-700'}>Проверка соединения...</span>
                </div>
              )}

              {connectionStatus === 'connected' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className={cn(`h-4 w-4 ${isDark ? `text-${primaryColor}-400` : `text-${primaryColor}-500`}`)} />
                      <span className={cn(`${isDark ? `text-${primaryColor}-400` : `text-${primaryColor}-700`} text-sm font-medium`)}>
                        Соединение защищено
                      </span>
                    </div>
                    {pingTime !== null && (
                      <div className="flex items-center gap-1">
                        <Zap className={cn("h-3.5 w-3.5", getSpeedClass())} />
                        <span className={cn("text-xs", getSpeedClass())}>
                          {getSpeedLabel()} соединение
                        </span>
                      </div>
                    )}
                  </div>

                  {lastChecked && (
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1`}>
                      <Clock className="h-3 w-3" />
                      Последняя проверка: {lastChecked.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              )}

              {connectionStatus === 'error' && (
                <div className="py-2">
                  <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    Не удалось установить соединение. Проверьте настройки и повторите попытку.
                  </p>
                  {lastChecked && (
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1 mt-2`}>
                      <Clock className="h-3 w-3" />
                      Последняя проверка: {lastChecked.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
